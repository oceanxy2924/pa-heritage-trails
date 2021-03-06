import { ManifestEndpoint } from '../runtime/manifest';
/**
 * A CloudEventBase is the base of a cross-platform format for encoding a serverless event.
 * More information can be found in https://github.com/cloudevents/spec
 */
interface CloudEventBase<T> {
    /** Version of the CloudEvents spec for this event. */
    readonly specversion: '1.0';
    /** A globally unique ID for this event. */
    id: string;
    /** The resource which published this event. */
    source: string;
    /** The resource, provided by source, that this event relates to */
    subject?: string;
    /** The type of event that this represents. */
    type: string;
    /** When this event occurred. */
    time: string;
    /** Information about this specific event. */
    data: T;
    /**
     * A map of template parameter name to value for subject strings.
     *
     * This map is only available on some event types that allow templates
     * in the subject string, such as Firestore. When listening to a document
     * template "/users/{uid}", an event with subject "/documents/users/1234"
     * would have a params of {"uid": "1234"}.
     *
     * Params are generated inside the firebase-functions SDK and are not
     * part of the CloudEvents spec nor the payload that a Cloud Function
     * actually receives.
     */
    params?: Record<string, string>;
}
/**
 * A CloudEvent with custom extension attributes
 */
export declare type CloudEvent<T = any, Ext = {}> = CloudEventBase<T> & Ext;
/** A handler for CloudEvents. */
export interface CloudFunction<T> {
    (raw: CloudEvent<unknown>): any | Promise<any>;
    __trigger?: unknown;
    __endpoint: ManifestEndpoint;
    run(event: CloudEvent<T>): any | Promise<any>;
}
export {};
