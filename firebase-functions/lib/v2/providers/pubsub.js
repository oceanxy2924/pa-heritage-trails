"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessagePublished = exports.Message = void 0;
const options = require("../options");
const encoding_1 = require("../../common/encoding");
/**
 * Interface representing a Google Cloud Pub/Sub message.
 *
 * @param data Payload of a Pub/Sub message.
 */
class Message {
    constructor(data) {
        this.messageId = data.messageId;
        this.data = data.data;
        this.attributes = data.attributes || {};
        this.orderingKey = data.orderingKey || '';
        this.publishTime = data.publishTime || new Date().toISOString();
        this._json = data.json;
    }
    /**
     * The JSON data payload of this message object, if any.
     */
    get json() {
        if (typeof this._json === 'undefined') {
            try {
                this._json = JSON.parse(Buffer.from(this.data, 'base64').toString('utf8'));
            }
            catch (err) {
                throw new Error(`Unable to parse Pub/Sub message data as JSON: ${err.message}`);
            }
        }
        return this._json;
    }
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @return A JSON-serializable representation of this object.
     */
    toJSON() {
        const json = {
            messageId: this.messageId,
            data: this.data,
            publishTime: this.publishTime,
        };
        if (Object.keys(this.attributes).length) {
            json.attributes = this.attributes;
        }
        if (this.orderingKey) {
            json.orderingKey = this.orderingKey;
        }
        return json;
    }
}
exports.Message = Message;
function onMessagePublished(topicOrOptions, handler) {
    let topic;
    let opts;
    if (typeof topicOrOptions === 'string') {
        topic = topicOrOptions;
        opts = {};
    }
    else {
        topic = topicOrOptions.topic;
        opts = { ...topicOrOptions };
        delete opts.topic;
    }
    const func = (raw) => {
        const messagePublishedData = raw.data;
        messagePublishedData.message = new Message(messagePublishedData.message);
        return handler(raw);
    };
    func.run = handler;
    Object.defineProperty(func, '__trigger', {
        get: () => {
            const baseOpts = options.optionsToTriggerAnnotations(options.getGlobalOptions());
            const specificOpts = options.optionsToTriggerAnnotations(opts);
            return {
                // TODO(inlined): Remove "apiVersion" once the CLI has migrated to
                // "platform"
                apiVersion: 2,
                platform: 'gcfv2',
                ...baseOpts,
                ...specificOpts,
                labels: {
                    ...baseOpts === null || baseOpts === void 0 ? void 0 : baseOpts.labels,
                    ...specificOpts === null || specificOpts === void 0 ? void 0 : specificOpts.labels,
                },
                eventTrigger: {
                    eventType: 'google.cloud.pubsub.topic.v1.messagePublished',
                    resource: `projects/${process.env.GCLOUD_PROJECT}/topics/${topic}`,
                },
            };
        },
    });
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
            eventType: 'google.cloud.pubsub.topic.v1.messagePublished',
            eventFilters: { topic },
            retry: false,
        },
    };
    encoding_1.copyIfPresent(endpoint.eventTrigger, opts, 'retry', 'retry');
    func.__endpoint = endpoint;
    return func;
}
exports.onMessagePublished = onMessagePublished;
