import { hashPassword, HTTP } from '../utils/index.js'

var f = document.getElementById('reset')
var o = document.getElementById('old_password-input')
var p = document.getElementById('password-input')
var pc = document.getElementById('confirm_password-input')
var r = document.getElementById('reveal-password-container')
var request = new HTTP()

f.addEventListener('submit', async e => {
    e.preventDefault()
    var formData = new FormData(f)
    var { salt, error } = await request.post({
        path: '/account/reset/salt',
    })

    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer: hashPassword({
                salt,
                p: 'password',
                c: 'confirm_password',
                o: 'old_password',
            }),
        })
        .then(body => request.post({ path: '/account/reset/password', body }))
        .then(() => {
            location.href = '/login'
        })
        .catch(e => console.log({ e }))
})

p.addEventListener('change', e => {
    var c = document.getElementById('confirm_password-input')

    if (c.value && e.target.value && c.value !== e.target.value) {
        c.setCustomValidity("Passwords don't match")
    }

    if (c.value && e.target.value && c.value === e.target.value) {
        c.setCustomValidity('')
    }

    c.reportValidity()
})

pc.addEventListener('input', e => {
    var w = document.getElementById('password-input')

    if (w.value && e.target.value && w.value !== e.target.value) {
        e.target.setCustomValidity("Passwords don't match")
    }

    if (w.value && e.target.value && w.value === e.target.value) {
        e.target.setCustomValidity('')
    }

    e.target.reportValidity()
})

r.addEventListener('click', e => {
    var p = document.getElementById('password-input')
    var pc = document.getElementById('confirm_password-input')

    if (e.target.checked) {
        p.setAttribute('type', 'text')
        pc.setAttribute('type', 'text')
    }

    if (!e.target.checked) {
        p.setAttribute('type', 'password')
        pc.setAttribute('type', 'password')
    }
})
