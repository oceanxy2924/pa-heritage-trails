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
exports.FirebaseApp = exports.FirebaseAppInternals = void 0;
var credential_internal_1 = require("./credential-internal");
var validator = require("../utils/validator");
var deep_copy_1 = require("../utils/deep-copy");
var error_1 = require("../utils/error");
var TOKEN_EXPIRY_THRESHOLD_MILLIS = 5 * 60 * 1000;
/**
 * Internals of a FirebaseApp instance.
 */
var FirebaseAppInternals = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    function FirebaseAppInternals(credential_) {
        this.credential_ = credential_;
        this.tokenListeners_ = [];
    }
    FirebaseAppInternals.prototype.getToken = function (forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (forceRefresh || this.shouldRefresh()) {
            return this.refreshToken();
        }
        return Promise.resolve(this.cachedToken_);
    };
    FirebaseAppInternals.prototype.getCachedToken = function () {
        return this.cachedToken_ || null;
    };
    FirebaseAppInternals.prototype.refreshToken = function () {
        var _this = this;
        return Promise.resolve(this.credential_.getAccessToken())
            .then(function (result) {
            // Since the developer can provide the credential implementation, we want to weakly verify
            // the return type until the type is properly exported.
            if (!validator.isNonNullObject(result) ||
                typeof result.expires_in !== 'number' ||
                typeof result.access_token !== 'string') {
                throw new error_1.FirebaseAppError(error_1.AppErrorCodes.INVALID_CREDENTIAL, "Invalid access token generated: \"" + JSON.stringify(result) + "\". Valid access " +
                    'tokens must be an object with the "expires_in" (number) and "access_token" ' +
                    '(string) properties.');
            }
            var token = {
                accessToken: result.access_token,
                expirationTime: Date.now() + (result.expires_in * 1000),
            };
            if (!_this.cachedToken_
                || _this.cachedToken_.accessToken !== token.accessToken
                || _this.cachedToken_.expirationTime !== token.expirationTime) {
                // Update the cache before firing listeners. Listeners may directly query the
                // cached token state.
                _this.cachedToken_ = token;
                _this.tokenListeners_.forEach(function (listener) {
                    listener(token.accessToken);
                });
            }
            return token;
        })
            .catch(function (error) {
            var errorMessage = (typeof error === 'string') ? error : error.message;
            errorMessage = 'Credential implementation provided to initializeApp() via the ' +
                '"credential" property failed to fetch a valid Google OAuth2 access token with the ' +
                ("following error: \"" + errorMessage + "\".");
            if (errorMessage.indexOf('invalid_grant') !== -1) {
                errorMessage += ' There are two likely causes: (1) your server time is not properly ' +
                    'synced or (2) your certificate key file has been revoked. To solve (1), re-sync the ' +
                    'time on your server. To solve (2), make sure the key ID for your key file is still ' +
                    'present at https://console.firebase.google.com/iam-admin/serviceaccounts/project. If ' +
                    'not, generate a new key file at ' +
                    'https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk.';
            }
            throw new error_1.FirebaseAppError(error_1.AppErrorCodes.INVALID_CREDENTIAL, errorMessage);
        });
    };
    FirebaseAppInternals.prototype.shouldRefresh = function () {
        return !this.cachedToken_ || (this.cachedToken_.expirationTime - Date.now()) <= TOKEN_EXPIRY_THRESHOLD_MILLIS;
    };
    /**
     * Adds a listener that is called each time a token changes.
     *
     * @param listener - The listener that will be called with each new token.
     */
    FirebaseAppInternals.prototype.addAuthTokenListener = function (listener) {
        this.tokenListeners_.push(listener);
        if (this.cachedToken_) {
            listener(this.cachedToken_.accessToken);
        }
    };
    /**
     * Removes a token listener.
     *
     * @param listener - The listener to remove.
     */
    FirebaseAppInternals.prototype.removeAuthTokenListener = function (listener) {
        this.tokenListeners_ = this.tokenListeners_.filter(function (other) { return other !== listener; });
    };
    return FirebaseAppInternals;
}());
exports.FirebaseAppInternals = FirebaseAppInternals;
/**
 * Global context object for a collection of services using a shared authentication state.
 *
 * @internal
 */
