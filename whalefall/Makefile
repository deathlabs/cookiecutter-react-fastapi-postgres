# ---------------------------------------------------------
# Default settings.
# ---------------------------------------------------------

# Use Bash as the default shell.
SHELL := /bin/bash

# Set the default Make target.
.DEFAULT_GOAL := test-containers

# Tell Docker Compose to use Bake for builds.
export COMPOSE_BAKE := true

# Set the default Docker Compose profile.
DOCKER_COMPOSE_PROFILE ?= all

# Set the default environment used.
export ENV_FILE ?=

# Set app metadata.
APP := whalefall
DEPLOYMENT_SLUG := whalefall

# Set container metadata.
DATABASE_BUILD_CONTEXT := database
DATABASE_DOCKERFILE_PATH := $(DATABASE_BUILD_CONTEXT)/Dockerfile
DATABASE_CONTAINER_IMAGE := $(APP)/$(DATABASE_BUILD_CONTEXT):latest
DATABASE_CONTAINER := $(APP)_$(DATABASE_BUILD_CONTEXT)
DATABASE_SBOM_PATH := $(APP)-$(DATABASE_BUILD_CONTEXT)-sbom.json
DATABASE_VEX_YAML_PATH := $(DATABASE_BUILD_CONTEXT)/vex.yaml
DATABASE_VEX_JSON_PATH := $(DATABASE_BUILD_CONTEXT)/vex.json

BACKEND_BUILD_CONTEXT := backend
BACKEND_PROJECT_PATH := $(BACKEND_BUILD_CONTEXT)/$(APP)
BACKEND_DOCKERFILE_PATH := $(BACKEND_BUILD_CONTEXT)/Dockerfile
BACKEND_CONTAINER_IMAGE := $(APP)/$(BACKEND_BUILD_CONTEXT):latest
BACKEND_CONTAINER := $(APP)_$(BACKEND_BUILD_CONTEXT)
BACKEND_SBOM_PATH := $(APP)-$(BACKEND_BUILD_CONTEXT)-sbom.json
BACKEND_VEX_YAML_PATH := $(BACKEND_BUILD_CONTEXT)/vex.yaml
BACKEND_VEX_JSON_PATH := $(BACKEND_BUILD_CONTEXT)/vex.json
ALEMBIC_VERSIONS_PATH := $(BACKEND_PROJECT_PATH)/alembic/versions

FRONTEND_BUILD_CONTEXT := frontend
FRONTEND_DOCKERFILE_PATH := $(FRONTEND_BUILD_CONTEXT)/Dockerfile
FRONTEND_CONTAINER_IMAGE := $(APP)/$(FRONTEND_BUILD_CONTEXT):latest
FRONTEND_CONTAINER := $(APP)_$(FRONTEND_BUILD_CONTEXT)
FRONTEND_SBOM_PATH := $(APP)-$(FRONTEND_BUILD_CONTEXT)-sbom.json
FRONTEND_VEX_YAML_PATH := $(FRONTEND_BUILD_CONTEXT)/vex.yaml
FRONTEND_VEX_JSON_PATH := $(FRONTEND_BUILD_CONTEXT)/vex.json

# Set VEX metadata.
VEX_AUTHOR ?= {{ cookiecutter.author }}
VEX_ID_BASE ?= $(APP)

# Set scanner configuration and thresholds.
SEMGREP_CONFIG ?= auto
HADOLINT_FAILURE_THRESHOLD ?= warning
GRYPE_FAILURE_THRESHOLD ?= medium

# ---------------------------------------------------------
# Update uv.lock.
# ---------------------------------------------------------

.PHONY: lock
.SILENT: lock
lock:
	echo "[*] Locking $(APP)'s backend Python dependencies"
	cd "$(BACKEND_PROJECT_PATH)" && uv lock

# ---------------------------------------------------------
# Reset the Alembic migration source.
# ---------------------------------------------------------

