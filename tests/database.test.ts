import { describe, it, expect } from "@jest/globals";
import connectDB from "../src/database/connect.database";
// import { connect as mongooseConnect } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Mock the mongoose library
// jest.mock("mongoose");

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  process.env["MONGO_URL"] = mongoURI;
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("Database Test", () => {
  it("should connect to the database", async () => {
    // const MONGO_URI: string = process.env["MONGO_URL"] || "";
    // Mock console.log
    const consoleLogSpy = jest.spyOn(console, "log");

    // set up the mock behavior for connect
    // (mongooseConnect as jest.Mock).mockResolvedValueOnce(undefined);

    // call the connectDB function
    await connectDB();

    // assert that connect was called with the correct URI
    // expect(mongooseConnect).toHaveBeenCalledWith(MONGO_URI);

    // assert that console.log was called with the success message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("🟢 Database connected successfully: ")
    );

    // restore console.log
    consoleLogSpy.mockRestore();

    // assert that the success message is logged
    //   expect(console.log).toHaveBeenCalledWith(
    //     `🟢 Database connected successfully: undefined`
    //   );
  });

  //   it("should return an error if the database connection fails", async () => {
  //     const MONGO_URI: string = process.env["MONGO_URL"] || "";

  //     // set up the mock behavior for connect
  //     (mongooseConnect as jest.Mock).mockRejectedValueOnce(
  //       new Error("Could not connect to the database")
  //     );

  //     // use expect.assertions to ensure that assertions are called
  //     expect.assertions(2);

  //     try {
  //       // call the connectDB function
  //       await connectDB();
  //     } catch (error) {
  //       // assert that connect was called with the correct URI
  //       expect(mongooseConnect).toHaveBeenCalledWith(MONGO_URI);

  //       // assert that the error message is logged
  //       //   expect(console.log).toHaveBeenCalledWith("🔴 Database connection failed");

  //       // assert that the error message is logged
  //       expect(console.error).toHaveBeenCalledWith(
  //         new Error("Could not connect to the database").message
  //       );
  //     }
  //   });
});
