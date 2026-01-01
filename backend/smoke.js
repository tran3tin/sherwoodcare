const http = require("http");

const url = process.env.SMOKE_URL || "http://localhost:3000/api/health";

http
  .get(url, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      if (res.statusCode === 200) {
        console.log("SMOKE OK:", body);
        process.exit(0);
      } else {
        console.error("SMOKE FAILED:", res.statusCode, body);
        process.exit(2);
      }
    });
  })
  .on("error", (err) => {
    console.error("SMOKE ERROR", err.message);
    process.exit(3);
  });
