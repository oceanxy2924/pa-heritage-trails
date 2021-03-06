/*! firebase-admin v10.1.0 */
"use strict";
/*!
 * @license
 * Copyright 2017 Google Inc.
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
exports.defaultNamespace = exports.FirebaseNamespace = exports.FirebaseNamespaceInternals = void 0;
var lifecycle_1 = require("./lifecycle");
var credential_factory_1 = require("./credential-factory");
var index_1 = require("../utils/index");
/**
 * Internals of a FirebaseNamespace instance.
 */
var FirebaseNamespaceInternals = /** @class */ (function () {
    function FirebaseNamespaceInternals(appStore) {
        this.appStore = appStore;
    }
    /**
     * Initializes the App instance.
     *
     * @param options - Optional options for the App instance. If none present will try to initialize
     *   from the FIREBASE_CONFIG environment variable. If the environment variable contains a string
     *   that starts with '{' it will be parsed as JSON, otherwise it will be assumed to be pointing
     *   to a file.
     * @param appName - Optional name of the FirebaseApp instance.
     *
     * @returns A new App instance.
     */
    FirebaseNamespaceInternals.prototype.initializeApp = function (options, appName) {
        var app = this.appStore.initializeApp(options, appName);
        return extendApp(app);
    };
    /**
     * Returns the App instance with the provided name (or the default App instance
     * if no name is provided).
     *
     * @param appName - Optional name of the FirebaseApp instance to return.
     * @returns The App instance which has the provided name.
     */
    FirebaseNamespaceInternals.prototype.app = function (appName) {
        var app = this.appStore.getApp(appName);
        return extendApp(app);
    };
    Object.defineProperty(FirebaseNamespaceInternals.prototype, "apps", {
        /*
         * Returns an array of all the non-deleted App instances.
         */
        get: function () {
            return this.appStore.getApps().map(function (app) { return extendApp(app); });
        },
        enumerable: false,
        configurable: true
    });
    return FirebaseNamespaceInternals;
}());
exports.FirebaseNamespaceInternals = FirebaseNamespaceInternals;
var firebaseCredential = {
    cert: credential_factory_1.cert, refreshToken: credential_factory_1.refreshToken, applicationDefault: credential_factory_1.applicationDefault
};
/**
 * Global Firebase context object.
 */
