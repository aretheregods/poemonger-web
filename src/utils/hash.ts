export default class Hashes {
    #getPasswordKey(pw: string) {
        var t = new TextEncoder()
        return crypto.subtle.importKey('raw', t.encode(pw), 'PBKDF2', false, [
            'deriveBits',
            'deriveKey',
        ])
    }

    #hash(pw: string, salt: Uint8Array, iterations: number) {
        return this.#getPasswordKey(pw)
            .then((k) => {
                return crypto.subtle.deriveBits(
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
            .catch((e) => console.error(e))
    }

    #bitsToHex(uint8Array: Uint8Array) {
        var hex = []
        for (var i = 0; i < uint8Array.length; i++) {
            hex.push((uint8Array[i] >> 4).toString(16))
            hex.push((uint8Array[i] & 0xf).toString(16))
        }
        return hex.join('')
    }

    #stringToUint8(s: string | number = '') {
        var a = typeof s === 'string' ? s.split(',') : `${s}`.split('')
        var b = a.map((v) => parseInt(v))
        return Uint8Array.from(b)
    }

    async Hash256(message: string) {
        const msgUint8 = new TextEncoder().encode(message)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
        return hashHex
    }

    HashPasswordWithSalt(value: string, salt: string | number) {
        var s = this.#stringToUint8(salt)
        return this.#hash(value, s, 1e3).then((h) =>
            this.#bitsToHex(new Uint8Array(h as ArrayBuffer))
        )
    }
}
