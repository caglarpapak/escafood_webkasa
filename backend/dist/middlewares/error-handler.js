export class HttpError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
    const status = err instanceof HttpError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    const response = { message };
    if (err instanceof HttpError && err.details) {
        response.details = err.details;
    }
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }
    res.status(status).json(response);
};
//# sourceMappingURL=error-handler.js.map