var FirebaseNamespace = /** @class */ (function () {
    /* tslint:enable */
    function FirebaseNamespace(appStore) {
        // Hack to prevent Babel from modifying the object returned as the default admin namespace.
        /* tslint:disable:variable-name */
        this.__esModule = true;
        /* tslint:enable:variable-name */
        this.credential = firebaseCredential;
        this.SDK_VERSION = index_1.getSdkVersion();
        /* tslint:disable */
        // TODO(jwenger): Database is the only consumer of firebase.Promise. We should update it to use
        // use the native Promise and then remove this.
        this.Promise = Promise;
        this.INTERNAL = new FirebaseNamespaceInternals(appStore !== null && appStore !== void 0 ? appStore : new lifecycle_1.AppStore());
    }
    Object.defineProperty(FirebaseNamespace.prototype, "auth", {
        /**
         * Gets the `Auth` service namespace. The returned namespace can be used to get the
         * `Auth` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).auth();
            };
            var auth = require('../auth/auth').Auth;
            return Object.assign(fn, { Auth: auth });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "database", {
        /**
         * Gets the `Database` service namespace. The returned namespace can be used to get the
         * `Database` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).database();
            };
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return Object.assign(fn, require('@firebase/database-compat/standalone'));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "messaging", {
        /**
         * Gets the `Messaging` service namespace. The returned namespace can be used to get the
         * `Messaging` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).messaging();
            };
            var messaging = require('../messaging/messaging').Messaging;
            return Object.assign(fn, { Messaging: messaging });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "storage", {
        /**
         * Gets the `Storage` service namespace. The returned namespace can be used to get the
         * `Storage` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).storage();
            };
            var storage = require('../storage/storage').Storage;
            return Object.assign(fn, { Storage: storage });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "firestore", {
        /**
         * Gets the `Firestore` service namespace. The returned namespace can be used to get the
         * `Firestore` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).firestore();
            };
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var firestore = require('@google-cloud/firestore');
            fn = Object.assign(fn, firestore.Firestore);
            // `v1beta1` and `v1` are lazy-loaded in the Firestore SDK. We use the same trick here
            // to avoid triggering this lazy-loading upon initialization.
            Object.defineProperty(fn, 'v1beta1', {
                get: function () {
                    return firestore.v1beta1;
                },
            });
            Object.defineProperty(fn, 'v1', {
                get: function () {
                    return firestore.v1;
                },
            });
            return fn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "machineLearning", {
        /**
         * Gets the `MachineLearning` service namespace. The returned namespace can be
         * used to get the `MachineLearning` service for the default app or an
         * explicityly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).machineLearning();
            };
            var machineLearning = require('../machine-learning/machine-learning').MachineLearning;
            return Object.assign(fn, { MachineLearning: machineLearning });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "installations", {
        /**
         * Gets the `Installations` service namespace. The returned namespace can be used to get the
         * `Installations` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).installations();
            };
            var installations = require('../installations/installations').Installations;
            return Object.assign(fn, { Installations: installations });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "instanceId", {
        /**
         * Gets the `InstanceId` service namespace. The returned namespace can be used to get the
         * `Instance` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).instanceId();
            };
            var instanceId = require('../instance-id/instance-id').InstanceId;
            return Object.assign(fn, { InstanceId: instanceId });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "projectManagement", {
        /**
         * Gets the `ProjectManagement` service namespace. The returned namespace can be used to get the
         * `ProjectManagement` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).projectManagement();
            };
            var projectManagement = require('../project-management/project-management').ProjectManagement;
            return Object.assign(fn, { ProjectManagement: projectManagement });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "securityRules", {
        /**
         * Gets the `SecurityRules` service namespace. The returned namespace can be used to get the
         * `SecurityRules` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).securityRules();
            };
            var securityRules = require('../security-rules/security-rules').SecurityRules;
            return Object.assign(fn, { SecurityRules: securityRules });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "remoteConfig", {
        /**
         * Gets the `RemoteConfig` service namespace. The returned namespace can be used to get the
         * `RemoteConfig` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).remoteConfig();
            };
            var remoteConfig = require('../remote-config/remote-config').RemoteConfig;
            return Object.assign(fn, { RemoteConfig: remoteConfig });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseNamespace.prototype, "appCheck", {
        /**
         * Gets the `AppCheck` service namespace. The returned namespace can be used to get the
         * `AppCheck` service for the default app or an explicitly specified app.
         */
        get: function () {
            var _this = this;
            var fn = function (app) {
                return _this.ensureApp(app).appCheck();
            };
            var appCheck = require('../app-check/app-check').AppCheck;
            return Object.assign(fn, { AppCheck: appCheck });
        },
        enumerable: false,
        configurable: true
    });
    // TODO: Change the return types to app.App in the following methods.
    /**
     * Initializes the FirebaseApp instance.
     *
     * @param options - Optional options for the FirebaseApp instance.
     *   If none present will try to initialize from the FIREBASE_CONFIG environment variable.
     *   If the environment variable contains a string that starts with '{' it will be parsed as JSON,
     *   otherwise it will be assumed to be pointing to a file.
     * @param appName - Optional name of the FirebaseApp instance.
     *
     * @returns A new FirebaseApp instance.
     */
    FirebaseNamespace.prototype.initializeApp = function (options, appName) {
        return this.INTERNAL.initializeApp(options, appName);
    };
    /**
     * Returns the FirebaseApp instance with the provided name (or the default FirebaseApp instance
     * if no name is provided).
     *
     * @param appName - Optional name of the FirebaseApp instance to return.
     * @returns The FirebaseApp instance which has the provided name.
     */
    FirebaseNamespace.prototype.app = function (appName) {
        return this.INTERNAL.app(appName);
    };
    Object.defineProperty(FirebaseNamespace.prototype, "apps", {
        /*
         * Returns an array of all the non-deleted FirebaseApp instances.
         */
        get: function () {
            return this.INTERNAL.apps;
        },
        enumerable: false,
        configurable: true
    });
    FirebaseNamespace.prototype.ensureApp = function (app) {
        if (typeof app === 'undefined') {
            app = this.app();
        }
        return app;
    };
    return FirebaseNamespace;
}());
exports.FirebaseNamespace = FirebaseNamespace;
/**
 * In order to maintain backward compatibility, we instantiate a default namespace instance in
 * this module, and delegate all app lifecycle operations to it. In a future implementation where
 * the old admin namespace is no longer supported, we should remove this.
 *
 * @internal
 */
exports.defaultNamespace = new FirebaseNamespace(lifecycle_1.defaultAppStore);
function extendApp(app) {
    var result = app;
    if (result.__extended) {
        return result;
    }
    result.auth = function () {
        var fn = require('../auth/index').getAuth;
        return fn(app);
    };
    result.appCheck = function () {
        var fn = require('../app-check/index').getAppCheck;
        return fn(app);
    };
    result.database = function (url) {
        var fn = require('../database/index').getDatabaseWithUrl;
        return fn(url, app);
    };
    result.messaging = function () {
        var fn = require('../messaging/index').getMessaging;
        return fn(app);
    };
    result.storage = function () {
        var fn = require('../storage/index').getStorage;
        return fn(app);
    };
    result.firestore = function () {
        var fn = require('../firestore/index').getFirestore;
        return fn(app);
    };
    result.instanceId = function () {
        var fn = require('../instance-id/index').getInstanceId;
        return fn(app);
    };
    result.installations = function () {
        var fn = require('../installations/index').getInstallations;
        return fn(app);
    };
    result.machineLearning = function () {
        var fn = require('../machine-learning/index').getMachineLearning;
        return fn(app);
    };
    result.projectManagement = function () {
        var fn = require('../project-management/index').getProjectManagement;
        return fn(app);
    };
    result.securityRules = function () {
        var fn = require('../security-rules/index').getSecurityRules;
        return fn(app);
    };
    result.remoteConfig = function () {
        var fn = require('../remote-config/index').getRemoteConfig;
        return fn(app);
    };
    result.__extended = true;
    return result;
}
