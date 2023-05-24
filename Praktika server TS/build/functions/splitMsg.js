export const splitMsg = (msg) => {
    const index = msg.indexOf(":");
    const result = [msg.substring(0, index), msg.substring(index + 1)];
    const encryptedData = result[1].trim();
    const encryptedType = Number(result[0].trim());
    return { encryptedType, encryptedData };
};
//# sourceMappingURL=splitMsg.js.map