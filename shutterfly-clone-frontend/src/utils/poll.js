export const poll = async (
  job, // () => Promise<T>,
  opts = {}
) => {
  const {
    initialDelayMs = 500,
    increaseFactor = 1.6,
    maxDelayMs = 10 * 1_000,
  } = opts;

  const exponentialDelay = (n) =>
    Math.min(initialDelayMs * Math.pow(increaseFactor, n), maxDelayMs);

  const pollJob = async (attempt = 0) => {
    const delayMs = exponentialDelay(attempt);
    const statusResult = await job();

    const status = statusResult.job.status.toLocaleLowerCase();

    switch (status) {
      case "success":
      case "failed":
        return statusResult;
      case "in_progress":
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
        return pollJob(attempt + 1);
      default:
        throw new Error(`Unknown job status ${status}`);
    }
  };

  return pollJob();
};
