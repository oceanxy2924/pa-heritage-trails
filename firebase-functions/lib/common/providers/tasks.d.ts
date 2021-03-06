import * as firebase from 'firebase-admin';
/** How a task should be retried in the event of a non-2xx return. */
export interface RetryConfig {
    /**
     * Maximum number of times a request should be attempted.
     * If left unspecified, will default to 3.
     */
    maxAttempts?: number;
    /**
     * Maximum amount of time for retrying failed task.
     * If left unspecified will retry indefinitely.
     */
    maxRetrySeconds?: number;
    /**
     * The maximum amount of time to wait between attempts.
     * If left unspecified will default to 1hr.
     */
    maxBackoffSeconds?: number;
    /**
     * The maximum number of times to double the backoff between
     * retries. If left unspecified will default to 16.
     */
    maxDoublings?: number;
    /**
     * The minimum time to wait between attempts. If left unspecified
     * will default to 100ms.
     */
    minBackoffSeconds?: number;
}
/** How congestion control should be applied to the function. */
export interface RateLimits {
    maxConcurrentDispatches?: number;
    maxDispatchesPerSecond?: number;
}
export interface AuthData {
    uid: string;
    token: firebase.auth.DecodedIdToken;
}
/** Metadata about a call to a Task Queue function. */
export interface TaskContext {
    /**
     * The result of decoding and verifying an ODIC token.
     */
    auth?: AuthData;
}
/**
 * The request used to call a Task Queue function.
 */
export interface Request<T = any> {
    /**
     * The parameters used by a client when calling this function.
     */
    data: T;
    /**
     * The result of decoding and verifying an ODIC token.
     */
    auth?: AuthData;
}
