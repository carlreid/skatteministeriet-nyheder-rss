import { runAllTests } from "./rss.test.js";

(async () => {
  try {
    runAllTests();
    console.log("All tests passed");
  } catch (err) {
    console.error("Tests failed:", err);
    process.exit(1);
  }
})();
