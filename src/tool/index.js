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

export function numberTwoDecimal(x) {
    let f = parseFloat(x)
    if (isNaN(f)) {
        return 0
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

export function percentage(num, total) {
    if (num === 0 || total === 0) {
        return 0
    }
    return (Math.round(num / total * 10000) / 100.00)
}

export function download(url, name) {
    fetch(url).then(res => res.blob().then(blob => {
        const a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        a.download = name
        a.click()
    }))
}
