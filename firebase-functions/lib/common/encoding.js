"use strict";
// Copied from firebase-tools/src/gcp/proto
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertInvoker = exports.serviceAccountFromShorthand = exports.convertIfPresent = exports.copyIfPresent = exports.durationFromSeconds = void 0;
/** Get a google.protobuf.Duration for a number of seconds. */
function durationFromSeconds(s) {
    return `${s}s`;
}
exports.durationFromSeconds = durationFromSeconds;
/**
 * Utility function to help copy fields from type A to B.
 * As a safety net, catches typos or fields that aren't named the same
 * in A and B, but cannot verify that both Src and Dest have the same type for the same field.
 */
function copyIfPresent(dest, src, ...fields) {
    if (!src) {
        return;
    }
    for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(src, field)) {
            continue;
        }
        dest[field] = src[field];
    }
}
exports.copyIfPresent = copyIfPresent;
function convertIfPresent(dest, src, destField, srcField, converter = (from) => {
    return from;
}) {
    if (!src) {
        return;
    }
    if (!Object.prototype.hasOwnProperty.call(src, srcField)) {
        return;
    }
    dest[destField] = converter(src[srcField]);
}
exports.convertIfPresent = convertIfPresent;
function serviceAccountFromShorthand(serviceAccount) {
    if (serviceAccount === 'default') {
        return null;
    }
    else if (serviceAccount.endsWith('@')) {
        if (!process.env.GCLOUD_PROJECT) {
            throw new Error(`Unable to determine email for service account '${serviceAccount}' because process.env.GCLOUD_PROJECT is not set.`);
        }
        return `${serviceAccount}${process.env.GCLOUD_PROJECT}.iam.gserviceaccount.com`;
    }
    else if (serviceAccount.includes('@')) {
        return serviceAccount;
    }
    else {
        throw new Error(`Invalid option for serviceAccount: '${serviceAccount}'. Valid options are 'default', a service account email, or '{serviceAccountName}@'`);
    }
}
exports.serviceAccountFromShorthand = serviceAccountFromShorthand;
function convertInvoker(invoker) {
    if (typeof invoker === 'string') {
        invoker = [invoker];
    }
    if (invoker.length === 0) {
        throw new Error('Invalid option for invoker: Must be a non-empty array.');
    }
    if (invoker.find((inv) => inv.length === 0)) {
        throw new Error('Invalid option for invoker: Must be a non-empty string.');
    }
    if (invoker.length > 1 &&
        invoker.find((inv) => inv === 'public' || inv === 'private')) {
        throw new Error("Invalid option for invoker: Cannot have 'public' or 'private' in an array of service accounts.");
    }
    return invoker;
}
exports.convertInvoker = convertInvoker;
