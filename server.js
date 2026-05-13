const { createServer } = require("node:http");
const next = require("next");

const hostname = "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Server ready on http://${hostname}:${port}`);
  });
});
