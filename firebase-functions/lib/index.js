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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.testLab = exports.tasks = exports.storage = exports.remoteConfig = exports.pubsub = exports.https = exports.handler = exports.firestore = exports.database = exports.auth = exports.app = exports.analytics = void 0;
// Providers:
const analytics = require("./providers/analytics");
exports.analytics = analytics;
const auth = require("./providers/auth");
exports.auth = auth;
const database = require("./providers/database");
exports.database = database;
const firestore = require("./providers/firestore");
exports.firestore = firestore;
const https = require("./providers/https");
exports.https = https;
const pubsub = require("./providers/pubsub");
exports.pubsub = pubsub;
const remoteConfig = require("./providers/remoteConfig");
exports.remoteConfig = remoteConfig;
const storage = require("./providers/storage");
exports.storage = storage;
const tasks = require("./providers/tasks");
exports.tasks = tasks;
const testLab = require("./providers/testLab");
exports.testLab = testLab;
const apps = require("./apps");
const handler_builder_1 = require("./handler-builder");
Object.defineProperty(exports, "handler", { enumerable: true, get: function () { return handler_builder_1.handler; } });
const logger = require("./logger");
exports.logger = logger;
const setup_1 = require("./setup");
const app = apps.apps();
exports.app = app;
// Exported root types:
__exportStar(require("./cloud-functions"), exports);
__exportStar(require("./config"), exports);
__exportStar(require("./function-builder"), exports);
__exportStar(require("./function-configuration"), exports);
setup_1.setup();
