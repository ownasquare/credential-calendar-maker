import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
/** @type {Record<string, string>} */
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const target = normalize(join(root, relative));
  if (!target.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if (!statSync(target).isFile()) throw new Error("not a file");
    response.writeHead(200, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(
    `Credential Calendar Maker listening on http://127.0.0.1:${port}`,
  );
});
