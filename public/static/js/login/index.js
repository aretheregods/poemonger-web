import { hashPassword, HTTP } from '../utils/index.js'

var f = document.getElementById('login')
var r = document.getElementById('reveal-password-container')
var request = new HTTP()

f.addEventListener('submit', async e => {
    e.preventDefault()
    var formData = new FormData(f)
    var { salt, error } = await request.post({
        path: '/login/check-email',
        body: formData,
    })
    if (error) {
        var email = document.getElementById('email-input')
        return email.setAttribute('invalid', true)
    }
    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer: hashPassword({ salt }),
        })
        .then(body => request.post({ path: '/login', body }))
        .then(r => {
            if (!r.error) {
                var params = new URLSearchParams(document.location.search)
                var redirect = params.get('redirect')
                var path = redirect ?? '/'
                location.href = path
            } else console.log({ r })
        })
        .catch(e => console.log({ e }))
})

r.addEventListener('click', e => {
    var p = document.getElementById('password-input')

    if (e.target.checked) {
        p.setAttribute('type', 'text')
    }

    if (!e.target.checked) {
        p.setAttribute('type', 'password')
    }
})
