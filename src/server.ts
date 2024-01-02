import * as http from "node:http";

const server: http.Server = http.createServer(
  (_req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  }
);

server.listen(3000);
