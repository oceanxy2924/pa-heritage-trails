"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptsAndApp = exports.onNewTesterIosDevicePublished = exports.newTesterIosDeviceAlert = void 0;
const alerts_1 = require("./alerts");
/** @internal */
exports.newTesterIosDeviceAlert = 'appDistribution.newTesterIosDevice';
function onNewTesterIosDevicePublished(appIdOrOptsOrHandler, handler) {
    if (typeof appIdOrOptsOrHandler === 'function') {
        handler = appIdOrOptsOrHandler;
        appIdOrOptsOrHandler = {};
    }
    const [opts, appId] = getOptsAndApp(appIdOrOptsOrHandler);
    const func = (raw) => {
        return handler(raw);
    };
    func.run = handler;
    func.__endpoint = alerts_1.getEndpointAnnotation(opts, exports.newTesterIosDeviceAlert, appId);
    return func;
}
exports.onNewTesterIosDevicePublished = onNewTesterIosDevicePublished;
/**
 * @internal
 * Helper function to parse the function opts and appId.
 */
function getOptsAndApp(appIdOrOpts) {
    let opts;
    let appId;
    if (typeof appIdOrOpts === 'string') {
        opts = {};
        appId = appIdOrOpts;
    }
    else {
        appId = appIdOrOpts.appId;
        opts = { ...appIdOrOpts };
        delete opts.appId;
    }
    return [opts, appId];
}
exports.getOptsAndApp = getOptsAndApp;
