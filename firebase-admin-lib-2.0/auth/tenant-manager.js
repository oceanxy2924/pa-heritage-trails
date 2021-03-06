/*! firebase-admin v10.1.0 */
"use strict";
/*!
 * Copyright 2019 Google Inc.
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManager = exports.TenantAwareAuth = void 0;
var validator = require("../utils/validator");
var utils = require("../utils/index");
var error_1 = require("../utils/error");
var base_auth_1 = require("./base-auth");
var tenant_1 = require("./tenant");
var auth_api_request_1 = require("./auth-api-request");
/**
 * Tenant-aware `Auth` interface used for managing users, configuring SAML/OIDC providers,
 * generating email links for password reset, email verification, etc for specific tenants.
 *
 * Multi-tenancy support requires Google Cloud's Identity Platform
 * (GCIP). To learn more about GCIP, including pricing and features,
 * see the {@link https://cloud.google.com/identity-platform | GCIP documentation}.
 *
 * Each tenant contains its own identity providers, settings and sets of users.
 * Using `TenantAwareAuth`, users for a specific tenant and corresponding OIDC/SAML
 * configurations can also be managed, ID tokens for users signed in to a specific tenant
 * can be verified, and email action links can also be generated for users belonging to the
 * tenant.
 *
 * `TenantAwareAuth` instances for a specific `tenantId` can be instantiated by calling
 * {@link TenantManager.authForTenant}.
 */
var TenantAwareAuth = /** @class */ (function (_super) {
    __extends(TenantAwareAuth, _super);
    /**
     * The TenantAwareAuth class constructor.
     *
     * @param app - The app that created this tenant.
     * @param tenantId - The corresponding tenant ID.
     * @constructor
     * @internal
     */
    function TenantAwareAuth(app, tenantId) {
        var _this = _super.call(this, app, new auth_api_request_1.TenantAwareAuthRequestHandler(app, tenantId), base_auth_1.createFirebaseTokenGenerator(app, tenantId)) || this;
        utils.addReadonlyGetter(_this, 'tenantId', tenantId);
        return _this;
    }
    /**
     * {@inheritdoc BaseAuth.verifyIdToken}
     */
    TenantAwareAuth.prototype.verifyIdToken = function (idToken, checkRevoked) {
        var _this = this;
        if (checkRevoked === void 0) { checkRevoked = false; }
        return _super.prototype.verifyIdToken.call(this, idToken, checkRevoked)
            .then(function (decodedClaims) {
            // Validate tenant ID.
            if (decodedClaims.firebase.tenant !== _this.tenantId) {
                throw new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.MISMATCHING_TENANT_ID);
            }
            return decodedClaims;
        });
    };
    /**
     * {@inheritdoc BaseAuth.createSessionCookie}
     */
    TenantAwareAuth.prototype.createSessionCookie = function (idToken, sessionCookieOptions) {
        var _this = this;
        // Validate arguments before processing.
        if (!validator.isNonEmptyString(idToken)) {
            return Promise.reject(new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INVALID_ID_TOKEN));
        }
        if (!validator.isNonNullObject(sessionCookieOptions) ||
            !validator.isNumber(sessionCookieOptions.expiresIn)) {
            return Promise.reject(new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INVALID_SESSION_COOKIE_DURATION));
        }
        // This will verify the ID token and then match the tenant ID before creating the session cookie.
        return this.verifyIdToken(idToken)
            .then(function () {
            return _super.prototype.createSessionCookie.call(_this, idToken, sessionCookieOptions);
        });
    };
    /**
     * {@inheritdoc BaseAuth.verifySessionCookie}
     */
    TenantAwareAuth.prototype.verifySessionCookie = function (sessionCookie, checkRevoked) {
        var _this = this;
        if (checkRevoked === void 0) { checkRevoked = false; }
        return _super.prototype.verifySessionCookie.call(this, sessionCookie, checkRevoked)
            .then(function (decodedClaims) {
            if (decodedClaims.firebase.tenant !== _this.tenantId) {
                throw new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.MISMATCHING_TENANT_ID);
            }
            return decodedClaims;
        });
    };
    return TenantAwareAuth;
}(base_auth_1.BaseAuth));
exports.TenantAwareAuth = TenantAwareAuth;
/**
 * Defines the tenant manager used to help manage tenant related operations.
 * This includes:
 * <ul>
 * <li>The ability to create, update, list, get and delete tenants for the underlying
 *     project.</li>
 * <li>Getting a `TenantAwareAuth` instance for running Auth related operations
 *     (user management, provider configuration management, token verification,
 *     email link generation, etc) in the context of a specified tenant.</li>
 * </ul>
 */
