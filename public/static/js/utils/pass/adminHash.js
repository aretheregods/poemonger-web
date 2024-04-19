import { argon2id } from 'argon2'

export default function hashAdminPassword(s = '') {
    var salt = stringToUint8(s)
    return (formMap, [key, value]) => {
        if (key === 'password') {
            argon2id({
                password: value,
                salt,
                parallelism: 4,
                iterations: 256,
                memorySize: 512,
                hashLength: 32,
                outputType: 'encoded',
            }).then((hash) => {
                formMap.set(key, hash)
                return formMap
            })
        }
        return formMap
    }
}

function stringToUint8(s = '') {
    var a = s.split(',')
    var b = a.map((v) => parseInt(v))
    return Uint8Array.from(b)
}
