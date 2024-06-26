import { hashAdminPassword, HTTP } from '../utils/index.js'

var f = document.getElementById('login')
var r = document.getElementById('reveal-password-container')
var request = new HTTP()

f.addEventListener('submit', async (e) => {
    e.preventDefault()
    var formData = new FormData(f)
    var { salt, error } = await request.post({
        path: '/admin/check-admin',
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
            reducer: hashAdminPassword(salt),
        })
        .then((body) => request.post({ path: '/admin', body }))
        .then(() => (location.href = '/admin/dashboard'))
        .catch((e) => console.log({ e }))
})

r.addEventListener('click', (e) => {
    var p = document.getElementById('password-input')

    if (e.target.checked) {
        p.setAttribute('type', 'text')
    }

    if (!e.target.checked) {
        p.setAttribute('type', 'password')
    }
})
