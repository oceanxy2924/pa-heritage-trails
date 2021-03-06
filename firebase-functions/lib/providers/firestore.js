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
exports.DocumentBuilder = exports.beforeSnapshotConstructor = exports.snapshotConstructor = exports.NamespaceBuilder = exports.DatabaseBuilder = exports._documentWithOptions = exports._namespaceWithOptions = exports._databaseWithOptions = exports.database = exports.namespace = exports.document = exports.defaultDatabase = exports.service = exports.provider = void 0;
const firebase = require("firebase-admin");
const _ = require("lodash");
const path_1 = require("path");
const apps_1 = require("../apps");
const cloud_functions_1 = require("../cloud-functions");
const encoder_1 = require("../encoder");
const logger = require("../logger");
/** @hidden */
exports.provider = 'google.firestore';
/** @hidden */
exports.service = 'firestore.googleapis.com';
/** @hidden */
exports.defaultDatabase = '(default)';
let firestoreInstance;
/**
 * Select the Firestore document to listen to for events.
 * @param path Full database path to listen to. This includes the name of
 * the collection that the document is a part of. For example, if the
 * collection is named "users" and the document is named "Ada", then the
 * path is "/users/Ada".
 */
function document(path) {
    return _documentWithOptions(path, {});
}
exports.document = document;
/** @hidden */
// Multiple namespaces are not yet supported by Firestore.
function namespace(namespace) {
    return _namespaceWithOptions(namespace, {});
}
exports.namespace = namespace;
/** @hidden */
// Multiple databases are not yet supported by Firestore.
function database(database) {
    return _databaseWithOptions(database, {});
}
exports.database = database;
/** @hidden */
function _databaseWithOptions(database = exports.defaultDatabase, options) {
    return new DatabaseBuilder(database, options);
}
exports._databaseWithOptions = _databaseWithOptions;
/** @hidden */
function _namespaceWithOptions(namespace, options) {
    return _databaseWithOptions(exports.defaultDatabase, options).namespace(namespace);
}
exports._namespaceWithOptions = _namespaceWithOptions;
/** @hidden */
function _documentWithOptions(path, options) {
    return _databaseWithOptions(exports.defaultDatabase, options).document(path);
}
exports._documentWithOptions = _documentWithOptions;
class DatabaseBuilder {
    /** @hidden */
    constructor(database, options) {
        this.database = database;
        this.options = options;
    }
    namespace(namespace) {
        return new NamespaceBuilder(this.database, this.options, namespace);
    }
    document(path) {
        return new NamespaceBuilder(this.database, this.options).document(path);
    }
}
exports.DatabaseBuilder = DatabaseBuilder;
class NamespaceBuilder {
    /** @hidden */
    constructor(database, options, namespace) {
        this.database = database;
        this.options = options;
        this.namespace = namespace;
    }
    document(path) {
        return new DocumentBuilder(() => {
            if (!process.env.GCLOUD_PROJECT) {
                throw new Error('process.env.GCLOUD_PROJECT is not set.');
            }
            const database = path_1.posix.join('projects', process.env.GCLOUD_PROJECT, 'databases', this.database);
            return path_1.posix.join(database, this.namespace ? `documents@${this.namespace}` : 'documents', path);
        }, this.options);
    }
}
exports.NamespaceBuilder = NamespaceBuilder;
function _getValueProto(data, resource, valueFieldName) {
    if (_.isEmpty(_.get(data, valueFieldName))) {
        // Firestore#snapshot_ takes resource string instead of proto for a non-existent snapshot
        return resource;
    }
    const proto = {
        fields: _.get(data, [valueFieldName, 'fields'], {}),
        createTime: encoder_1.dateToTimestampProto(_.get(data, [valueFieldName, 'createTime'])),
        updateTime: encoder_1.dateToTimestampProto(_.get(data, [valueFieldName, 'updateTime'])),
        name: _.get(data, [valueFieldName, 'name'], resource),
    };
    return proto;
}
/** @hidden */
function snapshotConstructor(event) {
    var _a;
    if (!firestoreInstance) {
        firestoreInstance = firebase.firestore(apps_1.apps().admin);
    }
    const valueProto = _getValueProto(event.data, event.context.resource.name, 'value');
    let timeString = (_a = _.get(event, 'data.value.readTime')) !== null && _a !== void 0 ? _a : _.get(event, 'data.value.updateTime');
    if (!timeString) {
        logger.warn('Snapshot has no readTime. Using now()');
        timeString = new Date().toISOString();
    }
    const readTime = encoder_1.dateToTimestampProto(timeString);
    return firestoreInstance.snapshot_(valueProto, readTime, 'json');
}
exports.snapshotConstructor = snapshotConstructor;
/** @hidden */
// TODO remove this function when wire format changes to new format
function beforeSnapshotConstructor(event) {
    if (!firestoreInstance) {
        firestoreInstance = firebase.firestore(apps_1.apps().admin);
    }
    const oldValueProto = _getValueProto(event.data, event.context.resource.name, 'oldValue');
    const oldReadTime = encoder_1.dateToTimestampProto(_.get(event, 'data.oldValue.readTime'));
    return firestoreInstance.snapshot_(oldValueProto, oldReadTime, 'json');
}
exports.beforeSnapshotConstructor = beforeSnapshotConstructor;
function changeConstructor(raw) {
    return cloud_functions_1.Change.fromObjects(beforeSnapshotConstructor(raw), snapshotConstructor(raw));
}
class DocumentBuilder {
    /** @hidden */
    constructor(triggerResource, options) {
        this.triggerResource = triggerResource;
        this.options = options;
        // TODO what validation do we want to do here?
    }
    /** Respond to all document writes (creates, updates, or deletes). */
    onWrite(handler) {
        return this.onOperation(handler, 'document.write', changeConstructor);
    }
    /** Respond only to document updates. */
    onUpdate(handler) {
        return this.onOperation(handler, 'document.update', changeConstructor);
    }
    /** Respond only to document creations. */
    onCreate(handler) {
        return this.onOperation(handler, 'document.create', snapshotConstructor);
    }
    /** Respond only to document deletions. */
    onDelete(handler) {
        return this.onOperation(handler, 'document.delete', beforeSnapshotConstructor);
    }
    onOperation(handler, eventType, dataConstructor) {
        return cloud_functions_1.makeCloudFunction({
            handler,
            provider: exports.provider,
            eventType,
            service: exports.service,
            triggerResource: this.triggerResource,
            legacyEventType: `providers/cloud.firestore/eventTypes/${eventType}`,
            dataConstructor,
            options: this.options,
        });
    }
}
exports.DocumentBuilder = DocumentBuilder;
