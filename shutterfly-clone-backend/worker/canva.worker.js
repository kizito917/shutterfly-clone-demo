const { parentPort, workerData } = require("worker_threads");
const {
  getUserClient,
  poll,
  getDesignExportJobStatus,
} = require("../helpers/canva.helper");
const fs = require("fs");
const path = require("path");
const db = require("../models");

const runJob = async (jobDetails) => {
  const result = await poll(() =>
    getDesignExportJobStatus(jobDetails.jobId, getUserClient(jobDetails.token))
  );

  if (result.job.status === "success") {
    const fileUrl = result.job.urls[0];
    if (!fileUrl) {
      throw new Error("Failed to get export");
    }

    // Fetch and update db with image (replace)
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();

    const design = await db.UserImage.findOne({
      where: { id: jobDetails.designId },
    });

    const assetPath = path.join(
      __dirname,
      "..",
      "assets",
      "images",
      path.basename(design.imagePath)
    );
    fs.writeFileSync(assetPath, Buffer.from(buffer));
  }
  return Promise.resolve();
};

runJob(workerData)
  .then((res) => {
    parentPort.postMessage(res);
  })
  .catch((err) => {
    console.log(err);
    parentPort.emit("messageerror", err);
  });
