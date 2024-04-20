import { argon2id } from 'argon2'

import { stringToUint8 } from '../pass/hash.js'

export default function hashAdminPassword(s = '') {
    var salt = stringToUint8(s)
    return (formMap, [key, value]) => {
        if (key === 'password') {
            argon2id({
                password: value,
                salt,
                parallelism: 4,
                iterations: 4,
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
