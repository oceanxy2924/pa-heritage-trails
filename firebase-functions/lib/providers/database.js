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
exports.DataSnapshot = exports.extractInstanceAndPath = exports.RefBuilder = exports._refWithOptions = exports.InstanceBuilder = exports._instanceWithOptions = exports.ref = exports.instance = exports.service = exports.provider = void 0;
const _ = require("lodash");
const apps_1 = require("../apps");
const cloud_functions_1 = require("../cloud-functions");
const config_1 = require("../config");
const path_1 = require("../utilities/path");
const utils_1 = require("../utils");
/** @hidden */
exports.provider = 'google.firebase.database';
/** @hidden */
exports.service = 'firebaseio.com';
const databaseURLRegex = new RegExp('^https://([^.]+).');
const emulatorDatabaseURLRegex = new RegExp('^http://.*ns=([^&]+)');
/**
 * Registers a function that triggers on events from a specific
 * Firebase Realtime Database instance.
 *
 * Use this method together with `ref` to specify the instance on which to
 * watch for database events. For example: `firebase.database.instance('my-app-db-2').ref('/foo/bar')`
 *
 * Note that `functions.database.ref` used without `instance` watches the
 * *default* instance for events.
 *
 * @param instance The instance name of the database instance
 *   to watch for write events.
 * @return Firebase Realtime Database instance builder interface.
 */
function instance(instance) {
    return _instanceWithOptions(instance, {});
}
exports.instance = instance;
/**
 * Registers a function that triggers on Firebase Realtime Database write
 * events.
 *
 * This method behaves very similarly to the method of the same name in the
 * client and Admin Firebase SDKs. Any change to the Database that affects the
 * data at or below the provided `path` will fire an event in Cloud Functions.
 *
 * There are three important differences between listening to a Realtime
 * Database event in Cloud Functions and using the Realtime Database in the
 * client and Admin SDKs:
 * 1. Cloud Functions allows wildcards in the `path` name. Any `path` component
 *    in curly brackets (`{}`) is a wildcard that matches all strings. The value
 *    that matched a certain invocation of a Cloud Function is returned as part
 *    of the [`EventContext.params`](cloud_functions_eventcontext.html#params object. For
 *    example, `ref("messages/{messageId}")` matches changes at
 *    `/messages/message1` or `/messages/message2`, resulting in
 *    `event.params.messageId` being set to `"message1"` or `"message2"`,
 *    respectively.
 * 2. Cloud Functions do not fire an event for data that already existed before
 *    the Cloud Function was deployed.
 * 3. Cloud Function events have access to more information, including a
 *    snapshot of the previous event data and information about the user who
 *    triggered the Cloud Function.
 *
 * @param path The path within the Database to watch for write events.
 * @return Firebase Realtime Database builder interface.
 */
function ref(path) {
    return _refWithOptions(path, {});
}
exports.ref = ref;
/** @hidden */
function _instanceWithOptions(instance, options) {
    return new InstanceBuilder(instance, options);
}
exports._instanceWithOptions = _instanceWithOptions;
/**
 * The Firebase Realtime Database instance builder interface.
 *
 * Access via [`database.instance()`](providers_database_.html#instance).
 */
class InstanceBuilder {
    /** @hidden */
    constructor(instance, options) {
        this.instance = instance;
        this.options = options;
    }
    /**
     * @return Firebase Realtime Database reference builder interface.
     */
    ref(path) {
        const normalized = path_1.normalizePath(path);
        return new RefBuilder(apps_1.apps(), () => `projects/_/instances/${this.instance}/refs/${normalized}`, this.options);
    }
}
exports.InstanceBuilder = InstanceBuilder;
/** @hidden */
function _refWithOptions(path, options) {
    const resourceGetter = () => {
        const normalized = path_1.normalizePath(path);
        const databaseURL = config_1.firebaseConfig().databaseURL;
        if (!databaseURL) {
            throw new Error('Missing expected firebase config value databaseURL, ' +
                'config is actually' +
                JSON.stringify(config_1.firebaseConfig()) +
                '\n If you are unit testing, please set process.env.FIREBASE_CONFIG');
        }
        let instance;
        const prodMatch = databaseURL.match(databaseURLRegex);
        if (prodMatch) {
            instance = prodMatch[1];
        }
        else {
            const emulatorMatch = databaseURL.match(emulatorDatabaseURLRegex);
            if (emulatorMatch) {
                instance = emulatorMatch[1];
            }
        }
        if (!instance) {
            throw new Error('Invalid value for config firebase.databaseURL: ' + databaseURL);
        }
        return `projects/_/instances/${instance}/refs/${normalized}`;
    };
    return new RefBuilder(apps_1.apps(), resourceGetter, options);
}
exports._refWithOptions = _refWithOptions;
/**
 * The Firebase Realtime Database reference builder interface.
 *
 * Access via [`functions.database.ref()`](functions.database#.ref).
 */
