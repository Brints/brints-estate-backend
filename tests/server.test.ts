// server.test.ts
import { Server } from "node:http";
import { server, startServer } from "../src/server";

describe("Server", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("should start server successfully", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await startServer();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "🚀 Server started successfully on port " + process.env["PORT"] || 1234
    );
    (server as Server).close();
  });
});