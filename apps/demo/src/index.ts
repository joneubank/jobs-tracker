import createJobClient from '@joneubank/jobs-tracker-client';
import { TrackedJob } from '@joneubank/jobs-tracker-client/dist/TrackedJob';

async function initDemo() {
  let eventCount: number = 0;
  let activeJob: TrackedJob;
  const jobClient = await createJobClient({
    kafka: {
      config: { brokers: ['localhost:9092'] },
      topic: 'jobs-tracker-updates',
    },
    service: 'demo-service',
  });
  async function doSomething() {
    switch (true) {
      case eventCount % 5 === 0:
        // create new job
        activeJob = jobClient.createJob('demo-job');
        break;
      case eventCount % 5 === 4:
        // create new job
        activeJob.complete();
        break;
      default:
        activeJob.progress((eventCount % 5) * 25);
        break;
    }

    eventCount += 1;
  }

  setInterval(doSomething, 2000);
}

initDemo();
