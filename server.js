const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8788;
const ROOT = path.join(__dirname, "public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

http.createServer((req, res) => {
  const p = path.normalize(
    decodeURIComponent(req.url.split("?")[0])
  ).replace(/^(\.\.[/\\])+/, "");

  const f = path.join(ROOT, p === "/" || p === "\\" ? "index.html" : p);

  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404);
    return res.end("not found");
  }

  res.writeHead(200, {
    "Content-Type": TYPES[path.extname(f)] || "application/octet-stream",
  });

  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => {
  console.log(`Planner running at http://localhost:${PORT}`);
});