class RefBuilder {
    /** @hidden */
    constructor(apps, triggerResource, options) {
        this.apps = apps;
        this.triggerResource = triggerResource;
        this.options = options;
        this.changeConstructor = (raw) => {
            const [dbInstance, path] = extractInstanceAndPath(raw.context.resource.name, raw.context.domain);
            const before = new DataSnapshot(raw.data.data, path, this.apps.admin, dbInstance);
            const after = new DataSnapshot(utils_1.applyChange(raw.data.data, raw.data.delta), path, this.apps.admin, dbInstance);
            return {
                before,
                after,
            };
        };
    }
    /**
     * Event handler that fires every time a Firebase Realtime Database write
     * of any kind (creation, update, or delete) occurs.
     *
     * @param handler Event handler that runs every time a Firebase Realtime Database
     *   write occurs.
     * @return A Cloud Function that you can export and deploy.
     */
    onWrite(handler) {
        return this.onOperation(handler, 'ref.write', this.changeConstructor);
    }
    /**
     * Event handler that fires every time data is updated in
     * Firebase Realtime Database.
     *
     * @param handler Event handler which is run every time a Firebase Realtime Database
     *   write occurs.
     * @return A Cloud
     *   Function which you can export and deploy.
     */
    onUpdate(handler) {
        return this.onOperation(handler, 'ref.update', this.changeConstructor);
    }
    /**
     * Event handler that fires every time new data is created in
     * Firebase Realtime Database.
     *
     * @param handler Event handler that runs every time new data is created in
     *   Firebase Realtime Database.
     * @return A Cloud Function that you can export and deploy.
     */
    onCreate(handler) {
        const dataConstructor = (raw) => {
            const [dbInstance, path] = extractInstanceAndPath(raw.context.resource.name, raw.context.domain);
            return new DataSnapshot(raw.data.delta, path, this.apps.admin, dbInstance);
        };
        return this.onOperation(handler, 'ref.create', dataConstructor);
    }
    /**
     * Event handler that fires every time data is deleted from
     * Firebase Realtime Database.
     *
     * @param handler Event handler that runs every time data is deleted from
     *   Firebase Realtime Database.
     * @return A Cloud Function that you can export and deploy.
     */
    onDelete(handler) {
        const dataConstructor = (raw) => {
            const [dbInstance, path] = extractInstanceAndPath(raw.context.resource.name, raw.context.domain);
            return new DataSnapshot(raw.data.data, path, this.apps.admin, dbInstance);
        };
        return this.onOperation(handler, 'ref.delete', dataConstructor);
    }
    onOperation(handler, eventType, dataConstructor) {
        return cloud_functions_1.makeCloudFunction({
            handler,
            provider: exports.provider,
            service: exports.service,
            eventType,
            legacyEventType: `providers/${exports.provider}/eventTypes/${eventType}`,
            triggerResource: this.triggerResource,
            dataConstructor,
            before: (event) => this.apps.retain(),
            after: (event) => this.apps.release(),
            options: this.options,
        });
    }
}
exports.RefBuilder = RefBuilder;
const resourceRegex = /^projects\/([^/]+)\/instances\/([a-zA-Z0-9-]+)\/refs(\/.+)?/;
/**
 * Utility function to extract database reference from resource string
 *
 * @param optional database domain override for the original of the source database.
 *    It defaults to `firebaseio.com`.
 *    Multi-region RTDB will be served from different domains.
 *    Since region is not part of the resource name, it is provided through context.
 */
