"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptsAndApp = exports.onOperation = exports.onNewAnrIssuePublished = exports.onVelocityAlertPublished = exports.onStabilityDigestPublished = exports.onRegressionAlertPublished = exports.onNewNonfatalIssuePublished = exports.onNewFatalIssuePublished = exports.newAnrIssueAlert = exports.velocityAlert = exports.stabilityDigestAlert = exports.regressionAlert = exports.newNonfatalIssueAlert = exports.newFatalIssueAlert = void 0;
const _1 = require(".");
/** @internal */
exports.newFatalIssueAlert = 'crashlytics.newFatalIssue';
/** @internal */
exports.newNonfatalIssueAlert = 'crashlytics.newNonfatalIssue';
/** @internal */
exports.regressionAlert = 'crashlytics.regression';
/** @internal */
exports.stabilityDigestAlert = 'crashlytics.stabilityDigest';
/** @internal */
exports.velocityAlert = 'crashlytics.velocity';
/** @internal */
exports.newAnrIssueAlert = 'crashlytics.newAnrIssue';
function onNewFatalIssuePublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.newFatalIssueAlert, appIdOrOptsOrHandler, handler);
}
exports.onNewFatalIssuePublished = onNewFatalIssuePublished;
function onNewNonfatalIssuePublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.newNonfatalIssueAlert, appIdOrOptsOrHandler, handler);
}
exports.onNewNonfatalIssuePublished = onNewNonfatalIssuePublished;
function onRegressionAlertPublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.regressionAlert, appIdOrOptsOrHandler, handler);
}
exports.onRegressionAlertPublished = onRegressionAlertPublished;
function onStabilityDigestPublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.stabilityDigestAlert, appIdOrOptsOrHandler, handler);
}
exports.onStabilityDigestPublished = onStabilityDigestPublished;
function onVelocityAlertPublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.velocityAlert, appIdOrOptsOrHandler, handler);
}
exports.onVelocityAlertPublished = onVelocityAlertPublished;
function onNewAnrIssuePublished(appIdOrOptsOrHandler, handler) {
    return onOperation(exports.newAnrIssueAlert, appIdOrOptsOrHandler, handler);
}
exports.onNewAnrIssuePublished = onNewAnrIssuePublished;
/** @internal */
function onOperation(alertType, appIdOrOptsOrHandler, handler) {
    if (typeof appIdOrOptsOrHandler === 'function') {
        handler = appIdOrOptsOrHandler;
        appIdOrOptsOrHandler = {};
    }
    const [opts, appId] = getOptsAndApp(appIdOrOptsOrHandler);
    const func = (raw) => {
        return handler(raw);
    };
    func.run = handler;
    func.__endpoint = _1.getEndpointAnnotation(opts, alertType, appId);
    return func;
}
exports.onOperation = onOperation;
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
