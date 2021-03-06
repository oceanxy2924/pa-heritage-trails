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
exports.getFirestore = void 0;
var app_1 = require("../app");
var firestore_internal_1 = require("./firestore-internal");
var firestore_1 = require("@google-cloud/firestore");
Object.defineProperty(exports, "BulkWriter", { enumerable: true, get: function () { return firestore_1.BulkWriter; } });
Object.defineProperty(exports, "BundleBuilder", { enumerable: true, get: function () { return firestore_1.BundleBuilder; } });
Object.defineProperty(exports, "CollectionGroup", { enumerable: true, get: function () { return firestore_1.CollectionGroup; } });
Object.defineProperty(exports, "CollectionReference", { enumerable: true, get: function () { return firestore_1.CollectionReference; } });
Object.defineProperty(exports, "DocumentReference", { enumerable: true, get: function () { return firestore_1.DocumentReference; } });
Object.defineProperty(exports, "DocumentSnapshot", { enumerable: true, get: function () { return firestore_1.DocumentSnapshot; } });
Object.defineProperty(exports, "FieldPath", { enumerable: true, get: function () { return firestore_1.FieldPath; } });
Object.defineProperty(exports, "FieldValue", { enumerable: true, get: function () { return firestore_1.FieldValue; } });
Object.defineProperty(exports, "Firestore", { enumerable: true, get: function () { return firestore_1.Firestore; } });
Object.defineProperty(exports, "GeoPoint", { enumerable: true, get: function () { return firestore_1.GeoPoint; } });
Object.defineProperty(exports, "GrpcStatus", { enumerable: true, get: function () { return firestore_1.GrpcStatus; } });
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return firestore_1.Query; } });
Object.defineProperty(exports, "QueryDocumentSnapshot", { enumerable: true, get: function () { return firestore_1.QueryDocumentSnapshot; } });
Object.defineProperty(exports, "QueryPartition", { enumerable: true, get: function () { return firestore_1.QueryPartition; } });
Object.defineProperty(exports, "QuerySnapshot", { enumerable: true, get: function () { return firestore_1.QuerySnapshot; } });
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return firestore_1.Timestamp; } });
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return firestore_1.Transaction; } });
Object.defineProperty(exports, "WriteBatch", { enumerable: true, get: function () { return firestore_1.WriteBatch; } });
Object.defineProperty(exports, "WriteResult", { enumerable: true, get: function () { return firestore_1.WriteResult; } });
Object.defineProperty(exports, "v1", { enumerable: true, get: function () { return firestore_1.v1; } });
Object.defineProperty(exports, "setLogFunction", { enumerable: true, get: function () { return firestore_1.setLogFunction; } });
/**
 * Gets the {@link https://googleapis.dev/nodejs/firestore/latest/Firestore.html | Firestore}
 * service for the default app or a given app.
 *
 * `getFirestore()` can be called with no arguments to access the default
 * app's `Firestore` service or as `getFirestore(app)` to access the
 * `Firestore` service associated with a specific app.
 *
 * @example
 * ```javascript
 * // Get the Firestore service for the default app
 * const defaultFirestore = getFirestore();
 * ```
 *
 * @example
 * ```javascript
 * // Get the Firestore service for a specific app
 * const otherFirestore = getFirestore(app);
 * ```
 *
 * @param App - whose `Firestore` service to
 *   return. If not provided, the default `Firestore` service will be returned.
 *
 * @returns The default {@link https://googleapis.dev/nodejs/firestore/latest/Firestore.html | Firestore}
 *   service if no app is provided or the `Firestore` service associated with the
 *   provided app.
 */
function getFirestore(app) {
    if (typeof app === 'undefined') {
        app = app_1.getApp();
    }
    var firebaseApp = app;
    var firestoreService = firebaseApp.getOrInitService('firestore', function (app) { return new firestore_internal_1.FirestoreService(app); });
    return firestoreService.client;
}
exports.getFirestore = getFirestore;
