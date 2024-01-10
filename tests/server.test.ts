// import * as request from 'supertest'
import { SuperTest, Test, agent as requestAgent } from "supertest";
import app from "../src/app";
import { StatusCodes } from "http-status-codes";
import { describe, it, expect } from "@jest/globals";

describe("Server Test", () => {
  it("should respond with 200 status for GET /", async () => {
    const testRequest = requestAgent(app) as unknown as SuperTest<Test>;
    const response = await testRequest.get("/");
    expect(response.statusCode).toBe(StatusCodes.OK);
  });
});
