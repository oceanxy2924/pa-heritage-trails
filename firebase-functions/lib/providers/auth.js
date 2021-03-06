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
exports.UserBuilder = exports._userWithOptions = exports.user = exports.service = exports.provider = exports.userRecordConstructor = exports.UserRecordMetadata = void 0;
const identity_1 = require("../common/providers/identity");
Object.defineProperty(exports, "UserRecordMetadata", { enumerable: true, get: function () { return identity_1.UserRecordMetadata; } });
Object.defineProperty(exports, "userRecordConstructor", { enumerable: true, get: function () { return identity_1.userRecordConstructor; } });
const cloud_functions_1 = require("../cloud-functions");
/** @hidden */
exports.provider = 'google.firebase.auth';
/** @hidden */
exports.service = 'firebaseauth.googleapis.com';
/**
 * Handle events related to Firebase authentication users.
 */
function user() {
    return _userWithOptions({});
}
exports.user = user;
/** @hidden */
function _userWithOptions(options) {
    return new UserBuilder(() => {
        if (!process.env.GCLOUD_PROJECT) {
            throw new Error('process.env.GCLOUD_PROJECT is not set.');
        }
        return 'projects/' + process.env.GCLOUD_PROJECT;
    }, options);
}
exports._userWithOptions = _userWithOptions;
/** Builder used to create Cloud Functions for Firebase Auth user lifecycle events. */
class UserBuilder {
    /** @hidden */
    constructor(triggerResource, options) {
        this.triggerResource = triggerResource;
        this.options = options;
    }
    static dataConstructor(raw) {
        return identity_1.userRecordConstructor(raw.data);
    }
    /** Respond to the creation of a Firebase Auth user. */
    onCreate(handler) {
        return this.onOperation(handler, 'user.create');
    }
    /** Respond to the deletion of a Firebase Auth user. */
    onDelete(handler) {
        return this.onOperation(handler, 'user.delete');
    }
    onOperation(handler, eventType) {
        return cloud_functions_1.makeCloudFunction({
            handler,
            provider: exports.provider,
            eventType,
            service: exports.service,
            triggerResource: this.triggerResource,
            dataConstructor: UserBuilder.dataConstructor,
            legacyEventType: `providers/firebase.auth/eventTypes/${eventType}`,
            options: this.options,
        });
    }
}
exports.UserBuilder = UserBuilder;
