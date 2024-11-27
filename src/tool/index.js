/**
 * Converts a size value (in bytes) to a human-readable string with appropriate units (e.g., KB, MB, GB).
 * @param {number|string} value - The size in bytes (can be a string or number).
 * @returns {string} The formatted size string (e.g., '1.23 MB').
 */
export function renderSize(value) {
    if (!value) {
        return '0 B'
    }
    const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const srcSize = parseFloat(value)
    const index = Math.floor(Math.log(srcSize) / Math.log(1024))
    let size = srcSize / Math.pow(1024, index)
    size = size.toFixed(2)
    return size + ' ' + unitArr[index]
}

/**
 * Formats a Date object into a string according to the provided format.
 * @param {string} fmt - The format string (e.g., 'YYYY-MM-DD HH:mm:ss').
 * @param {Date|string} date - The date to format (can be a Date object or a date string).
 * @returns {string} The formatted date string.
 */
export function dateFormat(fmt, date) {
    date = new Date(date)
    const opt = {
        'Y+': date.getFullYear().toString(),
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(),
        'H+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        'S+': date.getSeconds().toString()
    }
    for (let k in opt) {
        let ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(ret[1], ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'))
        }
    }
    return fmt
}

/**
 * Rounds a number to two decimal places and returns it as a string.
 * @param {number|string} x - The number to round.
 * @returns {string} The rounded number as a string, with exactly two decimal places.
 */
export function numberTwoDecimal(x) {
    let f = parseFloat(x)
    if (isNaN(f)) {
        return '0'
    }
    f = Math.round(x * 100) / 100
    let s = f.toString()
    let n = s.indexOf('.')
    if (n < 0) {
        n = s.length
        s += '.'
    }
    while (s.length <= n + 2) {
        s += '0'
    }
    return s
}

/**
 * Generates a UUID (Universally Unique Identifier).
 * @param {number} [len] - The length of the UUID (optional, if not provided generates a standard UUID).
 * @param {number} [radix] - The radix (base) to use for the UUID (optional).
 * @returns {string} A randomly generated UUID.
 */
export function uuid(len, radix) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    const uuid = []
    radix = radix || chars.length
    if (len) {
        for (let i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix]
        }
    } else {
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'
        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                let r = 0 | Math.random() * 16
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }
    return uuid.join('')
}

/**
 * Calculates the percentage of a given number out of a total.
 * @param {number} num - The part value.
 * @param {number} total - The total value.
 * @returns {number} The percentage (rounded to two decimal places).
 */
export function percentage(num, total) {
    if (num === 0 || total === 0) {
        return 0
    }
    return (Math.round(num / total * 10000) / 100.00)
}

/**
 * Downloads a file from a given URL and saves it with the specified name.
 * @param {string} url - The URL of the file to download.
 * @param {string} name - The name to save the downloaded file as.
 */
export function download(url, name) {
    fetch(url).then(res => res.blob().then(blob => {
        const a = document.createElement('a')
        // noinspection JSCheckFunctionSignatures
        a.href = window.URL.createObjectURL(blob)
        a.download = name
        a.click()
    }))
}
