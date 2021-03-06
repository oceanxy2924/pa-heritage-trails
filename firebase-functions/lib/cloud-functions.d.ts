import { Request, Response } from 'express';
import { DeploymentOptions, FailurePolicy, Schedule } from './function-configuration';
export { Request, Response };
import { Duration } from './common/encoding';
import { ManifestEndpoint, ManifestRequiredAPI } from './runtime/manifest';
/**
 * @hidden
 *
 * Wire format for an event.
 */
export interface Event {
    context: {
        eventId: string;
        timestamp: string;
        eventType: string;
        resource: Resource;
        domain?: string;
    };
    data: any;
}
/**
 * The context in which an event occurred.
 *
 * An EventContext describes:
 * - The time an event occurred.
 * - A unique identifier of the event.
 * - The resource on which the event occurred, if applicable.
 * - Authorization of the request that triggered the event, if applicable and
 *   available.
 */
export interface EventContext {
    /**
     * Authentication information for the user that triggered the function.
     * This object contains `uid` and `token` properties for authenticated users.
     * For more detail including token keys, see the
     * [security rules reference](/docs/firestore/reference/security/#properties).
     *
     * This field is only populated for Realtime Database triggers and Callable
     * functions. For an unauthenticated user, this field is null. For Firebase
     * admin users and event types that do not provide user information, this field
     * does not exist.
     */
    auth?: {
        token: object;
        uid: string;
    };
    /**
     * The level of permissions for a user. Valid values are:
     *
     * * `ADMIN` Developer user or user authenticated via a service account.
     * * `USER` Known user.
     * * `UNAUTHENTICATED` Unauthenticated action
     * * `null` For event types that do not provide user information (all except
     *   Realtime Database).
     */
    authType?: 'ADMIN' | 'USER' | 'UNAUTHENTICATED';
    /**
     * The event’s unique identifier.
     */
    eventId: string;
    /**
     * Type of event. Possible values are:
     *
     * * `google.analytics.event.log`
     * * `google.firebase.auth.user.create`
     * * `google.firebase.auth.user.delete`
     * * `google.firebase.database.ref.write`
     * * `google.firebase.database.ref.create`
     * * `google.firebase.database.ref.update`
     * * `google.firebase.database.ref.delete`
     * * `google.firestore.document.write`
     * * `google.firestore.document.create`
     * * `google.firestore.document.update`
     * * `google.firestore.document.delete`
     * * `google.pubsub.topic.publish`
     * * `google.firebase.remoteconfig.update`
     * * `google.storage.object.finalize`
     * * `google.storage.object.archive`
     * * `google.storage.object.delete`
     * * `google.storage.object.metadataUpdate`
     * * `google.testing.testMatrix.complete`
     */
    eventType: string;
    /**
     * An object containing the values of the wildcards in the `path` parameter
     * provided to the [`ref()`](providers_database_.html#ref) method for a Realtime
     * Database trigger. Cannot be accessed while inside the handler namespace.
     */
    params: {
        [option: string]: any;
    };
    /**
     * The resource that emitted the event. Valid values are:
     *
     * * Analytics &mdash; `projects/<projectId>/events/<analyticsEventType>`
     * * Realtime Database &mdash;
         `projects/_/instances/<databaseInstance>/refs/<databasePath>`
     * * Storage &mdash;
        `projects/_/buckets/<bucketName>/objects/<fileName>#<generation>`
     * * Authentication &mdash; `projects/<projectId>`
     * * Pub/Sub &mdash; `projects/<projectId>/topics/<topicName>`
     *
     * Because Realtime Database instances and Cloud Storage buckets are globally
     * unique and not tied to the project, their resources start with `projects/_`.
     * Underscore is not a valid project name.
     */
    resource: Resource;
    /**
     * Timestamp for the event as an
     * [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) string.
     */
    timestamp: string;
}
/**
 * The Functions interface for events that change state, such as
 * Realtime Database or Cloud Firestore `onWrite` and `onUpdate`.
 *
 * For more information about the format used to construct `Change` objects, see
 * [`cloud-functions.ChangeJson`](/docs/reference/functions/cloud_functions_.changejson).
 *
 */
export declare class Change<T> {
    before: T;
    after: T;
    constructor(before: T, after: T);
}
/**
 * `ChangeJson` is the JSON format used to construct a Change object.
 */