.PHONY: migrate
.SILENT: migrate
migrate:
	echo "[*] Migrating $(APP)'s backend object models"
	rm -f "$(ALEMBIC_VERSIONS_PATH)"/*.py
	rm -rf "$(ALEMBIC_VERSIONS_PATH)/__pycache__"
	cd "$(BACKEND_PROJECT_PATH)" &&\
	uv run alembic -c alembic.ini revision --autogenerate

# ---------------------------------------------------------
# Check the source code for quality.
# ---------------------------------------------------------

.PHONY: check
.SILENT: check
check:
	echo "[*] Checking $(APP)'s source code quality"
	ruff check --fix $(BACKEND_BUILD_CONTEXT)

# ---------------------------------------------------------
# Format the source code.
# ---------------------------------------------------------

.PHONY: format
.SILENT: format
format:
	echo "[*] Formatting $(APP)'s source code"
	ruff format $(BACKEND_BUILD_CONTEXT)

# ---------------------------------------------------------
# Check the repository for secrets.
# ---------------------------------------------------------

.PHONY: secrets
.SILENT: secrets
secrets:
	echo "[*] Checking $(APP)'s source code for secrets"
	trufflehog filesystem \
		--no-update \
		--fail \
		--fail-on-scan-errors \
		--results=verified,unknown \
		--log-level=-1 \
		--exclude-paths trufflehog-exclusions.txt .

# ---------------------------------------------------------
# Check the Dockerfiles for quality.
# ---------------------------------------------------------

.PHONY: dockerfile-lint
.SILENT: dockerfile-lint
dockerfile-lint:
	echo "[*] Checking $(APP)'s Dockerfiles for lint"
	hadolint --failure-threshold "$(HADOLINT_FAILURE_THRESHOLD)" \
		"$(DATABASE_DOCKERFILE_PATH)" \
		"$(BACKEND_DOCKERFILE_PATH)" 

# ---------------------------------------------------------
# Check for first-party vulnerabilities.
# ---------------------------------------------------------

.PHONY: sast
.SILENT: sast
sast:
	echo "[*] Checking $(APP)'s source code for first-party vulnerabilities"
	semgrep scan --config "$(SEMGREP_CONFIG)" \
		--include $(DATABASE_BUILD_CONTEXT) \
		--include $(BACKEND_BUILD_CONTEXT) 

# ---------------------------------------------------------
# Build the container images.
# ---------------------------------------------------------

.PHONY: build-containers
.SILENT: build-containers
build-containers: lock check format secrets dockerfile-lint sast
	echo "[*] Building $(APP)'s container image"
	docker compose --profile $(DOCKER_COMPOSE_PROFILE) build

# ---------------------------------------------------------
# Generate a VEX file for the container images.
# ---------------------------------------------------------

define VEX_FILTER
{
  "@context": "https://openvex.dev/ns/v0.2.0",
  "@id": strenv(VEX_ID),
  "author": strenv(VEX_AUTHOR),
  "timestamp": strenv(VEX_TIMESTAMP),
  "version": 1,
  "statements": [
    .advisories[] | {
      "vulnerability": {
        "name": .vulnerability
      },
      "products": [
        .products[] | {
          "@id": .
        }
      ],
      "status": .status,
      "justification": .justification,
      "impact_statement": .impact_statement
    }
  ]
}
endef

export VEX_FILTER

.PHONY: vex
.SILENT: vex
vex:
	echo "[*] Generating VEX statements for $(APP)'s database"
	VEX_ID="$(VEX_ID_BASE)" \
	VEX_AUTHOR="$(VEX_AUTHOR)" \
	VEX_TIMESTAMP="$$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
	yq -o=json "$$VEX_FILTER" "$(DATABASE_VEX_YAML_PATH)" > "$(DATABASE_VEX_JSON_PATH)"

	echo "[*] Generating VEX statements for $(APP)'s backend"
	VEX_ID="$(VEX_ID_BASE)" \
	VEX_AUTHOR="$(VEX_AUTHOR)" \
	VEX_TIMESTAMP="$$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
	yq -o=json "$$VEX_FILTER" "$(BACKEND_VEX_YAML_PATH)" > "$(BACKEND_VEX_JSON_PATH)"

# ---------------------------------------------------------
# Generate an SBOM for the container images.
# ---------------------------------------------------------

.PHONY: sbom
.SILENT: sbom
sbom: build-containers
	echo "[*] Generating $(APP)'s database SBOM"
	syft $(DATABASE_CONTAINER_IMAGE) -o cyclonedx-json="$(DATABASE_SBOM_PATH)"

	echo "[*] Generating $(APP)'s backend SBOM"
	syft $(BACKEND_CONTAINER_IMAGE) -o cyclonedx-json="$(BACKEND_SBOM_PATH)"

# ---------------------------------------------------------
# Check for third-party vulnerabilities.
# ---------------------------------------------------------

.PHONY: dependency-scan
.SILENT: dependency-scan
dependency-scan: sbom vex
	echo "[*] Updating the Grype vulnerability database"
	grype db update

	echo "[*] Checking $(APP)'s database SBOM for third-party vulnerabilities"
	grype sbom:"$(DATABASE_SBOM_PATH)" --vex "$(DATABASE_VEX_JSON_PATH)" --fail-on "$(GRYPE_FAILURE_THRESHOLD)"

	echo "[*] Checking $(APP)'s backend SBOM for third-party vulnerabilities"
	grype sbom:"$(BACKEND_SBOM_PATH)" --vex "$(BACKEND_VEX_JSON_PATH)" --fail-on "$(GRYPE_FAILURE_THRESHOLD)"

# ---------------------------------------------------------
# Start the containers.
# ---------------------------------------------------------

.PHONY: start-containers
.SILENT: start-containers
start-containers: dependency-scan
	docker compose --profile $(DOCKER_COMPOSE_PROFILE) up -d

# ---------------------------------------------------------
# Check the status of the containers.
# ---------------------------------------------------------

.PHONY: status
.SILENT: status
status:
	docker compose --profile $(DOCKER_COMPOSE_PROFILE) ps --format "table {{.Name}}\t{{.Ports}}\t{{.Status}}"

# ---------------------------------------------------------
# Test the containers.
# ---------------------------------------------------------

.PHONY: test-containers
.SILENT: test-containers
test-containers: start-containers
	echo "[*] Testing $(APP)"
#	cd tests && uv run python main.py
	$(MAKE) -s stop-containers
	$(MAKE) -s remove-container-images

# ---------------------------------------------------------
# Stop the containers.
# ---------------------------------------------------------

.PHONY: stop-containers
.SILENT: stop-containers
stop-containers:
	docker compose --profile $(DOCKER_COMPOSE_PROFILE) down

# ---------------------------------------------------------
# Remove the container images.
# ---------------------------------------------------------

.PHONY: remove-container-images
.SILENT: remove-container-images
remove-container-images:
	docker compose --profile $(DOCKER_COMPOSE_PROFILE) down --rmi all

# ---------------------------------------------------------
# Deploy the Zarf package.
# ---------------------------------------------------------

.PHONY: deploy
.SILENT: deploy

deploy: dependency-scan
	uds zarf package create --confirm &&\
	uds zarf package deploy zarf-package-$(DEPLOYMENT_SLUG)-amd64-0.1.0.tar.zst --confirm

# ---------------------------------------------------------
# Remove the Zarf package.
# ---------------------------------------------------------

.PHONY: remove
.SILENT: remove

remove:
	uds zarf package remove $(DEPLOYMENT_SLUG) --confirm || true &&\
	uds zarf tools kubectl delete namespace $(DEPLOYMENT_SLUG) --ignore-not-found

# ---------------------------------------------------------
# Remove UDS finalizers.
# ---------------------------------------------------------

.PHONY: remove-finalizers
.SILENT: remove-finalizers

remove-finalizers:
	kubectl patch packages.uds.dev $(DEPLOYMENT_SLUG) -n $(DEPLOYMENT_SLUG) --type=merge -p '{"metadata":{"finalizers":[]}}'
