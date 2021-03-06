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
exports.getStorage = void 0;
/**
 * Cloud Storage for Firebase.
 *
 * @packageDocumentation
 */
var app_1 = require("../app");
var storage_1 = require("./storage");
var storage_2 = require("./storage");
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_2.Storage; } });
/**
 * Gets the {@link Storage} service for the default app or a given app.
 *
 * `getStorage()` can be called with no arguments to access the default
 * app's `Storage` service or as `getStorage(app)` to access the
 * `Storage` service associated with a specific app.
 *
 * @example
 * ```javascript
 * // Get the Storage service for the default app
 * const defaultStorage = getStorage();
 * ```
 *
 * @example
 * ```javascript
 * // Get the Storage service for a given app
 * const otherStorage = getStorage(otherApp);
 * ```
 */
function getStorage(app) {
    if (typeof app === 'undefined') {
        app = app_1.getApp();
    }
    var firebaseApp = app;
    return firebaseApp.getOrInitService('storage', function (app) { return new storage_1.Storage(app); });
}
exports.getStorage = getStorage;
