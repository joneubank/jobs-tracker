# Jobs Tracker Server Library
Track progress of Jobs running in your services through kafka notifications.

This library includes all the code the powers the standalone [Jobs Tracker Server](../server), exporting the core libraries so you can interact with them in a NodeJS application. You may choose to use this if you have a need for an expanded query API, or want to perform custom data processing to the jobs data.

> __Note__: This is not the [library for sending job update messages](../client) to the tracker! This is the server code, intended for integrating that functionality into another NodeJS server application. For the Job Tracker Client

## Contents
This library exposes the following components:
* express router for the jobs query API
* Kafka message consumer client
* processor for handling job update messages
* library to interact with the MongoDB data directly
* library to interact with the Elasticsearch indexed data directly
* processors for syncing MongoDB data to Elasticsearch

## Developer Guide

> TODO: This section will be expanded... but for now, take a look at the [server](../server) code to see how to integrate this library with a standalone application.