# ---------------------------------------------------------
# Misc.
# ---------------------------------------------------------

.DEFAULT_GOAL := build
TEMPLATE_DIR := .
BUILD_DIR := build
TEMP_DIR := test

# ---------------------------------------------------------
# Build a new project.
# ---------------------------------------------------------

.PHONY: build
.SILENT: build
build: clean
	cookiecutter $(TEMPLATE_DIR) --no-input -o $(BUILD_DIR)
	TARGET_DIR=$$(ls -d $(BUILD_DIR)/* | head -n 1) &&\
	$(MAKE) --no-print-directory -C "$$TARGET_DIR" 

# ---------------------------------------------------------
# Test the cookiecutter template.
# ---------------------------------------------------------

.PHONY: test
.SILENT: test
test: clean-test
	cookiecutter $(TEMPLATE_DIR) --no-input -o $(TEMP_DIR)
	TARGET_DIR=$$(ls -d $(TEMP_DIR)/* | head -n 1) &&\
	$(MAKE) --no-print-directory -C "$$TARGET_DIR" test-containers &&\
	$(MAKE) --no-print-directory clean-test

# ---------------------------------------------------------
# Clean the test directory.
# ---------------------------------------------------------

.PHONY: clean-test
.SILENT: clean-test
clean-test:
	rm -rf $(TEMP_DIR)

# ---------------------------------------------------------
# Clean the build directory.
# ---------------------------------------------------------

.PHONY: clean
.SILENT: clean
clean:
	rm -rf $(BUILD_DIR) $(TEMP_DIR)
