"use strict";
// The MIT License (MIT)
//
// Copyright (c) 2021 Firebase
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCallHandler = exports.checkAuthToken = exports.unsafeDecodeAppCheckToken = exports.unsafeDecodeIdToken = exports.decode = exports.encode = exports.isValidRequest = exports.HttpsError = void 0;
const cors = require("cors");
const logger = require("../../logger");
// TODO(inlined): Decide whether we want to un-version apps or whether we want a
// different strategy
const apps_1 = require("../../apps");
const debug_1 = require("../debug");
const JWT_REGEX = /^[a-zA-Z0-9\-_=]+?\.[a-zA-Z0-9\-_=]+?\.([a-zA-Z0-9\-_=]+)?$/;
/**
 * Standard error codes and HTTP statuses for different ways a request can fail,
 * as defined by:
 * https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
 *
 * This map is used primarily to convert from a client error code string to
 * to the HTTP format error code string and status, and make sure it's in the
 * supported set.
 */
const errorCodeMap = {
    ok: { canonicalName: 'OK', status: 200 },
    cancelled: { canonicalName: 'CANCELLED', status: 499 },
    unknown: { canonicalName: 'UNKNOWN', status: 500 },
    'invalid-argument': { canonicalName: 'INVALID_ARGUMENT', status: 400 },
    'deadline-exceeded': { canonicalName: 'DEADLINE_EXCEEDED', status: 504 },
    'not-found': { canonicalName: 'NOT_FOUND', status: 404 },
    'already-exists': { canonicalName: 'ALREADY_EXISTS', status: 409 },
    'permission-denied': { canonicalName: 'PERMISSION_DENIED', status: 403 },
    unauthenticated: { canonicalName: 'UNAUTHENTICATED', status: 401 },
    'resource-exhausted': { canonicalName: 'RESOURCE_EXHAUSTED', status: 429 },
    'failed-precondition': { canonicalName: 'FAILED_PRECONDITION', status: 400 },
    aborted: { canonicalName: 'ABORTED', status: 409 },
    'out-of-range': { canonicalName: 'OUT_OF_RANGE', status: 400 },
    unimplemented: { canonicalName: 'UNIMPLEMENTED', status: 501 },
    internal: { canonicalName: 'INTERNAL', status: 500 },
    unavailable: { canonicalName: 'UNAVAILABLE', status: 503 },
    'data-loss': { canonicalName: 'DATA_LOSS', status: 500 },
};
/**
 * An explicit error that can be thrown from a handler to send an error to the
 * client that called the function.
 */
class HttpsError extends Error {
    constructor(code, message, details) {
        super(message);
        // A sanity check for non-TypeScript consumers.
        if (code in errorCodeMap === false) {
            throw new Error(`Unknown error code: ${code}.`);
        }
        this.code = code;
        this.details = details;
        this.httpErrorCode = errorCodeMap[code];
    }
    toJSON() {
        const { details, httpErrorCode: { canonicalName: status }, message, } = this;
        return {
            ...(details === undefined ? {} : { details }),
            message,
            status,
        };
    }
}
exports.HttpsError = HttpsError;
/** @hidden */
// Returns true if req is a properly formatted callable request.
function isValidRequest(req) {
    // The body must not be empty.
    if (!req.body) {
        logger.warn('Request is missing body.');
        return false;
    }
    // Make sure it's a POST.
    if (req.method !== 'POST') {
        logger.warn('Request has invalid method.', req.method);
        return false;
    }
    // Check that the Content-Type is JSON.
    let contentType = (req.header('Content-Type') || '').toLowerCase();
    // If it has a charset, just ignore it for now.
    const semiColon = contentType.indexOf(';');
    if (semiColon >= 0) {
        contentType = contentType.slice(0, semiColon).trim();
    }
    if (contentType !== 'application/json') {
        logger.warn('Request has incorrect Content-Type.', contentType);
        return false;
    }
    // The body must have data.
    if (typeof req.body.data === 'undefined') {
        logger.warn('Request body is missing data.', req.body);
        return false;
    }
    // TODO(klimt): Allow only specific http headers.
    // Verify that the body does not have any extra fields.
    const extraKeys = Object.keys(req.body).filter((field) => field !== 'data');
    if (extraKeys.length !== 0) {
        logger.warn('Request body has extra fields: ', extraKeys.join(', '));
        return false;
    }
    return true;
}
exports.isValidRequest = isValidRequest;
/** @hidden */
const LONG_TYPE = 'type.googleapis.com/google.protobuf.Int64Value';
/** @hidden */
const UNSIGNED_LONG_TYPE = 'type.googleapis.com/google.protobuf.UInt64Value';
/**
 * Encodes arbitrary data in our special format for JSON.
 * This is exposed only for testing.
 */
