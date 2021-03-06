"use strict";
// The MIT License (MIT)
//
// Copyright (c) 2017 Firebase
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
exports.getOptsAndBucket = exports.onOperation = exports.onObjectMetadataUpdated = exports.onObjectDeleted = exports.onObjectFinalized = exports.onObjectArchived = exports.metadataUpdatedEvent = exports.deletedEvent = exports.finalizedEvent = exports.archivedEvent = void 0;
const options = require("../options");
const config_1 = require("../../config");
const encoding_1 = require("../../common/encoding");
/** @internal */
exports.archivedEvent = 'google.cloud.storage.object.v1.archived';
/** @internal */
exports.finalizedEvent = 'google.cloud.storage.object.v1.finalized';
/** @internal */
exports.deletedEvent = 'google.cloud.storage.object.v1.deleted';
/** @internal */
exports.metadataUpdatedEvent = 'google.cloud.storage.object.v1.metadataUpdated';
function onObjectArchived(buketOrOptsOrHandler, handler) {
    return onOperation(exports.archivedEvent, buketOrOptsOrHandler, handler);
}
exports.onObjectArchived = onObjectArchived;
function onObjectFinalized(buketOrOptsOrHandler, handler) {
    return onOperation(exports.finalizedEvent, buketOrOptsOrHandler, handler);
}
exports.onObjectFinalized = onObjectFinalized;
function onObjectDeleted(buketOrOptsOrHandler, handler) {
    return onOperation(exports.deletedEvent, buketOrOptsOrHandler, handler);
}
exports.onObjectDeleted = onObjectDeleted;
function onObjectMetadataUpdated(buketOrOptsOrHandler, handler) {
    return onOperation(exports.metadataUpdatedEvent, buketOrOptsOrHandler, handler);
}
exports.onObjectMetadataUpdated = onObjectMetadataUpdated;
/** @internal */
function onOperation(eventType, bucketOrOptsOrHandler, handler) {
    if (typeof bucketOrOptsOrHandler === 'function') {
        handler = bucketOrOptsOrHandler;
        bucketOrOptsOrHandler = {};
    }
    const [opts, bucket] = getOptsAndBucket(bucketOrOptsOrHandler);
    const func = (raw) => {
        return handler(raw);
    };
    func.run = handler;
    Object.defineProperty(func, '__trigger', {
        get: () => {
            const baseOpts = options.optionsToTriggerAnnotations(options.getGlobalOptions());
            const specificOpts = options.optionsToTriggerAnnotations(opts);
            return {
                platform: 'gcfv2',
                ...baseOpts,
                ...specificOpts,
                labels: {
                    ...baseOpts === null || baseOpts === void 0 ? void 0 : baseOpts.labels,
                    ...specificOpts === null || specificOpts === void 0 ? void 0 : specificOpts.labels,
                },
                eventTrigger: {
                    eventType,
                    resource: bucket, // TODO(colerogers): replace with 'bucket,' eventually
                },
            };
        },
    });
    // TypeScript doesn't recognize defineProperty as adding a property and complains
    // that __endpoint doesn't exist. We can either cast to any and lose all type safety
    // or we can just assign a meaningless value before calling defineProperty.
    func.__endpoint = {};
    // SDK may attempt to read FIREBASE_CONFIG env var to fetch the default bucket name.
    // To prevent runtime errors when FIREBASE_CONFIG env var is missing, we use getters.
    Object.defineProperty(func, '__endpoint', {
        get: () => {
            const baseOpts = options.optionsToEndpoint(options.getGlobalOptions());
            const specificOpts = options.optionsToEndpoint(opts);
            const endpoint = {
                platform: 'gcfv2',
                ...baseOpts,
                ...specificOpts,
                labels: {
                    ...baseOpts === null || baseOpts === void 0 ? void 0 : baseOpts.labels,
                    ...specificOpts === null || specificOpts === void 0 ? void 0 : specificOpts.labels,
                },
                eventTrigger: {
                    eventType,
                    eventFilters: { bucket },
                    retry: false,
                },
            };
            encoding_1.copyIfPresent(endpoint.eventTrigger, opts, 'retry', 'retry');
            return endpoint;
        },
    });
    return func;
}
exports.onOperation = onOperation;
/** @internal */
function getOptsAndBucket(bucketOrOpts) {
    let bucket;
    let opts;
    if (typeof bucketOrOpts === 'string') {
        bucket = bucketOrOpts;
        opts = {};
    }
    else {
        bucket = bucketOrOpts.bucket || config_1.firebaseConfig().storageBucket;
        opts = { ...bucketOrOpts };
        delete opts.bucket;
    }
    if (!bucket) {
        throw new Error('Missing bucket name. If you are unit testing, please provide a bucket name' +
            ' by providing bucket name directly in the event handler or by setting process.env.FIREBASE_CONFIG.');
    }
    if (!/^[a-z\d][a-z\d\\._-]{1,230}[a-z\d]$/.test(bucket)) {
        throw new Error(`Invalid bucket name ${bucket}`);
    }
    return [opts, bucket];
}
exports.getOptsAndBucket = getOptsAndBucket;
