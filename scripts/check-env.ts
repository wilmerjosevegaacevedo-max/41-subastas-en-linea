import { environmentReport } from "../app/shared/server/env";

const report = environmentReport();
console.table(report);

const hasIssues = Object.values(report).some((status) => status !== "PRESENTE");
if (hasIssues) {
  process.exitCode = 1;
}
