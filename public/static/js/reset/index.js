import { HTTP } from '../utils/index.js'

var f = document.getElementById('reset')
var request = new HTTP()

f.addEventListener('submit', async (e) => {
    e.preventDefault()
    var body = new FormData(f)

    request.post({ path: '/reset/token', body })
        .then(() => {
            location.href = '/reset/password'
        })
        .catch((e) => console.log({ e }))
})
