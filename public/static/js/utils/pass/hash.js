export default function hashPasswordWithSalt({
    salt = '',
    p = 'password',
    c = 'confirm_password',
    o = '_',
}) {
    var s = salt
        ? stringToUint8(salt)
        : window.crypto.getRandomValues(new Uint8Array(64))
    return (formMap, [key, value]) => {
        if (key === p || key === c || key === o) {
            return hash(value, s, 6e5).then(h => {
                formMap.set(key, `${bitsToHex(new Uint8Array(h))}`)
                if (!salt && !formMap.get('salt')) formMap.set('salt', s)

                return formMap
            })
        }

        return formMap
    }
}

export function stringToUint8(s = '', type = 'int') {
    var response
    if (type === 'int') {
        var a = s.split(',')
        var b = a.map(v => parseInt(v))
        response = Uint8Array.from(b)
    } else {
        var t = new TextEncoder()
        response = t.encode(s)
    }
    return response
}

function getPasswordKey(pw) {
    var t = new TextEncoder()
    return window.crypto.subtle.importKey(
        'raw',
        t.encode(pw),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    )
}

function hash(pw, salt, iterations) {
    return getPasswordKey(pw)
        .then(k => {
            return window.crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    hash: 'SHA-512',
                    salt,
                    iterations,
                },
                k,
                512
            )
        })
        .catch(e => console.error(e))
}

function bitsToHex(uint8Array) {
    var hex = []
    for (var i = 0; i < uint8Array.length; i++) {
        hex.push((uint8Array[i] >> 4).toString(16))
        hex.push((uint8Array[i] & 0xf).toString(16))
    }
    return hex.join('')
}
