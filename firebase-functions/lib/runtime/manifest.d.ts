/**
 * An definition of a function as appears in the Manifest.
 */
export interface ManifestEndpoint {
    entryPoint?: string;
    region?: string[];
    platform?: string;
    availableMemoryMb?: number;
    maxInstances?: number;
    minInstances?: number;
    concurrency?: number;
    serviceAccountEmail?: string;
    timeoutSeconds?: number;
    vpc?: {
        connector: string;
        egressSettings?: string;
    };
    labels?: Record<string, string>;
    ingressSettings?: string;
    environmentVariables?: Record<string, string>;
    secretEnvironmentVariables?: Array<{
        key: string;
        secret?: string;
    }>;
    httpsTrigger?: {
        invoker?: string[];
    };
    callableTrigger?: {};
    eventTrigger?: {
        eventFilters: Record<string, string>;
        eventFilterPathPatterns?: Record<string, string>;
        channel?: string;
        eventType: string;
        retry: boolean;
        region?: string;
        serviceAccountEmail?: string;
    };
    scheduleTrigger?: {
        schedule?: string;
        timezone?: string;
        retryConfig?: {
            retryCount?: number;
            maxRetryDuration?: string;
            minBackoffDuration?: string;
            maxBackoffDuration?: string;
            maxDoublings?: number;
        };
    };
}
export interface ManifestRequiredAPI {
    api: string;
    reason: string;
}
/**
 * An definition of a function deployment as appears in the Manifest.
 */
export interface ManifestStack {
    specVersion: 'v1alpha1';
    requiredAPIs: ManifestRequiredAPI[];
    endpoints: Record<string, ManifestEndpoint>;
}
