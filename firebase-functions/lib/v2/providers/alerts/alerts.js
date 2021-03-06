"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptsAndAlertTypeAndApp = exports.getEndpointAnnotation = exports.onAlertPublished = exports.eventType = void 0;
const options = require("../../options");
/** @internal */
exports.eventType = 'google.firebase.firebasealerts.alerts.v1.published';
/**
 * Declares a function that can handle Firebase Alerts from CloudEvents.
 * @param alertTypeOrOpts the alert type or Firebase Alert function configuration.
 * @param handler a function that can handle the Firebase Alert inside a CloudEvent.
 */
function onAlertPublished(alertTypeOrOpts, handler) {
    const [opts, alertType, appId] = getOptsAndAlertTypeAndApp(alertTypeOrOpts);
    const func = (raw) => {
        return handler(raw);
    };
    func.run = handler;
    func.__endpoint = getEndpointAnnotation(opts, alertType, appId);
    return func;
}
exports.onAlertPublished = onAlertPublished;
/**
 * @internal
 * Helper function for getting the endpoint annotation used in alert handling functions.
 */
function getEndpointAnnotation(opts, alertType, appId) {
    const baseOpts = options.optionsToEndpoint(options.getGlobalOptions());
    const specificOpts = options.optionsToEndpoint(opts);
    const endpoint = {
        platform: 'gcfv2',
        ...baseOpts,
        ...specificOpts,
        labels: {
            ...baseOpts === null || baseOpts === void 0 ? void 0 : baseOpts.labels,
            ...specificOpts === null || specificOpts === void 0 ? void 0 : specificOpts.labels,
        },
        eventTrigger: {
            eventType: exports.eventType,
            eventFilters: {
                alerttype: alertType,
            },
            retry: !!opts.retry,
        },
    };
    if (appId) {
        endpoint.eventTrigger.eventFilters.appid = appId;
    }
    return endpoint;
}
exports.getEndpointAnnotation = getEndpointAnnotation;
/**
 * @internal
 * Helper function to parse the function opts, alert type, and appId.
 */
function getOptsAndAlertTypeAndApp(alertTypeOrOpts) {
    let opts;
    let alertType;
    let appId;
    if (typeof alertTypeOrOpts === 'string') {
        alertType = alertTypeOrOpts;
        opts = {};
    }
    else {
        alertType = alertTypeOrOpts.alertType;
        appId = alertTypeOrOpts.appId;
        opts = { ...alertTypeOrOpts };
        delete opts.alertType;
        delete opts.appId;
    }
    return [opts, alertType, appId];
}
exports.getOptsAndAlertTypeAndApp = getOptsAndAlertTypeAndApp;
