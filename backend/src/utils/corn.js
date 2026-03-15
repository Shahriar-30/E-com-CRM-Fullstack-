import cron from "node-cron";

export const startSegmentCron = (fun) => {
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("Running segment engine...");
      await fun();
      console.log("Segment engine finished");
    } catch (error) {
      console.error("Segment engine error:", error);
    }
  });
};
