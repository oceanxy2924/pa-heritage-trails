"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOperation = exports.onPlanAutomatedUpdatePublished = exports.onPlanUpdatePublished = exports.planAutomatedUpdateAlert = exports.planUpdateAlert = void 0;
const _1 = require(".");
/** @internal */
exports.planUpdateAlert = 'billing.planUpdate';
/** @internal */
exports.planAutomatedUpdateAlert = 'billing.planAutomatedUpdate';
function onPlanUpdatePublished(optsOrHandler, handler) {
    return onOperation(exports.planUpdateAlert, optsOrHandler, handler);
}
exports.onPlanUpdatePublished = onPlanUpdatePublished;
function onPlanAutomatedUpdatePublished(optsOrHandler, handler) {
    return onOperation(exports.planAutomatedUpdateAlert, optsOrHandler, handler);
}
exports.onPlanAutomatedUpdatePublished = onPlanAutomatedUpdatePublished;
/** @internal */
function onOperation(alertType, optsOrHandler, handler) {
    if (typeof optsOrHandler === 'function') {
        handler = optsOrHandler;
        optsOrHandler = {};
    }
    const func = (raw) => {
        return handler(raw);
    };
    func.run = handler;
    func.__endpoint = _1.getEndpointAnnotation(optsOrHandler, alertType);
    return func;
}
exports.onOperation = onOperation;
