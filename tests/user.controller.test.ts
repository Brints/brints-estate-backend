// import { IUser } from "../src/@types";
import { registerUser } from "../src/controllers/user.controller";
import { User } from "../src/models/user.model";
import { registerEmailTemplate } from "../src/services/email-templates.service";

jest.mock("../src/models/user.model");
jest.mock("../src/services/email-templates.service");

describe("Register User", () => {
  it("should register a new user successfully", async () => {
    const mockRequest = {
      body: {
        image: "test.jpg",
        fullname: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        gender: "male",
        password: "password",
        confirmPassword: "password",
      },
      files: null,
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // User.findOne.mockResolvedValue(null)
    (User.findOne as jest.Mock).mockResolvedValue(null);
    User.findOne.mockResolvedValue([]);
    registerEmailTemplate.mockResolvedValue();

    await registerUser(mockRequest, mockResponse);

    expect(User.findOne).toHaveBeenCalledWith({
      email: mockRequest.body.email,
    });
    expect(User.find).toHaveBeenCalled();
    expect(registerEmailTemplate).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
