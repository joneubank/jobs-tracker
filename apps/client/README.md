# Job Tracker Client

Library to track jobs running in a service. The client will send job event messages to kafka as the job progresses through its lifecycle for the job tracker server to keep a record of.

## Developer Guide

Three easy steps to start using this library to start tracking your jobs:

1. Install package: `npm install @joneubank/job-tracker-client`

1. Import and create client. See the API for all configuration details, but you will at minimum need to provide the name of the service (`demo-application` in the example) and Kafka broker connection details
    ```typescript
    import createJobTracker from '@joneubank/job-tracker-client';

    const jobTrackerClient = createJobTracker({
      kafka: {
        brokers: ['localhost:9092'],
        clientId: 'demo-application-job-tracker-client',
      },
      service: 'demo-application',
      node: process.env.NODE, // optionally give a node name (define your own env variables)
    });
    ```

1. Use the client to track a job:

    ```typescript
    async function longRunningJob(args: LongRunningJobInputs) {
      // Create a TrackedJob
      const job = await jobTrackerClient.createJob({ name: 'longRunningJob', inputs: args });

      try {
        // Do some work
        await job.progress(0.2, { extraProgressInfo: 'Job has started well', totalStepsCompleted: 2000 });

        // Do some more work
        await job.progress(0.5, { extraProgressInfo: 'Job is going great', totalStepsCompleted: 5000 });

        // Do even more work
        await job.progress(0.8, { extraProgressInfo: 'Job is nearly done', totalStepsCompleted: 8000 });

        // Finish the job!
        await job.complete({ extraProgressInfo: 'That was probably the best job ever', totalStepsCompleted: 10000 });
      } catch (err) {
        // Something went wrong!
        await job.error(`Job failed because of a terrible error! ${err.message()}`, {
          extraProgressInfo: 'Job ended terribly!',
        });
      }
    }
    ```

### Delayed Jobs (Queued or Scheduled)
