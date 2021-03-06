/// <reference types="node" />
import * as express from 'express';
import * as firebase from 'firebase-admin';
import { TaskContext } from './tasks';
/** @hidden */
export interface Request extends express.Request {
    rawBody: Buffer;
}
interface DecodedAppCheckToken {
    /**
     * The issuer identifier for the issuer of the response.
     *
     * This value is a URL with the format
     * `https://firebaseappcheck.googleapis.com/<PROJECT_NUMBER>`, where `<PROJECT_NUMBER>` is the
     * same project number specified in the [`aud`](#aud) property.
     */
    iss: string;
    /**
     * The Firebase App ID corresponding to the app the token belonged to.
     *
     * As a convenience, this value is copied over to the [`app_id`](#app_id) property.
     */
    sub: string;
    /**
     * The audience for which this token is intended.
     *
     * This value is a JSON array of two strings, the first is the project number of your
     * Firebase project, and the second is the project ID of the same project.
     */
    aud: string[];
    /**
     * The App Check token's expiration time, in seconds since the Unix epoch. That is, the
     * time at which this App Check token expires and should no longer be considered valid.
     */
    exp: number;
    /**
     * The App Check token's issued-at time, in seconds since the Unix epoch. That is, the
     * time at which this App Check token was issued and should start to be considered
     * valid.;
     */
    iat: number;
    /**
     * The App ID corresponding to the App the App Check token belonged to.
     *
     * This value is not actually one of the JWT token claims. It is added as a
     * convenience, and is set as the value of the [`sub`](#sub) property.
     */
    app_id: string;
    [key: string]: any;
}
/**
 * The interface for AppCheck tokens verified in Callable functions
 */
export interface AppCheckData {
    appId: string;
    token: DecodedAppCheckToken;
}
/**
 * The interface for Auth tokens verified in Callable functions
 */
export interface AuthData {
    uid: string;
    token: firebase.auth.DecodedIdToken;
}
/**
 * The interface for metadata for the API as passed to the handler.
 */
export interface CallableContext {
    /**
     * The result of decoding and verifying a Firebase AppCheck token.
     */
    app?: AppCheckData;
    /**
     * The result of decoding and verifying a Firebase Auth ID token.
     */
    auth?: AuthData;
    /**
     * An unverified token for a Firebase Instance ID.
     */
    instanceIdToken?: string;
    /**
     * The raw request handled by the callable.
     */
    rawRequest: Request;
}
/**
 * The request used to call a callable function.
 */
export interface CallableRequest<T = any> {
    /**
     * The parameters used by a client when calling this function.
     */
    data: T;
    /**
     * The result of decoding and verifying a Firebase AppCheck token.
     */
    app?: AppCheckData;
    /**
     * The result of decoding and verifying a Firebase Auth ID token.
     */
    auth?: AuthData;
    /**
     * An unverified token for a Firebase Instance ID.
     */
    instanceIdToken?: string;
    /**
     * The raw request handled by the callable.
     */
    rawRequest: Request;
}
/**
 * The set of Firebase Functions status codes. The codes are the same at the
 * ones exposed by gRPC here:
 * https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
 *
 * Possible values:
 * - 'cancelled': The operation was cancelled (typically by the caller).
 * - 'unknown': Unknown error or an error from a different error domain.
 * - 'invalid-argument': Client specified an invalid argument. Note that this
 *   differs from 'failed-precondition'. 'invalid-argument' indicates
 *   arguments that are problematic regardless of the state of the system
 *   (e.g. an invalid field name).
 * - 'deadline-exceeded': Deadline expired before operation could complete.
 *   For operations that change the state of the system, this error may be
 *   returned even if the operation has completed successfully. For example,
 *   a successful response from a server could have been delayed long enough
 *   for the deadline to expire.
 * - 'not-found': Some requested document was not found.
 * - 'already-exists': Some document that we attempted to create already
 *   exists.
 * - 'permission-denied': The caller does not have permission to execute the
 *   specified operation.
 * - 'resource-exhausted': Some resource has been exhausted, perhaps a
 *   per-user quota, or perhaps the entire file system is out of space.
 * - 'failed-precondition': Operation was rejected because the system is not
 *   in a state required for the operation's execution.
 * - 'aborted': The operation was aborted, typically due to a concurrency
 *   issue like transaction aborts, etc.
 * - 'out-of-range': Operation was attempted past the valid range.
 * - 'unimplemented': Operation is not implemented or not supported/enabled.
 * - 'internal': Internal errors. Means some invariants expected by
 *   underlying system has been broken. If you see one of these errors,
 *   something is very broken.
 * - 'unavailable': The service is currently unavailable. This is most likely
 *   a transient condition and may be corrected by retrying with a backoff.
 * - 'data-loss': Unrecoverable data loss or corruption.
 * - 'unauthenticated': The request does not have valid authentication
 *   credentials for the operation.
 */
export declare type FunctionsErrorCode = 'ok' | 'cancelled' | 'unknown' | 'invalid-argument' | 'deadline-exceeded' | 'not-found' | 'already-exists' | 'permission-denied' | 'resource-exhausted' | 'failed-precondition' | 'aborted' | 'out-of-range' | 'unimplemented' | 'internal' | 'unavailable' | 'data-loss' | 'unauthenticated';
/** @hidden */
export declare type CanonicalErrorCodeName = 'OK' | 'CANCELLED' | 'UNKNOWN' | 'INVALID_ARGUMENT' | 'DEADLINE_EXCEEDED' | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'PERMISSION_DENIED' | 'UNAUTHENTICATED' | 'RESOURCE_EXHAUSTED' | 'FAILED_PRECONDITION' | 'ABORTED' | 'OUT_OF_RANGE' | 'UNIMPLEMENTED' | 'INTERNAL' | 'UNAVAILABLE' | 'DATA_LOSS';
/** @hidden */
interface HttpErrorCode {
    canonicalName: CanonicalErrorCodeName;
    status: number;
}
/** @hidden */
interface HttpErrorWireFormat {
    details?: unknown;
    message: string;
    status: CanonicalErrorCodeName;
}
/**
 * An explicit error that can be thrown from a handler to send an error to the
 * client that called the function.
 */
export declare class HttpsError extends Error {
    /**
     * A standard error code that will be returned to the client. This also
     * determines the HTTP status code of the response, as defined in code.proto.
     */
    readonly code: FunctionsErrorCode;
    /**
     * Extra data to be converted to JSON and included in the error response.
     */
    readonly details: unknown;
    /**
     * A wire format representation of a provided error code.
     *
     * @hidden
     */
    readonly httpErrorCode: HttpErrorCode;
    constructor(code: FunctionsErrorCode, message: string, details?: unknown);
    toJSON(): HttpErrorWireFormat;
}
/** @hidden */
interface HttpRequest extends Request {
    body: {
        data: any;
    };
}
/** @hidden */
export declare function isValidRequest(req: Request): req is HttpRequest;
/**
 * Encodes arbitrary data in our special format for JSON.
 * This is exposed only for testing.
 */
/** @hidden */
export declare function encode(data: any): any;
/**
 * Decodes our special format for JSON into native types.
 * This is exposed only for testing.
 */
/** @hidden */
export declare function decode(data: any): any;
/**
 * Be careful when changing token status values.
 *
 * Users are encouraged to setup log-based metric based on these values, and
 * changing their values may cause their metrics to break.
 *
 */
/** @hidden */
declare type TokenStatus = 'MISSING' | 'VALID' | 'INVALID';
/** @interanl */
export declare function checkAuthToken(req: Request, ctx: CallableContext | TaskContext): Promise<TokenStatus>;
export {};
