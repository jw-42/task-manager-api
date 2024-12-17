import type { StatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
  status: StatusCode;

  constructor(status: StatusCode, message: string) {
    super();
    this.status = status;
    this.message = message;
  }

  static badRequest(message?: string) {
    return new ApiError(400, `One of the parameters is invalid or not provided${message ? `: ${message}` : ''}`);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "forbidden") {
    return new ApiError(403, `Access denied: ${message}`);
  }

  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  static notAllowed(message: string = "Method Not Allowed") {
    return new ApiError(405, message);
  }

  static tooManyRequests(message: string = "Too many requests") {
    return new ApiError(429, message);
  }

  static unavailableForLegalReasons(message: string) {
    return new ApiError(451, message);
  }

  static internal(message?: string) {
    return new ApiError(500, `Internal Server Error${message ? `: ${message}` : ''}`);
  }
}
