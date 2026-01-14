/**
 * Standardizes API responses to { success, data, error } format
 */
module.exports = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        // If the data is already in the standard format, just send it
        if (data && typeof data === 'object' && ('success' in data)) {
            return originalJson.call(this, data);
        }

        // Otherwise, wrap it
        const wrappedData = {
            success: res.statusCode < 400,
            data: data,
            error: res.statusCode >= 400 ? (data.error || data.message || 'Error occurred') : null
        };

        // If it's an error and we have a Success=false flag already, use it
        if (data && data.success === false) {
            wrappedData.success = false;
            wrappedData.error = data.error || data.message;
            delete data.success;
            delete data.error;
        }

        return originalJson.call(this, wrappedData);
    };

    next();
};
