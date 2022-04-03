# Jobs Tracker

Collect in a single service the status of jobs running throughout your system.

The **[server](apps/server)** application will receive status updates for jobs running on other services. These updates can be provided through an API or through integration with Kafka. The status of all jobs will be stored in a MongoDB and can optionally be replicated to Elasticsearch to enable custom search interfaces.

The **[client](apps/client)** service can be included in another NodeJS application to track jobs running in that application and send messages to Kafka whenever it is updated (creation, progress, completion, errors, etc.) .

At a highlevel, the Job Tracker integrated into a system would look like the following:

![Job Tracker in Service Architecture Diagram](resources/Application%20Summary.png)

## Monorepo

This codebase has been built as a monorepo using [RushJS](https://rushjs.io/). This allows a common data model and other libraries to be shared between the server and client applications.

To get started working with the code in this repo, you can read the [Getting Started](https://rushjs.io/pages/intro/get_started/) page for RushJS, or follow the steps in the Quick Start below.

### Components and Dependency Tree

This repo contains two published NPM libraries and one standalone docker image hosted on ghcr, as well as several shared libraries:

![Job Tracker Monorepo Dependency Tree](resources/MonoRepo%20Dependency%20Tree.png)

| Component | Type | Path | Published Location | Description |
| --------- | ---- | ---- | ------------------ | ----------- |
| [server](libraries/server/) | App | apps/server/ | GHCR (Link TBD) | Standalone server application shared as Docker Image.
| [jobs-tracker](libraries/server/) | App | apps/tracker/ | NPM (Link TBD) | NPM Library providing the functionality of the Jobs Tracker server for integration with another NodeJS application.
| [data-model](libraries/data-model/) | Library | libraries/data-model/ | N/A | Common TypeScript types, validations, and utilities shared across server and client application.
| [logger](libraries/logger/)         | Library | libraries/logger/     | N/A | Shared logger formatting across repo.

### Quick Start: Jobs Tracker Dev

1. Install RushJS globally: `npm install -g @microsoft/rush`

1. Update and Build all:
```
rush update
rush build
```

1. TODO: Run tracker and demo app in dev mode with auto building?

## Planned Enhancements

- Server Update API - no external queue dependency needed, can communicate directly over HTTP
- Search API - query for jobs on ES
- UI to explore tracked job status, using Search API