export interface ChangeJson {
    /**
     * Key-value pairs representing state of data after the change.
     */
    after?: any;
    /**
     * Key-value pairs representing state of data before the change. If
     * `fieldMask` is set, then only fields that changed are present in `before`.
     */
    before?: any;
    /**
     * @hidden
     * Comma-separated string that represents names of fields that changed.
     */
    fieldMask?: string;
}
export declare namespace Change {
    /**
     * @hidden
     * Factory method for creating a Change from a `before` object and an `after`
     * object.
     */
    function fromObjects<T>(before: T, after: T): Change<T>;
    /**
     * @hidden
     * Factory method for creating a Change from a JSON and an optional customizer
     * function to be applied to both the `before` and the `after` fields.
     */
    function fromJSON<T>(json: ChangeJson, customizer?: (x: any) => T): Change<T>;
    /** @hidden */
    function applyFieldMask(sparseBefore: any, after: any, fieldMask: string): any;
}
/**
 * Resource is a standard format for defining a resource
 * (google.rpc.context.AttributeContext.Resource). In Cloud Functions, it is the
 * resource that triggered the function - such as a storage bucket.
 */
export interface Resource {
    service: string;
    name: string;
    type?: string;
    labels?: {
        [tag: string]: string;
    };
}
/**
 * @hidden
 * TriggerAnnotated is used internally by the firebase CLI to understand what
 * type of Cloud Function to deploy.
 */
export interface TriggerAnnotated {
    __trigger: {
        availableMemoryMb?: number;
        eventTrigger?: {
            eventType: string;
            resource: string;
            service: string;
        };
        failurePolicy?: FailurePolicy;
        httpsTrigger?: {
            invoker?: string[];
        };
        labels?: {
            [key: string]: string;
        };
        regions?: string[];
        schedule?: Schedule;
        timeout?: Duration;
        vpcConnector?: string;
        vpcConnectorEgressSettings?: string;
        serviceAccountEmail?: string;
        ingressSettings?: string;
        secrets?: string[];
    };
}
/**
 * @hidden
 * EndpointAnnotated is used to generate the manifest that conforms to the container contract.
 */
export interface EndpointAnnotated {
    __endpoint: ManifestEndpoint;
    __requiredAPIs?: ManifestRequiredAPI[];
}
/**
 * A Runnable has a `run` method which directly invokes the user-defined
 * function - useful for unit testing.
 */
export interface Runnable<T> {
    run: (data: T, context: any) => PromiseLike<any> | any;
}
/**
 * The Cloud Function type for HTTPS triggers. This should be exported from your
 * JavaScript file to define a Cloud Function.
 *
 * This type is a special JavaScript function which takes Express
 * [`Request`](https://expressjs.com/en/api.html#req) and
 * [`Response`](https://expressjs.com/en/api.html#res) objects as its only
 * arguments.
 */
export declare type HttpsFunction = TriggerAnnotated & EndpointAnnotated & ((req: Request, resp: Response) => void | Promise<void>);
/**
 * The Cloud Function type for all non-HTTPS triggers. This should be exported
 * from your JavaScript file to define a Cloud Function.
 *
 * This type is a special JavaScript function which takes a templated
 * `Event` object as its only argument.
 */
export declare type CloudFunction<T> = Runnable<T> & TriggerAnnotated & EndpointAnnotated & ((input: any, context?: any) => PromiseLike<any> | any);
/** @hidden */
export interface MakeCloudFunctionArgs<EventData> {
    after?: (raw: Event) => void;
    before?: (raw: Event) => void;
    contextOnlyHandler?: (context: EventContext) => PromiseLike<any> | any;
    dataConstructor?: (raw: Event) => EventData;
    eventType: string;
    handler?: (data: EventData, context: EventContext) => PromiseLike<any> | any;
    labels?: Record<string, string>;
    legacyEventType?: string;
    options?: DeploymentOptions;
    provider: string;
    service: string;
    triggerResource: () => string;
}
/** @hidden */
export declare function makeCloudFunction<EventData>({ after, before, contextOnlyHandler, dataConstructor, eventType, handler, labels, legacyEventType, options, provider, service, triggerResource, }: MakeCloudFunctionArgs<EventData>): CloudFunction<EventData>;
/** @hidden */
export declare function optionsToTrigger(options: DeploymentOptions): any;
export declare function optionsToEndpoint(options: DeploymentOptions): ManifestEndpoint;
