import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { initializeReportSchedulers } from "./schedulers/report.scheduler.js";
const { PORT } = env;
const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await prisma.$disconnect();
    process.exit(0);
};
initializeReportSchedulers();
const server = app.listen(PORT, () => {
    console.log(`🚀 API listening on port ${PORT}`);
});
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
export default server;
//# sourceMappingURL=server.js.map