/** @hidden */
function encode(data) {
    if (data === null || typeof data === 'undefined') {
        return null;
    }
    if (data instanceof Number) {
        data = data.valueOf();
    }
    if (Number.isFinite(data)) {
        // Any number in JS is safe to put directly in JSON and parse as a double
        // without any loss of precision.
        return data;
    }
    if (typeof data === 'boolean') {
        return data;
    }
    if (typeof data === 'string') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(encode);
    }
    if (typeof data === 'object' || typeof data === 'function') {
        // Sadly we don't have Object.fromEntries in Node 10, so we can't use a single
        // list comprehension
        const obj = {};
        for (const [k, v] of Object.entries(data)) {
            obj[k] = encode(v);
        }
        return obj;
    }
    // If we got this far, the data is not encodable.
    logger.error('Data cannot be encoded in JSON.', data);
    throw new Error('Data cannot be encoded in JSON: ' + data);
}
exports.encode = encode;
/**
 * Decodes our special format for JSON into native types.
 * This is exposed only for testing.
 */
/** @hidden */
function decode(data) {
    if (data === null) {
        return data;
    }
    if (data['@type']) {
        switch (data['@type']) {
            case LONG_TYPE:
            // Fall through and handle this the same as unsigned.
            case UNSIGNED_LONG_TYPE: {
                // Technically, this could work return a valid number for malformed
                // data if there was a number followed by garbage. But it's just not
                // worth all the extra code to detect that case.
                const value = parseFloat(data.value);
                if (isNaN(value)) {
                    logger.error('Data cannot be decoded from JSON.', data);
                    throw new Error('Data cannot be decoded from JSON: ' + data);
                }
                return value;
            }
            default: {
                logger.error('Data cannot be decoded from JSON.', data);
                throw new Error('Data cannot be decoded from JSON: ' + data);
            }
        }
    }
    if (Array.isArray(data)) {
        return data.map(decode);
    }
    if (typeof data === 'object') {
        const obj = {};
        for (const [k, v] of Object.entries(data)) {
            obj[k] = decode(v);
        }
        return obj;
    }
    // Anything else is safe to return.
    return data;
}
exports.decode = decode;
function unsafeDecodeToken(token) {
    if (!JWT_REGEX.test(token)) {
        return {};
    }
    const components = token
        .split('.')
        .map((s) => Buffer.from(s, 'base64').toString());
    let payload = components[1];
    if (typeof payload === 'string') {
        try {
            const obj = JSON.parse(payload);
            if (typeof obj === 'object') {
                payload = obj;
            }
        }
        catch (e) { }
    }
    return payload;
}
/**
 * Decode, but not verify, a Auth ID token.
 *
 * Do not use in production. Token should always be verified using the Admin SDK.
 *
 * This is exposed only for testing.
 */
/** @internal */
function unsafeDecodeIdToken(token) {
    const decoded = unsafeDecodeToken(token);
    decoded.uid = decoded.sub;
    return decoded;
}
exports.unsafeDecodeIdToken = unsafeDecodeIdToken;
/**
 * Decode, but not verify, an App Check token.
 *
 * Do not use in production. Token should always be verified using the Admin SDK.
 *
 * This is exposed only for testing.
 */
/** @internal */
function unsafeDecodeAppCheckToken(token) {
    const decoded = unsafeDecodeToken(token);
    decoded.app_id = decoded.sub;
    return decoded;
}
exports.unsafeDecodeAppCheckToken = unsafeDecodeAppCheckToken;
/**
 * Check and verify tokens included in the requests. Once verified, tokens
 * are injected into the callable context.
 *
 * @param {Request} req - Request sent to the Callable function.
 * @param {CallableContext} ctx - Context to be sent to callable function handler.
 * @return {CallableTokenStatus} Status of the token verifications.
 */
