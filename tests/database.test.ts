import { describe, it, expect } from "@jest/globals";
import connectDB from "../src/database/connect.database";
import { connect } from "mongoose";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
  connection: {
    host: "localhost",
  },
}));

describe("connectDB", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    // This will spy on console.log calls
    consoleLogSpy = jest.spyOn(console, "log");
  });

  afterEach(() => {
    // This will reset all mocks after each test
    jest.resetAllMocks();
  });

  afterAll(() => {
    // This will restore console.log to its original state after all tests
    consoleLogSpy.mockRestore();
  });
  it("should connect to the database", async () => {
    process.env["MONGO_URL"] = "mongodb://localhost:27017/test";
    await connectDB();
    expect(connect).toHaveBeenCalledWith("mongodb://localhost:27017/test");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "🟢 Database connected successfully: localhost"
    );
  });

  it("should handle connection errors", async () => {
    (connect as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Connection error");
    });
    await connectDB();
    expect(consoleLogSpy).toHaveBeenCalledWith("🔴 Database connection failed");
  });
});
