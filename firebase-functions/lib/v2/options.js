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
exports.__getSpec = exports.optionsToEndpoint = exports.optionsToTriggerAnnotations = exports.getGlobalOptions = exports.setGlobalOptions = exports.SUPPORTED_INGRESS_SETTINGS = exports.SUPPORTED_VPC_EGRESS_SETTINGS = exports.SUPPORTED_MEMORY_OPTIONS = exports.MAX_CONCURRENCY = exports.MAX_HTTPS_TIMEOUT_SECONDS = exports.MAX_EVENT_TIMEOUT_SECONDS = exports.MIN_TIMEOUT_SECONDS = exports.SUPPORTED_REGIONS = void 0;
const encoding_1 = require("../common/encoding");
const logger = require("../logger");
const params_1 = require("./params");
/**
 * List of all regions supported by Cloud Functions v2
 */
exports.SUPPORTED_REGIONS = [
    'asia-northeast1',
    'europe-north1',
    'europe-west1',
    'europe-west4',
    'us-central1',
    'us-east1',
    'us-west1',
];
/**
 * Cloud Functions v2 min timeout value.
 */
exports.MIN_TIMEOUT_SECONDS = 1;
/**
 * Cloud Functions v2 max timeout value for event handlers.
 */
exports.MAX_EVENT_TIMEOUT_SECONDS = 540;
/**
 * Cloud Functions v2 max timeout for HTTPS functions.
 */
exports.MAX_HTTPS_TIMEOUT_SECONDS = 36000;
/**
 * Maximum number of requests to serve on a single instance.
 */
exports.MAX_CONCURRENCY = 1000;
/**
 * List of available memory options supported by Cloud Functions.
 */
exports.SUPPORTED_MEMORY_OPTIONS = [
    '128MB',
    '256MB',
    '512MB',
    '1GB',
    '2GB',
    '4GB',
    '8GB',
    '16GB',
    '32GB',
];
const MemoryOptionToMB = {
    '128MB': 128,
    '256MB': 256,
    '512MB': 512,
    '1GB': 1024,
    '2GB': 2048,
    '4GB': 4096,
    '8GB': 8192,
    '16GB': 16384,
    '32GB': 32768,
};
/**
 * List of available options for VpcConnectorEgressSettings.
 */
exports.SUPPORTED_VPC_EGRESS_SETTINGS = [
    'PRIVATE_RANGES_ONLY',
    'ALL_TRAFFIC',
];
/**
 * List of available options for IngressSettings.
 */
exports.SUPPORTED_INGRESS_SETTINGS = [
    'ALLOW_ALL',
    'ALLOW_INTERNAL_ONLY',
    'ALLOW_INTERNAL_AND_GCLB',
];
let globalOptions;
/**
 * Sets default options for all functions written using the v2 SDK.
 * @param options Options to set as default
 */
function setGlobalOptions(options) {
    if (globalOptions) {
        logger.warn('Calling setGlobalOptions twice leads to undefined behavior');
    }
    globalOptions = options;
}
exports.setGlobalOptions = setGlobalOptions;
/**
 * Get the currently set default options.
 * Used only for trigger generation.
 * @internal
 */
function getGlobalOptions() {
    return globalOptions || {};
}
exports.getGlobalOptions = getGlobalOptions;
/**
 * Apply GlobalOptions to trigger definitions.
 * @internal
 */
function optionsToTriggerAnnotations(opts) {
    const annotation = {};
    encoding_1.copyIfPresent(annotation, opts, 'concurrency', 'minInstances', 'maxInstances', 'ingressSettings', 'labels', 'vpcConnector', 'vpcConnectorEgressSettings');
    encoding_1.convertIfPresent(annotation, opts, 'availableMemoryMb', 'memory', (mem) => {
        return MemoryOptionToMB[mem];
    });
    encoding_1.convertIfPresent(annotation, opts, 'regions', 'region', (region) => {
        if (typeof region === 'string') {
            return [region];
        }
        return region;
    });
    encoding_1.convertIfPresent(annotation, opts, 'serviceAccountEmail', 'serviceAccount', encoding_1.serviceAccountFromShorthand);
    encoding_1.convertIfPresent(annotation, opts, 'timeout', 'timeoutSeconds', encoding_1.durationFromSeconds);
    encoding_1.convertIfPresent(annotation, opts, 'failurePolicy', 'retry', (retry) => {
        return retry ? { retry: true } : null;
    });
    return annotation;
}
exports.optionsToTriggerAnnotations = optionsToTriggerAnnotations;
/**
 * Apply GlobalOptions to endpoint manifest.
 * @internal
 */
function optionsToEndpoint(opts) {
    const endpoint = {};
    encoding_1.copyIfPresent(endpoint, opts, 'concurrency', 'minInstances', 'maxInstances', 'ingressSettings', 'labels', 'timeoutSeconds');
    encoding_1.convertIfPresent(endpoint, opts, 'serviceAccountEmail', 'serviceAccount');
    if (opts.vpcConnector) {
        const vpc = { connector: opts.vpcConnector };
        encoding_1.convertIfPresent(vpc, opts, 'egressSettings', 'vpcConnectorEgressSettings');
        endpoint.vpc = vpc;
    }
    encoding_1.convertIfPresent(endpoint, opts, 'availableMemoryMb', 'memory', (mem) => {
        const memoryLookup = {
            '128MB': 128,
            '256MB': 256,
            '512MB': 512,
            '1GB': 1024,
            '2GB': 2048,
            '4GB': 4096,
            '8GB': 8192,
        };
        return memoryLookup[mem];
    });
    encoding_1.convertIfPresent(endpoint, opts, 'region', 'region', (region) => {
        if (typeof region === 'string') {
            return [region];
        }
        return region;
    });
    return endpoint;
}
exports.optionsToEndpoint = optionsToEndpoint;
/**
 * @hidden
 */
function __getSpec() {
    return {
        globalOptions: getGlobalOptions(),
        params: params_1.declaredParams.map((p) => p.toSpec()),
    };
}
exports.__getSpec = __getSpec;
