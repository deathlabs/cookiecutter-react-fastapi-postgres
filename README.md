# `cookiecutter-react-fastapi-postgres`

[![CI Pipeline](https://github.com/deathlabs/cookiecutter-react-fastapi-postgres/actions/workflows/ci.yaml/badge.svg)](https://github.com/deathlabs/cookiecutter-react-fastapi-postgres/actions/workflows/ci.yaml)

A [cookiecutter](https://cookiecutter.readthedocs.io) template for creating a full-stack app consisting of a React frontend, FastAPI backend, and PostgreSQL database. 

## Quickstart

The instructions below assume you have or will get the following software installed: [Make](https://www.gnu.org/software/make/), [Docker](https://docs.docker.com/get-started/get-docker/), [uv](https://docs.astral.sh/uv/), [Ruff](https://docs.astral.sh/ruff/), [Semgrep](https://semgrep.dev/), [TruffleHog](https://github.com/trufflesecurity/trufflehog), [Hadolint](https://github.com/hadolint/hadolint), [Syft](https://github.com/anchore/syft#installation), [Grype](https://github.com/anchore/grype#installation), [yq](https://github.com/mikefarah/yq), and [cookiecutter](https://github.com/cookiecutter/cookiecutter). Ruff, Semgrep, TruffleHog, Hadolint, Syft, and Grype are used in our development workflow to help identify and reduce security risks introduced by this cookiecutter template.

### Option 1

Start here if you want to jump into creating an app without exploring the `cookiecutter` template first.

**Step 1.** Run `cookiecutter` against this repository.

```bash
cookiecutter https://github.com/deathlabs/cookiecutter-react-fastapi-postgres.git
```

When prompted, either accept the default values or provide your own.

**Step 2.** Change directories to the app you just you created. 

**Step 3.** Use the Makefile to create, start, and test your app.

```bash
make
```

### Option 2

Start here if you want to explore the `cookiecutter` template before using it on a real project.

**Step 1.** Clone the repository.

```bash
git clone https://github.com/deathlabs/cookiecutter-react-fastapi-postgres.git
```

**Step 2.** Change directories to the repository you just downloaded.

```bash
cd cookiecutter-react-fastapi-postgres
```

**Step 3.** Use the Makefile to create, start, and test an example app. The Makefile places the created app in the `build` folder, in a subfolder named after the server.

```bash
make
```

**Step 4.** Open the created app (replace `<project-name>` with the actual name of your project).

```bash
cd build/<project-name>
```

## Cleaning Up

To stop your app and delete its container images, enter the commands below from the root directory of your project.

```bash
make stop-containers
make remove-containers
make remove-container-images
```