/** @internal */
async function checkTokens(req, ctx) {
    const verifications = {
        app: 'INVALID',
        auth: 'INVALID',
    };
    await Promise.all([
        Promise.resolve().then(async () => {
            verifications.auth = await checkAuthToken(req, ctx);
        }),
        Promise.resolve().then(async () => {
            verifications.app = await checkAppCheckToken(req, ctx);
        }),
    ]);
    const logPayload = {
        verifications,
        'logging.googleapis.com/labels': {
            'firebase-log-type': 'callable-request-verification',
        },
    };
    const errs = [];
    if (verifications.app === 'INVALID') {
        errs.push('AppCheck token was rejected.');
    }
    if (verifications.auth === 'INVALID') {
        errs.push('Auth token was rejected.');
    }
    if (errs.length == 0) {
        logger.info('Callable request verification passed', logPayload);
    }
    else {
        logger.warn(`Callable request verification failed: ${errs.join(' ')}`, logPayload);
    }
    return verifications;
}
/** @interanl */
async function checkAuthToken(req, ctx) {
    const authorization = req.header('Authorization');
    if (!authorization) {
        return 'MISSING';
    }
    const match = authorization.match(/^Bearer (.*)$/);
    if (match) {
        const idToken = match[1];
        try {
            let authToken;
            if (debug_1.isDebugFeatureEnabled('skipTokenVerification')) {
                authToken = unsafeDecodeIdToken(idToken);
            }
            else {
                authToken = await apps_1.apps()
                    .admin.auth()
                    .verifyIdToken(idToken);
            }
            ctx.auth = {
                uid: authToken.uid,
                token: authToken,
            };
            return 'VALID';
        }
        catch (err) {
            logger.warn('Failed to validate auth token.', err);
            return 'INVALID';
        }
    }
}
exports.checkAuthToken = checkAuthToken;
/** @internal */
async function checkAppCheckToken(req, ctx) {
    const appCheck = req.header('X-Firebase-AppCheck');
    if (!appCheck) {
        return 'MISSING';
    }
    try {
        if (!apps_1.apps().admin.appCheck) {
            throw new Error('Cannot validate AppCheck token. Please update Firebase Admin SDK to >= v9.8.0');
        }
        let appCheckData;
        if (debug_1.isDebugFeatureEnabled('skipTokenVerification')) {
            const decodedToken = unsafeDecodeAppCheckToken(appCheck);
            appCheckData = { appId: decodedToken.app_id, token: decodedToken };
        }
        else {
            appCheckData = await apps_1.apps()
                .admin.appCheck()
                .verifyToken(appCheck);
        }
        ctx.app = appCheckData;
        return 'VALID';
    }
    catch (err) {
        logger.warn('Failed to validate AppCheck token.', err);
        return 'INVALID';
    }
}
/** @internal */
function onCallHandler(options, handler) {
    const wrapped = wrapOnCallHandler(options, handler);
    return (req, res) => {
        return new Promise((resolve) => {
            res.on('finish', resolve);
            cors(options.cors)(req, res, () => {
                resolve(wrapped(req, res));
            });
        });
    };
}
exports.onCallHandler = onCallHandler;
/** @internal */
function wrapOnCallHandler(options, handler) {
    return async (req, res) => {
        try {
            if (!isValidRequest(req)) {
                logger.error('Invalid request, unable to process.');
                throw new HttpsError('invalid-argument', 'Bad Request');
            }
            const context = { rawRequest: req };
            const tokenStatus = await checkTokens(req, context);
            if (tokenStatus.auth === 'INVALID') {
                throw new HttpsError('unauthenticated', 'Unauthenticated');
            }
            if (tokenStatus.app === 'INVALID' && !options.allowInvalidAppCheckToken) {
                throw new HttpsError('unauthenticated', 'Unauthenticated');
            }
            const instanceId = req.header('Firebase-Instance-ID-Token');
            if (instanceId) {
                // Validating the token requires an http request, so we don't do it.
                // If the user wants to use it for something, it will be validated then.
                // Currently, the only real use case for this token is for sending
                // pushes with FCM. In that case, the FCM APIs will validate the token.
                context.instanceIdToken = req.header('Firebase-Instance-ID-Token');
            }
            const data = decode(req.body.data);
            let result;
            if (handler.length === 2) {
                result = await handler(data, context);
            }
            else {
                const arg = {
                    ...context,
                    data,
                };
                // For some reason the type system isn't picking up that the handler
                // is a one argument function.
                result = await handler(arg);
            }
            // Encode the result as JSON to preserve types like Dates.
            result = encode(result);
            // If there was some result, encode it in the body.
            const responseBody = { result };
            res.status(200).send(responseBody);
        }
        catch (err) {
            if (!(err instanceof HttpsError)) {
                // This doesn't count as an 'explicit' error.
                logger.error('Unhandled error', err);
                err = new HttpsError('internal', 'INTERNAL');
            }
            const { status } = err.httpErrorCode;
            const body = { error: err.toJSON() };
            res.status(status).send(body);
        }
    };
}