var FirebaseApp = /** @class */ (function () {
    function FirebaseApp(options, name, appStore) {
        this.appStore = appStore;
        this.services_ = {};
        this.isDeleted_ = false;
        this.name_ = name;
        this.options_ = deep_copy_1.deepCopy(options);
        if (!validator.isNonNullObject(this.options_)) {
            throw new error_1.FirebaseAppError(error_1.AppErrorCodes.INVALID_APP_OPTIONS, 'Invalid Firebase app options passed as the first argument to initializeApp() for the ' +
                ("app named \"" + this.name_ + "\". Options must be a non-null object."));
        }
        var hasCredential = ('credential' in this.options_);
        if (!hasCredential) {
            this.options_.credential = credential_internal_1.getApplicationDefault(this.options_.httpAgent);
        }
        var credential = this.options_.credential;
        if (typeof credential !== 'object' || credential === null || typeof credential.getAccessToken !== 'function') {
            throw new error_1.FirebaseAppError(error_1.AppErrorCodes.INVALID_APP_OPTIONS, 'Invalid Firebase app options passed as the first argument to initializeApp() for the ' +
                ("app named \"" + this.name_ + "\". The \"credential\" property must be an object which implements ") +
                'the Credential interface.');
        }
        this.INTERNAL = new FirebaseAppInternals(credential);
    }
    Object.defineProperty(FirebaseApp.prototype, "name", {
        /**
         * Returns the name of the FirebaseApp instance.
         *
         * @returns The name of the FirebaseApp instance.
         */
        get: function () {
            this.checkDestroyed_();
            return this.name_;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FirebaseApp.prototype, "options", {
        /**
         * Returns the options for the FirebaseApp instance.
         *
         * @returns The options for the FirebaseApp instance.
         */
        get: function () {
            this.checkDestroyed_();
            return deep_copy_1.deepCopy(this.options_);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @internal
     */
    FirebaseApp.prototype.getOrInitService = function (name, init) {
        var _this = this;
        return this.ensureService_(name, function () { return init(_this); });
    };
    /**
     * Deletes the FirebaseApp instance.
     *
     * @returns An empty Promise fulfilled once the FirebaseApp instance is deleted.
     */
    FirebaseApp.prototype.delete = function () {
        var _this = this;
        var _a;
        this.checkDestroyed_();
        // Also remove the instance from the AppStore. This is needed to support the existing
        // app.delete() use case. In the future we can remove this API, and deleteApp() will
        // become the only way to tear down an App.
        (_a = this.appStore) === null || _a === void 0 ? void 0 : _a.removeApp(this.name);
        return Promise.all(Object.keys(this.services_).map(function (serviceName) {
            var service = _this.services_[serviceName];
            if (isStateful(service)) {
                return service.delete();
            }
            return Promise.resolve();
        })).then(function () {
            _this.services_ = {};
            _this.isDeleted_ = true;
        });
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FirebaseApp.prototype.ensureService_ = function (serviceName, initializer) {
        this.checkDestroyed_();
        if (!(serviceName in this.services_)) {
            this.services_[serviceName] = initializer();
        }
        return this.services_[serviceName];
    };
    /**
     * Throws an Error if the FirebaseApp instance has already been deleted.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FirebaseApp.prototype.checkDestroyed_ = function () {
        if (this.isDeleted_) {
            throw new error_1.FirebaseAppError(error_1.AppErrorCodes.APP_DELETED, "Firebase app named \"" + this.name_ + "\" has already been deleted.");
        }
    };
    return FirebaseApp;
}());
exports.FirebaseApp = FirebaseApp;
function isStateful(service) {
    return typeof service.delete === 'function';
}
