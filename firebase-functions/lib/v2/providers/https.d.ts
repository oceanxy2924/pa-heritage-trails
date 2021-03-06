import * as express from 'express';
import * as options from '../options';
import { CallableRequest, FunctionsErrorCode, HttpsError, Request } from '../../common/providers/https';
import { ManifestEndpoint } from '../../runtime/manifest';
export { Request, CallableRequest, FunctionsErrorCode, HttpsError };
export interface HttpsOptions extends Omit<options.GlobalOptions, 'region'> {
    region?: options.SupportedRegion | string | Array<options.SupportedRegion | string>;
    cors?: string | boolean | RegExp | Array<string | RegExp>;
}
export declare type HttpsFunction = ((req: Request, res: express.Response) => void | Promise<void>) & {
    __trigger?: unknown;
    __endpoint: ManifestEndpoint;
};
export interface CallableFunction<T, Return> extends HttpsFunction {
    run(data: CallableRequest<T>): Return;
}
export declare function onRequest(opts: HttpsOptions, handler: (request: Request, response: express.Response) => void | Promise<void>): HttpsFunction;
export declare function onRequest(handler: (request: Request, response: express.Response) => void | Promise<void>): HttpsFunction;
export declare function onCall<T = any, Return = any | Promise<any>>(opts: HttpsOptions, handler: (request: CallableRequest<T>) => Return): CallableFunction<T, Return>;
export declare function onCall<T = any, Return = any | Promise<any>>(handler: (request: CallableRequest<T>) => Return): CallableFunction<T, Return>;