/** @hidden */
function extractInstanceAndPath(resource, domain = 'firebaseio.com') {
    const match = resource.match(new RegExp(resourceRegex));
    if (!match) {
        throw new Error(`Unexpected resource string for Firebase Realtime Database event: ${resource}. ` +
            'Expected string in the format of "projects/_/instances/{firebaseioSubdomain}/refs/{ref=**}"');
    }
    const [, project, dbInstanceName, path] = match;
    if (project !== '_') {
        throw new Error(`Expect project to be '_' in a Firebase Realtime Database event`);
    }
    const emuHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
    if (emuHost) {
        const dbInstance = `http://${emuHost}/?ns=${dbInstanceName}`;
        return [dbInstance, path];
    }
    else {
        const dbInstance = 'https://' + dbInstanceName + '.' + domain;
        return [dbInstance, path];
    }
}
exports.extractInstanceAndPath = extractInstanceAndPath;
/**
 * Interface representing a Firebase Realtime Database data snapshot.
 */
class DataSnapshot {
    constructor(data, path, // path will be undefined for the database root
    app, instance) {
        var _a, _b;
        this.app = app;
        if ((_b = (_a = app === null || app === void 0 ? void 0 : app.options) === null || _a === void 0 ? void 0 : _a.databaseURL) === null || _b === void 0 ? void 0 : _b.startsWith('http:')) {
            // In this case we're dealing with an emulator
            this.instance = app.options.databaseURL;
        }
        else if (instance) {
            // SDK always supplies instance, but user's unit tests may not
            this.instance = instance;
        }
        else if (app) {
            this.instance = app.options.databaseURL;
        }
        else if (process.env.GCLOUD_PROJECT) {
            this.instance =
                'https://' + process.env.GCLOUD_PROJECT + '.firebaseio.com';
        }
        this._path = path;
        this._data = data;
    }
    /**
     * Returns a [`Reference`](/docs/reference/admin/node/admin.database.Reference)
     * to the Database location where the triggering write occurred. Has
     * full read and write access.
     */
    get ref() {
        if (!this.app) {
            // may be unpopulated in user's unit tests
            throw new Error('Please supply a Firebase app in the constructor for DataSnapshot' +
                ' in order to use the .ref method.');
        }
        if (!this._ref) {
            this._ref = this.app.database(this.instance).ref(this._fullPath());
        }
        return this._ref;
    }
    /**
     * The key (last part of the path) of the location of this `DataSnapshot`.
     *
     * The last token in a Database location is considered its key. For example,
     * "ada" is the key for the `/users/ada/` node. Accessing the key on any
     * `DataSnapshot` will return the key for the location that generated it.
     * However, accessing the key on the root URL of a Database will return `null`.
     */
    get key() {
        const last = _.last(path_1.pathParts(this._fullPath()));
        return !last || last === '' ? null : last;
    }
    /**
     * Extracts a JavaScript value from a `DataSnapshot`.
     *
     * Depending on the data in a `DataSnapshot`, the `val()` method may return a
     * scalar type (string, number, or boolean), an array, or an object. It may also
     * return `null`, indicating that the `DataSnapshot` is empty (contains no
     * data).
     *
     * @return The DataSnapshot's contents as a JavaScript value (Object,
     *   Array, string, number, boolean, or `null`).
     */
    val() {
        const parts = path_1.pathParts(this._childPath);
        const source = this._data;
        const node = _.cloneDeep(parts.length ? _.get(source, parts, null) : source);
        return this._checkAndConvertToArray(node);
    }
    /**
     * Exports the entire contents of the `DataSnapshot` as a JavaScript object.
     *
     * The `exportVal()` method is similar to `val()`, except priority information
     * is included (if available), making it suitable for backing up your data.
     *
     * @return The contents of the `DataSnapshot` as a JavaScript value
     *   (Object, Array, string, number, boolean, or `null`).
     */
    exportVal() {
        return this.val();
    }
    /**
     * Gets the priority value of the data in this `DataSnapshot`.
     *
     * As an alternative to using priority, applications can order collections by
     * ordinary properties. See [Sorting and filtering
     * data](/docs/database/web/lists-of-data#sorting_and_filtering_data).
     *
     * @return The priority value of the data.
     */
    getPriority() {
        return 0;
    }
    /**
     * Returns `true` if this `DataSnapshot` contains any data. It is slightly more
     * efficient than using `snapshot.val() !== null`.
     *
     * @return `true` if this `DataSnapshot` contains any data; otherwise, `false`.
     */
    exists() {
        return !_.isNull(this.val());
    }
    /**
     * Gets a `DataSnapshot` for the location at the specified relative path.
     *
     * The relative path can either be a simple child name (for example, "ada") or
     * a deeper slash-separated path (for example, "ada/name/first").
     *
     * @param path A relative path from this location to the desired child
     *   location.
     * @return The specified child location.
     */
    child(childPath) {
        if (!childPath) {
            return this;
        }
        return this._dup(childPath);
    }
    /**
     * Enumerates the `DataSnapshot`s of the children items.
     *
     * Because of the way JavaScript objects work, the ordering of data in the
     * JavaScript object returned by `val()` is not guaranteed to match the ordering
     * on the server nor the ordering of `child_added` events. That is where
     * `forEach()` comes in handy. It guarantees the children of a `DataSnapshot`
     * will be iterated in their query order.
     *
     * If no explicit `orderBy*()` method is used, results are returned
     * ordered by key (unless priorities are used, in which case, results are
     * returned by priority).
     *
     * @param action A function that will be called for each child `DataSnapshot`.
     *   The callback can return `true` to cancel further enumeration.
     *
     * @return `true` if enumeration was canceled due to your callback
     *   returning `true`.
     */
    forEach(action) {
        const val = this.val();
        if (_.isPlainObject(val)) {
            return _.some(val, (value, key) => action(this.child(key)) === true);
        }
        return false;
    }
    /**
     * Returns `true` if the specified child path has (non-`null`) data.
     *
     * @param path A relative path to the location of a potential child.
     * @return `true` if data exists at the specified child path; otherwise,
     *   `false`.
     */
    hasChild(childPath) {
        return this.child(childPath).exists();
    }
    /**
     * Returns whether or not the `DataSnapshot` has any non-`null` child
     * properties.
     *
     * You can use `hasChildren()` to determine if a `DataSnapshot` has any
     * children. If it does, you can enumerate them using `forEach()`. If it
     * doesn't, then either this snapshot contains a primitive value (which can be
     * retrieved with `val()`) or it is empty (in which case, `val()` will return
     * `null`).
     *
     * @return `true` if this snapshot has any children; else `false`.
     */
    hasChildren() {
        const val = this.val();
        return _.isPlainObject(val) && _.keys(val).length > 0;
    }
    /**
     * Returns the number of child properties of this `DataSnapshot`.
     *
     * @return Number of child properties of this `DataSnapshot`.
     */
    numChildren() {
        const val = this.val();
        return _.isPlainObject(val) ? Object.keys(val).length : 0;
    }
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @return A JSON-serializable representation of this object.
     */
    toJSON() {
        return this.val();
    }
    /** Recursive function to check if keys are numeric & convert node object to array if they are
     *
     * @hidden
     */
    _checkAndConvertToArray(node) {
        if (node === null || typeof node === 'undefined') {
            return null;
        }
        if (typeof node !== 'object') {
            return node;
        }
        const obj = {};
        let numKeys = 0;
        let maxKey = 0;
        let allIntegerKeys = true;
        for (const key in node) {
            if (!node.hasOwnProperty(key)) {
                continue;
            }
            const childNode = node[key];
            obj[key] = this._checkAndConvertToArray(childNode);
            numKeys++;
            const integerRegExp = /^(0|[1-9]\d*)$/;
            if (allIntegerKeys && integerRegExp.test(key)) {
                maxKey = Math.max(maxKey, Number(key));
            }
            else {
                allIntegerKeys = false;
            }
        }
        if (allIntegerKeys && maxKey < 2 * numKeys) {
            // convert to array.
            const array = [];
            _.forOwn(obj, (val, key) => {
                array[key] = val;
            });
            return array;
        }
        return obj;
    }
    /** @hidden */
    _dup(childPath) {
        const dup = new DataSnapshot(this._data, undefined, this.app, this.instance);
        [dup._path, dup._childPath] = [this._path, this._childPath];
        if (childPath) {
            dup._childPath = path_1.joinPath(dup._childPath, childPath);
        }
        return dup;
    }
    /** @hidden */
    _fullPath() {
        const out = (this._path || '') + '/' + (this._childPath || '');
        return out;
    }
}
exports.DataSnapshot = DataSnapshot;
