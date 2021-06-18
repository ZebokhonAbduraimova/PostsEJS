const createError = (message, statusCode, displayErrorPage) => {
  let error = new Error(message);
  error.statusCode = statusCode;
  error.displayErrorPage = displayErrorPage;
  return error;
};

module.exports = {
  NotFoundError: createError("Not Found", 404, true),
  InvalidRequestBodyError: createError("Invalid Request Body", 400, false),
  InternalServerError: createError("Internal Server Error", 500, true),
  UnauthorizedError: createError("Unauthorized", 401, false),
  ForbiddenError: createError("Access Forbidden", 403, true),
  FileMimeTypeError: createError("File MIME Type Error", 400, false),
  FileEmptyError: createError("File Not Attached", 400, false),
};
