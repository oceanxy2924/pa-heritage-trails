import { ParamSpec } from './params/types';
/**
 * List of all regions supported by Cloud Functions v2
 */
export declare const SUPPORTED_REGIONS: readonly ["asia-northeast1", "europe-north1", "europe-west1", "europe-west4", "us-central1", "us-east1", "us-west1"];
/**
 * A region known to be supported by CloudFunctions v2
 */
export declare type SupportedRegion = typeof SUPPORTED_REGIONS[number];
/**
 * Cloud Functions v2 min timeout value.
 */
export declare const MIN_TIMEOUT_SECONDS = 1;
/**
 * Cloud Functions v2 max timeout value for event handlers.
 */
export declare const MAX_EVENT_TIMEOUT_SECONDS = 540;
/**
 * Cloud Functions v2 max timeout for HTTPS functions.
 */
export declare const MAX_HTTPS_TIMEOUT_SECONDS = 36000;
/**
 * Maximum number of requests to serve on a single instance.
 */
export declare const MAX_CONCURRENCY = 1000;
/**
 * List of available memory options supported by Cloud Functions.
 */
export declare const SUPPORTED_MEMORY_OPTIONS: readonly ["128MB", "256MB", "512MB", "1GB", "2GB", "4GB", "8GB", "16GB", "32GB"];
/**
 * A supported memory option.
 */
export declare type MemoryOption = typeof SUPPORTED_MEMORY_OPTIONS[number];
/**
 * List of available options for VpcConnectorEgressSettings.
 */
export declare const SUPPORTED_VPC_EGRESS_SETTINGS: readonly ["PRIVATE_RANGES_ONLY", "ALL_TRAFFIC"];
/**
 * A valid VPC Egress setting.
 */
export declare type VpcEgressSetting = typeof SUPPORTED_VPC_EGRESS_SETTINGS[number];
/**
 * List of available options for IngressSettings.
 */
export declare const SUPPORTED_INGRESS_SETTINGS: readonly ["ALLOW_ALL", "ALLOW_INTERNAL_ONLY", "ALLOW_INTERNAL_AND_GCLB"];
export declare type IngressSetting = typeof SUPPORTED_INGRESS_SETTINGS[number];
/**
 * GlobalOptions are options that can be set across an entire project.
 * These options are common to HTTPS and Event handling functions.
 */
export interface GlobalOptions {
    /**
     * Region where functions should be deployed.
     * HTTP functions can override and specify more than one region.
     */
    region?: SupportedRegion | string;
    /**
     * Amount of memory to allocate to a function.
     * A value of null restores the defaults of 256MB.
     */
    memory?: MemoryOption | null;
    /**
     * Timeout for the function in sections, possible values are 0 to 540.
     * HTTPS functions can specify a higher timeout.
     * A value of null restores the default of 60s
     */
    timeoutSeconds?: number | null;
    /**
     * Min number of actual instances to be running at a given time.
     * Instances will be billed for memory allocation and 10% of CPU allocation
     * while idle.
     * A value of null restores the default min instances.
     */
    minInstances?: number | null;
    /**
     * Max number of instances to be running in parallel.
     * A value of null restores the default max instances.
     */
    maxInstances?: number | null;
    /**
     * Number of requests a function can serve at once.
     * Can only be applied to functions running on Cloud Functions v2.
     * A value of null restores the default concurrency.
     */
    concurrency?: number | null;
    /**
     * Connect cloud function to specified VPC connector.
     * A value of null removes the VPC connector
     */
    vpcConnector?: string | null;
    /**
     * Egress settings for VPC connector.
     * A value of null turns off VPC connector egress settings
     */
    vpcConnectorEgressSettings?: VpcEgressSetting | null;
    /**
     * Specific service account for the function to run as.
     * A value of null restores the default service account.
     */
    serviceAccount?: string | null;
    /**
     * Ingress settings which control where this function can be called from.
     * A value of null turns off ingress settings.
     */
    ingressSettings?: IngressSetting | null;
    /**
     * User labels to set on the function.
     */
    labels?: Record<string, string>;
    /**
     * Invoker to set access control on https functions.
     */
    invoker?: 'public' | 'private' | string | string[];
}
/**
 * Sets default options for all functions written using the v2 SDK.
 * @param options Options to set as default
 */
export declare function setGlobalOptions(options: GlobalOptions): void;
/**
 * Options that can be set on an individual event-handling Cloud Function.
 */
export interface EventHandlerOptions extends GlobalOptions {
    retry?: boolean;
}
/**
 * @hidden
 */
export declare function __getSpec(): {
    globalOptions: GlobalOptions;
    params: ParamSpec[];
};
