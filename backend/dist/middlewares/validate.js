import { HttpError } from "./error-handler.js";
const serializeIssues = (issues) => issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
}));
export const validate = (schema, target = "body") => (req, _res, next) => {
    try {
        const parsed = schema.parse(req[target]);
        req[target] = parsed;
        return next();
    }
    catch (error) {
        if (error instanceof Error && "issues" in error) {
            const zodErr = error;
            throw new HttpError(422, "Validation failed", serializeIssues(zodErr.issues));
        }
        return next(error);
    }
};
//# sourceMappingURL=validate.js.map