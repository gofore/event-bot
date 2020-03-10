

exports.log = function (msg) {
    if (exports.isLoggingOn()) {
        exports.logMessage(msg);
    }
}


exports.logMessage = function (msg) {
    console.log(msg);
}


exports.isLoggingOn = function () {
    return Boolean(process.env.DEBUG_LOGS);
}


exports.logError = function (err) {
    if (exports.isLoggingOn()) {
        console.error(err);
    }
}