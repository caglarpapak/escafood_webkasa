export const decimalToNumber = (value) => {
    if (value === null || value === undefined)
        return 0;
    if (typeof value === "number")
        return value;
    if (typeof value === "string")
        return Number(value);
    if (typeof value.toNumber === "function") {
        return value.toNumber();
    }
    if (typeof value.toString === "function") {
        return Number(value.toString());
    }
    return Number(value);
};
//# sourceMappingURL=decimal.js.map