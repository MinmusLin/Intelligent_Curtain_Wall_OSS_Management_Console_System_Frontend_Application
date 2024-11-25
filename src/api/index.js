// noinspection JSUnresolvedReference

import OSS from 'ali-oss'

/**
 * Get an OSS client instance.
 * The client configuration is retrieved from localStorage (key: 'client').
 * @returns {Client} An OSS client instance.
 */
export function getClient() {
    return new OSS(JSON.parse(window.localStorage.getItem('client')) || {})
}

/**
 * Retrieve a list of files or directories.
 * @param {string} prefix - Path prefix for listing files or directories.
 * @param {string} marker - Marker for pagination, specifying the starting point of the next list.
 * @returns {Promise<Object>} A promise that resolves with the list of files or directories.
 */
export const fileList = (prefix, marker) => {
    return getClient().list({prefix, delimiter: '/', 'max-keys': 1000, marker})
}

/**
 * Retrieve the complete list of files or directories under a prefix.
 * @param {string} prefix - Path prefix for listing files or directories.
 * @returns {Promise<Object>} A promise that resolves with the full list of files or directories.
 */
export const allList = (prefix) => {
    return getClient().list({prefix, 'max-keys': 1000})
}

/**
 * Continue listing files or directories for paginated results.
 * Primarily used for recursive directory listing.
 * @param {string} marker - Marker for pagination, specifying the starting point of the next list.
 * @returns {Promise<Object>} A promise that resolves with the list of files or directories.
 */
export const maxList = (marker) => {
    return getClient().list({marker, 'max-keys': 1000})
}

/**
 * Copy a file to a new key (destination).
 * @param {string} key - The destination key (path) for the copied file.
 * @param {string} file - The source file to be copied.
 * @returns {Promise<Object>} A promise that resolves with the result of the copy operation.
 */
export const copy = (key, file) => {
    return getClient().copy(key, file)
}

/**
 * Generate a signed URL for downloading a file.
 * @param {string} key - The key (path) of the file to be downloaded.
 * @param {Object} response - Optional response headers to include in the signed URL.
 * @returns {string} A signed URL for downloading the file.
 */
export const signatureUrl = (key, response) => {
    return getClient().signatureUrl(key, {response})
}

/**
 * Perform multipart upload (resumable upload) of a file.
 * @param {string} key - The key (path) for the uploaded file.
 * @param {File|Blob} file - The file to be uploaded.
 * @param {Object} options - Additional options for the upload.
 * @param {OSS} client - An OSS client instance to use for the upload.
 * @returns {Promise<Object>} A promise that resolves with the result of the multipart upload.
 */
export const multipartUpload = async (key, file, options = {}, client) => {
    return client.multipartUpload(key, file, options)
}

/**
 * Perform multipart upload for an editor use case.
 * @param {string} key - The key (path) for the uploaded file.
 * @param {File|Blob} file - The file to be uploaded.
 * @param {Object} options - Additional options for the upload.
 * @returns {Promise<Object>} A promise that resolves with the result of the multipart upload.
 */
export const editorMultipartUpload = (key, file, options = {}) => {
    return getClient().multipartUpload(key, file, options)
}

/**
 * Perform multipart upload as a fallback method.
 * @param {string} key - The key (path) for the uploaded file.
 * @param {File|Blob} file - The file to be uploaded.
 * @param {Object} options - Additional options for the upload.
 * @returns {Promise<Object>} A promise that resolves with the result of the multipart upload.
 */
// export const clipMultipartUpload = (key, file, options = {}) => {
//     return getClient().multipartUpload(key, file, options)
// }

/**
 * Perform a simple upload for small files.
 * @param {string} key - The key (path) for the uploaded file.
 * @param {File|Blob} file - The file to be uploaded.
 * @returns {Promise<Object>} A promise that resolves with the result of the upload.
 */
export const simplePut = (key, file) => {
    return getClient().put(key, file)
}

/**
 * Delete multiple files in batch mode.
 * @param {string[]} keys - An array of keys (paths) of the files to be deleted.
 * @returns {Promise<Object>} A promise that resolves with the result of the batch deletion.
 */
export const deleteMulti = (keys) => {
    return getClient().deleteMulti(keys, {quiet: true})
}

/**
 * Delete a single file.
 * @param {string} key - The key (path) of the file to be deleted.
 * @returns {Promise<Object>} A promise that resolves with the result of the deletion.
 */
export const deleteKey = (key) => {
    return getClient().delete(key, {quiet: true})
}
