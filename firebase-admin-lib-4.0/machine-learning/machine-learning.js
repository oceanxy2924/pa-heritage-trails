/*! firebase-admin v10.1.0 */
"use strict";
/*!
 * Copyright 2020 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.MachineLearning = void 0;
var index_1 = require("../storage/index");
var error_1 = require("../utils/error");
var validator = require("../utils/validator");
var deep_copy_1 = require("../utils/deep-copy");
var utils = require("../utils");
var machine_learning_api_client_1 = require("./machine-learning-api-client");
var machine_learning_utils_1 = require("./machine-learning-utils");
/**
 * The Firebase `MachineLearning` service interface.
 */
var MachineLearning = /** @class */ (function () {
    /**
     * @param app - The app for this ML service.
     * @constructor
     * @internal
     */
    function MachineLearning(app) {
        if (!validator.isNonNullObject(app) || !('options' in app)) {
            throw new error_1.FirebaseError({
                code: 'machine-learning/invalid-argument',
                message: 'First argument passed to admin.machineLearning() must be a ' +
                    'valid Firebase app instance.',
            });
        }
        this.appInternal = app;
        this.client = new machine_learning_api_client_1.MachineLearningApiClient(app);
    }
    Object.defineProperty(MachineLearning.prototype, "app", {
        /**
         *  The {@link firebase-admin.app#App} associated with the current `MachineLearning`
         *  service instance.
         */
        get: function () {
            return this.appInternal;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a model in the current Firebase project.
     *
     * @param model - The model to create.
     *
     * @returns A Promise fulfilled with the created model.
     */
    MachineLearning.prototype.createModel = function (model) {
        var _this = this;
        return this.signUrlIfPresent(model)
            .then(function (modelContent) { return _this.client.createModel(modelContent); })
            .then(function (operation) { return _this.client.handleOperation(operation); })
            .then(function (modelResponse) { return new Model(modelResponse, _this.client); });
    };
    /**
     * Updates a model's metadata or model file.
     *
     * @param modelId - The ID of the model to update.
     * @param model - The model fields to update.
     *
     * @returns A Promise fulfilled with the updated model.
     */
    MachineLearning.prototype.updateModel = function (modelId, model) {
        var _this = this;
        var updateMask = utils.generateUpdateMask(model);
        return this.signUrlIfPresent(model)
            .then(function (modelContent) { return _this.client.updateModel(modelId, modelContent, updateMask); })
            .then(function (operation) { return _this.client.handleOperation(operation); })
            .then(function (modelResponse) { return new Model(modelResponse, _this.client); });
    };
    /**
     * Publishes a Firebase ML model.
     *
     * A published model can be downloaded to client apps.
     *
     * @param modelId - The ID of the model to publish.
     *
     * @returns A Promise fulfilled with the published model.
     */
    MachineLearning.prototype.publishModel = function (modelId) {
        return this.setPublishStatus(modelId, true);
    };
    /**
     * Unpublishes a Firebase ML model.
     *
     * @param modelId - The ID of the model to unpublish.
     *
     * @returns A Promise fulfilled with the unpublished model.
     */
    MachineLearning.prototype.unpublishModel = function (modelId) {
        return this.setPublishStatus(modelId, false);
    };
    /**
     * Gets the model specified by the given ID.
     *
     * @param modelId - The ID of the model to get.
     *
     * @returns A Promise fulfilled with the model object.
     */
    MachineLearning.prototype.getModel = function (modelId) {
        var _this = this;
        return this.client.getModel(modelId)
            .then(function (modelResponse) { return new Model(modelResponse, _this.client); });
    };
    /**
     * Lists the current project's models.
     *
     * @param options - The listing options.
     *
     * @returns A promise that
     *     resolves with the current (filtered) list of models and the next page
     *     token. For the last page, an empty list of models and no page token
     *     are returned.
     */
    MachineLearning.prototype.listModels = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this.client.listModels(options)
            .then(function (resp) {
            if (!validator.isNonNullObject(resp)) {
                throw new machine_learning_utils_1.FirebaseMachineLearningError('invalid-argument', "Invalid ListModels response: " + JSON.stringify(resp));
            }
            var models = [];
            if (resp.models) {
                models = resp.models.map(function (rs) { return new Model(rs, _this.client); });
            }
            var result = { models: models };
            if (resp.nextPageToken) {
                result.pageToken = resp.nextPageToken;
            }
            return result;
        });
    };
    /**
     * Deletes a model from the current project.
     *
     * @param modelId - The ID of the model to delete.
     */
    MachineLearning.prototype.deleteModel = function (modelId) {
        return this.client.deleteModel(modelId);
    };
    MachineLearning.prototype.setPublishStatus = function (modelId, publish) {
        var _this = this;
        var updateMask = ['state.published'];
        var options = { state: { published: publish } };
        return this.client.updateModel(modelId, options, updateMask)
            .then(function (operation) { return _this.client.handleOperation(operation); })
            .then(function (modelResponse) { return new Model(modelResponse, _this.client); });
    };
    MachineLearning.prototype.signUrlIfPresent = function (options) {
        var modelOptions = deep_copy_1.deepCopy(options);
        if (machine_learning_api_client_1.isGcsTfliteModelOptions(modelOptions)) {
            return this.signUrl(modelOptions.tfliteModel.gcsTfliteUri)
                .then(function (uri) {
                modelOptions.tfliteModel.gcsTfliteUri = uri;
                return modelOptions;
            })
                .catch(function (err) {
                throw new machine_learning_utils_1.FirebaseMachineLearningError('internal-error', "Error during signing upload url: " + err.message);
            });
        }
        return Promise.resolve(modelOptions);
    };
    MachineLearning.prototype.signUrl = function (unsignedUrl) {
        var MINUTES_IN_MILLIS = 60 * 1000;
        var URL_VALID_DURATION = 10 * MINUTES_IN_MILLIS;
        var gcsRegex = /^gs:\/\/([a-z0-9_.-]{3,63})\/(.+)$/;
        var matches = gcsRegex.exec(unsignedUrl);
        if (!matches) {
            throw new machine_learning_utils_1.FirebaseMachineLearningError('invalid-argument', "Invalid unsigned url: " + unsignedUrl);
        }
        var bucketName = matches[1];
        var blobName = matches[2];
        var bucket = index_1.getStorage(this.app).bucket(bucketName);
        var blob = bucket.file(blobName);
        return blob.getSignedUrl({
            action: 'read',
            expires: Date.now() + URL_VALID_DURATION,
        }).then(function (signUrl) { return signUrl[0]; });
    };
    return MachineLearning;
}());
exports.MachineLearning = MachineLearning;
/**
 * A Firebase ML Model output object.
 */
var Model = /** @class */ (function () {
    /**
     * @internal
     */
    function Model(model, client) {
        this.model = Model.validateAndClone(model);
        this.client = client;
    }
    Object.defineProperty(Model.prototype, "modelId", {
        /** The ID of the model. */
        get: function () {
            return extractModelId(this.model.name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "displayName", {
        /**
         * The model's name. This is the name you use from your app to load the
         * model.
         */
        get: function () {
            return this.model.displayName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "tags", {
        /**
         * The model's tags, which can be used to group or filter models in list
         * operations.
         */
        get: function () {
            return this.model.tags || [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "createTime", {
        /** The timestamp of the model's creation. */
        get: function () {
            return new Date(this.model.createTime).toUTCString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "updateTime", {
        /** The timestamp of the model's most recent update. */
        get: function () {
            return new Date(this.model.updateTime).toUTCString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "validationError", {
        /** Error message when model validation fails. */
        get: function () {
            var _a, _b;
            return (_b = (_a = this.model.state) === null || _a === void 0 ? void 0 : _a.validationError) === null || _b === void 0 ? void 0 : _b.message;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "published", {
        /** True if the model is published. */
        get: function () {
            var _a;
            return ((_a = this.model.state) === null || _a === void 0 ? void 0 : _a.published) || false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "etag", {
        /**
         * The ETag identifier of the current version of the model. This value
         * changes whenever you update any of the model's properties.
         */
        get: function () {
            return this.model.etag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "modelHash", {
        /**
         * The hash of the model's `tflite` file. This value changes only when
         * you upload a new TensorFlow Lite model.
         */
        get: function () {
            return this.model.modelHash;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "tfliteModel", {
        /** Metadata about the model's TensorFlow Lite model file. */
        get: function () {
            // Make a copy so people can't directly modify the private this.model object.
            return deep_copy_1.deepCopy(this.model.tfliteModel);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "locked", {
        /**
         * True if the model is locked by a server-side operation. You can't make
         * changes to a locked model. See {@link Model.waitForUnlocked}.
         */
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.model.activeOperations) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Return the model as a JSON object.
     */
    Model.prototype.toJSON = function () {
        // We can't just return this.model because it has extra fields and
        // different formats etc. So we build the expected model object.
        var jsonModel = {
            modelId: this.modelId,
            displayName: this.displayName,
            tags: this.tags,
            createTime: this.createTime,
            updateTime: this.updateTime,
            published: this.published,
            etag: this.etag,
            locked: this.locked,
        };
        // Also add possibly undefined fields if they exist.
        if (this.validationError) {
            jsonModel['validationError'] = this.validationError;
        }
        if (this.modelHash) {
            jsonModel['modelHash'] = this.modelHash;
        }
        if (this.tfliteModel) {
            jsonModel['tfliteModel'] = this.tfliteModel;
        }
        return jsonModel;
    };
    /**
     * Wait for the model to be unlocked.
     *
     * @param maxTimeMillis - The maximum time in milliseconds to wait.
     *     If not specified, a default maximum of 2 minutes is used.
     *
     * @returns A promise that resolves when the model is unlocked
     *   or the maximum wait time has passed.
     */
    Model.prototype.waitForUnlocked = function (maxTimeMillis) {
        var _this = this;
        var _a, _b;
        if (((_b = (_a = this.model.activeOperations) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
            // The client will always be defined on Models that have activeOperations
            // because models with active operations came back from the server and
            // were constructed with a non-empty client.
            return this.client.handleOperation(this.model.activeOperations[0], { wait: true, maxTimeMillis: maxTimeMillis })
                .then(function (modelResponse) {
                _this.model = Model.validateAndClone(modelResponse);
            });
        }
        return Promise.resolve();
    };
    Model.validateAndClone = function (model) {
        if (!validator.isNonNullObject(model) ||
            !validator.isNonEmptyString(model.name) ||
            !validator.isNonEmptyString(model.createTime) ||
            !validator.isNonEmptyString(model.updateTime) ||
            !validator.isNonEmptyString(model.displayName) ||
            !validator.isNonEmptyString(model.etag)) {
            throw new machine_learning_utils_1.FirebaseMachineLearningError('invalid-server-response', "Invalid Model response: " + JSON.stringify(model));
        }
        var tmpModel = deep_copy_1.deepCopy(model);
        // If tflite Model is specified, it must have a source consisting of
        // oneof {gcsTfliteUri, automlModel}
        if (model.tfliteModel &&
            !validator.isNonEmptyString(model.tfliteModel.gcsTfliteUri) &&
            !validator.isNonEmptyString(model.tfliteModel.automlModel)) {
            // If we have some other source, ignore the whole tfliteModel.
            delete tmpModel.tfliteModel;
        }
        // Remove '@type' field. We don't need it.
        if (tmpModel['@type']) {
            delete tmpModel['@type'];
        }
        return tmpModel;
    };
    return Model;
}());
exports.Model = Model;
function extractModelId(resourceName) {
    return resourceName.split('/').pop();
}