var TenantManager = /** @class */ (function () {
    /**
     * Initializes a TenantManager instance for a specified FirebaseApp.
     *
     * @param app - The app for this TenantManager instance.
     *
     * @constructor
     * @internal
     */
    function TenantManager(app) {
        this.app = app;
        this.authRequestHandler = new auth_api_request_1.AuthRequestHandler(app);
        this.tenantsMap = {};
    }
    /**
     * Returns a `TenantAwareAuth` instance bound to the given tenant ID.
     *
     * @param tenantId - The tenant ID whose `TenantAwareAuth` instance is to be returned.
     *
     * @returns The `TenantAwareAuth` instance corresponding to this tenant identifier.
     */
    TenantManager.prototype.authForTenant = function (tenantId) {
        if (!validator.isNonEmptyString(tenantId)) {
            throw new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INVALID_TENANT_ID);
        }
        if (typeof this.tenantsMap[tenantId] === 'undefined') {
            this.tenantsMap[tenantId] = new TenantAwareAuth(this.app, tenantId);
        }
        return this.tenantsMap[tenantId];
    };
    /**
     * Gets the tenant configuration for the tenant corresponding to a given `tenantId`.
     *
     * @param tenantId - The tenant identifier corresponding to the tenant whose data to fetch.
     *
     * @returns A promise fulfilled with the tenant configuration to the provided `tenantId`.
     */
    TenantManager.prototype.getTenant = function (tenantId) {
        return this.authRequestHandler.getTenant(tenantId)
            .then(function (response) {
            return new tenant_1.Tenant(response);
        });
    };
    /**
     * Retrieves a list of tenants (single batch only) with a size of `maxResults`
     * starting from the offset as specified by `pageToken`. This is used to
     * retrieve all the tenants of a specified project in batches.
     *
     * @param maxResults - The page size, 1000 if undefined. This is also
     *   the maximum allowed limit.
     * @param pageToken - The next page token. If not specified, returns
     *   tenants starting without any offset.
     *
     * @returns A promise that resolves with
     *   a batch of downloaded tenants and the next page token.
     */
    TenantManager.prototype.listTenants = function (maxResults, pageToken) {
        return this.authRequestHandler.listTenants(maxResults, pageToken)
            .then(function (response) {
            // List of tenants to return.
            var tenants = [];
            // Convert each user response to a Tenant.
            response.tenants.forEach(function (tenantResponse) {
                tenants.push(new tenant_1.Tenant(tenantResponse));
            });
            // Return list of tenants and the next page token if available.
            var result = {
                tenants: tenants,
                pageToken: response.nextPageToken,
            };
            // Delete result.pageToken if undefined.
            if (typeof result.pageToken === 'undefined') {
                delete result.pageToken;
            }
            return result;
        });
    };
    /**
     * Deletes an existing tenant.
     *
     * @param tenantId - The `tenantId` corresponding to the tenant to delete.
     *
     * @returns An empty promise fulfilled once the tenant has been deleted.
     */
    TenantManager.prototype.deleteTenant = function (tenantId) {
        return this.authRequestHandler.deleteTenant(tenantId);
    };
    /**
     * Creates a new tenant.
     * When creating new tenants, tenants that use separate billing and quota will require their
     * own project and must be defined as `full_service`.
     *
     * @param tenantOptions - The properties to set on the new tenant configuration to be created.
     *
     * @returns A promise fulfilled with the tenant configuration corresponding to the newly
     *   created tenant.
     */
    TenantManager.prototype.createTenant = function (tenantOptions) {
        return this.authRequestHandler.createTenant(tenantOptions)
            .then(function (response) {
            return new tenant_1.Tenant(response);
        });
    };
    /**
     * Updates an existing tenant configuration.
     *
     * @param tenantId - The `tenantId` corresponding to the tenant to delete.
     * @param tenantOptions - The properties to update on the provided tenant.
     *
     * @returns A promise fulfilled with the update tenant data.
     */
    TenantManager.prototype.updateTenant = function (tenantId, tenantOptions) {
        return this.authRequestHandler.updateTenant(tenantId, tenantOptions)
            .then(function (response) {
            return new tenant_1.Tenant(response);
        });
    };
    return TenantManager;
}());
exports.TenantManager = TenantManager;
