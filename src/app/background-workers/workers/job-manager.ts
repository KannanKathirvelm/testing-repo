import { BackgroundTaskJob } from '@app/background-workers/models';

interface JobWrapper {
  job: BackgroundTaskJob;
  canceled?: boolean;
}

export class JobManager {
  private pendingJobs: Map<string, JobWrapper> = new Map<string, JobWrapper>();

  public cancelJob = (jobId: string) => {
    this.pendingJobs.get(jobId).canceled = true;
  }

  public performJob = (
    job: BackgroundTaskJob,
    onJobOver: (job: BackgroundTaskJob, result: any, success: boolean) => void,
  ) => {
    this.pendingJobs.set(job.id, {
      job,
    });
    this.execute(job.http).then((result) => {
      onJobOver(job, result, true);
    }).catch(() => {
      onJobOver(job, null, false);
    })
  }

  public execute(request) {
    return new Promise((resolve, reject) => {
      let url = request.url;
      const params = request.queryParams;
      if (params) {
        const query = Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&');
        url += '?' + query;
      }
      fetch(url, {
        method: request.method,
        mode: 'cors',
        headers: request.headers,
        body: request.body || undefined
      }).then((response) => {
        resolve(response.json());
      }).catch((error) => {
        reject(error)
      });
    });
  }
}




