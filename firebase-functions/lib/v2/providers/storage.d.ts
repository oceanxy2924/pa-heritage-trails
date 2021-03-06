import * as options from '../options';
import { CloudEvent, CloudFunction } from '../core';
/**
 * An object within Google Cloud Storage.
 * Ref: https://github.com/googleapis/google-cloudevents-nodejs/blob/main/cloud/storage/v1/StorageObjectData.ts
 */
export interface StorageObjectData {
    /**
     * The name of the bucket containing this object.
     */
    bucket?: string;
    /**
     * Cache-Control directive for the object data, matching
     * [https://tools.ietf.org/html/rfc7234#section-5.2"][RFC 7234 §5.2].
     */
    cacheControl?: string;
    /**
     * Number of underlying components that make up this object. Components are
     * accumulated by compose operations.
     * Attempting to set this field will result in an error.
     */
    componentCount?: number;
    /**
     * Content-Disposition of the object data, matching
     * [https://tools.ietf.org/html/rfc6266][RFC 6266].
     */
    contentDisposition?: string;
    /**
     * Content-Encoding of the object data, matching
     * [https://tools.ietf.org/html/rfc7231#section-3.1.2.2][RFC 7231 §3.1.2.2]
     */
    contentEncoding?: string;
    /**
     * Content-Language of the object data, matching
     * [https://tools.ietf.org/html/rfc7231#section-3.1.3.2][RFC 7231 §3.1.3.2].
     */
    contentLanguage?: string;
    /**
     * Content-Type of the object data, matching
     * [https://tools.ietf.org/html/rfc7231#section-3.1.1.5][RFC 7231 §3.1.1.5].
     * If an object is stored without a Content-Type, it is served as
     * `application/octet-stream`.
     */
    contentType?: string;
    /**
     * CRC32c checksum. For more information about using the CRC32c
     * checksum, see
     * [https://cloud.google.com/storage/docs/hashes-etags#_JSONAPI][Hashes and
     * ETags: Best Practices].
     */
    crc32c?: string;
    /**
     * Metadata of customer-supplied encryption key, if the object is encrypted by
     * such a key.
     */
    customerEncryption?: CustomerEncryption;
    /**
     * HTTP 1.1 Entity tag for the object. See
     * [https://tools.ietf.org/html/rfc7232#section-2.3][RFC 7232 §2.3].
     */
    etag?: string;
    /**
     * The content generation of this object. Used for object versioning.
     * Attempting to set this field will result in an error.
     */
    generation?: number;
    /**
     * The ID of the object, including the bucket name, object name, and
     * generation number.
     */
    id?: string;
    /**
     * The kind of item this is. For objects, this is always "storage#object".
     */
    kind?: string;
    /**
     * MD5 hash of the data; encoded using base64 as per
     * [https://tools.ietf.org/html/rfc4648#section-4][RFC 4648 §4]. For more
     * information about using the MD5 hash, see
     * [https://cloud.google.com/storage/docs/hashes-etags#_JSONAPI][Hashes and
     * ETags: Best Practices].
     */
    md5Hash?: string;
    /**
     * Media download link.
     */
    mediaLink?: string;
    /**
     * User-provided metadata, in key/value pairs.
     */
    metadata?: {
        [key: string]: string;
    };
    /**
     * The version of the metadata for this object at this generation. Used for
     * preconditions and for detecting changes in metadata. A metageneration
     * number is only meaningful in the context of a particular generation of a
     * particular object.
     */
    metageneration?: number;
    /**
     * The name of the object.
     */
    name?: string;
    /**
     * The link to this object.
     */
    selfLink?: string;
    /**
     * Content-Length of the object data in bytes, matching
     * [https://tools.ietf.org/html/rfc7230#section-3.3.2][RFC 7230 §3.3.2].
     */
    size?: number;
    /**
     * Storage class of the object.
     */
    storageClass?: string;
    /**
     * The creation time of the object.
     * Attempting to set this field will result in an error.
     */
    timeCreated?: Date | string;
    /**
     * The deletion time of the object. Will be returned if and only if this
     * version of the object has been deleted.
     */
    timeDeleted?: Date | string;
    /**
     * The time at which the object's storage class was last changed.
     */
    timeStorageClassUpdated?: Date | string;
    /**
     * The modification time of the object metadata.
     */
    updated?: Date | string;
}
/**
 * Metadata of customer-supplied encryption key, if the object is encrypted by
 * such a key.
 */
export interface CustomerEncryption {
    /**
     * The encryption algorithm.
     */
    encryptionAlgorithm?: string;
    /**
     * SHA256 hash value of the encryption key.
     */
    keySha256?: string;
}
/** StorageOptions extend EventHandlerOptions with a bucket name  */
export interface StorageOptions extends options.EventHandlerOptions {
    bucket?: string;
}
/** Handle a storage object archived */
export declare function onObjectArchived(handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectArchived(bucket: string, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectArchived(opts: StorageOptions, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
/** Handle a storage object finalized */
export declare function onObjectFinalized(handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectFinalized(bucket: string, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectFinalized(opts: StorageOptions, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
/** Handle a storage object deleted */
export declare function onObjectDeleted(handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectDeleted(bucket: string, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectDeleted(opts: StorageOptions, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
/** Handle a storage object metadata updated */
export declare function onObjectMetadataUpdated(handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectMetadataUpdated(bucket: string, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
export declare function onObjectMetadataUpdated(opts: StorageOptions, handler: (event: CloudEvent<StorageObjectData>) => any | Promise<any>): CloudFunction<StorageObjectData>;
