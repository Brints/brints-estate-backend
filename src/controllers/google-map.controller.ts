// import { Request } from "express";
// import { StatusCodes } from "http-status-codes";

// import tryCatch from "../utils/lib/try-catch.lib";
// import { successResponse, errorResponse } from "../utils/lib/response.lib";

// import { GoogleCoordinates } from "../models/google-coordinates.model";
// import { IGoogleCoordinates, RegisterGoogleCoordinatesRequestBody, GoogleCoordinatesObject, GoogleCoordinatesResponse, SuccessResponseData, GoogleCoordinatesError } from "../@types/google-coordinates";

// // Request<unknown, unknown, RegisterGoogleCoordinatesRequestBody>

// export class GoogleMapController {
//     static createGoogleCoordinates = async (
//         req: GoogleCoordinatesObject,
//         res: GoogleCoordinatesResponse
//     ): Promise<void> => {}
// }

// export const registerGoogleCoordinates = async (
//   req: Request<unknown, unknown, RegisterGoogleCoordinatesRequestBody>,
//   res: ResponseData<GoogleCoordinatesResponse>
// ): Promise<void> => {
//   try {
//     const { lat, long } = req.body;

//     const googleCoordinates: IGoogleCoordinates = new GoogleCoordinates({
//       lat,
//       long,
//     });

//     await googleCoordinates.save();

//     res.status(StatusCodes.CREATED).json({
//       message: "Google coordinates registered",
//       payload: googleCoordinates,
//       statusCode: StatusCodes.CREATED,
//     });
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       error: {
//         type: "server_error",
//         message: error.message,
//         statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       },
//     });
//   }
// };
