import { hashPassword, HTTP } from '../utils/index.js'

var f = document.getElementById('reset-password')
var p = document.getElementById('password-input')
var pc = document.getElementById('password-confirm-input')
var r = document.getElementById('reveal-password-container')
var request = new HTTP()

f.addEventListener('submit', async (e) => {
    e.preventDefault()
    var formData = new FormData(f)
    var { salt, error } = await request.post({
        path: '/reset/salt',
        body: formData,
    })
    
    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer: hashPassword({ salt, p: 'new-password', c: 'confirm-new-password' }),
        })
        .then((body) => request.post({ path: '/reset/password', body }))
        .then(() => {
            location.href = '/login'
        })
        .catch((e) => console.log({ e }))
})

p.addEventListener('change', (e) => {
    var c = document.getElementById('password-confirm-input')

    if (c.value && e.target.value && c.value !== e.target.value) {
        c.setCustomValidity("Passwords don't match")
    }

    if (c.value && e.target.value && c.value === e.target.value) {
        c.setCustomValidity('')
    }

    c.reportValidity()
})

pc.addEventListener('input', (e) => {
    var w = document.getElementById('password-input')

    if (w.value && e.target.value && w.value !== e.target.value) {
        e.target.setCustomValidity("Passwords don't match")
    }

    if (w.value && e.target.value && w.value === e.target.value) {
        e.target.setCustomValidity('')
    }

    e.target.reportValidity()
})

r.addEventListener('click', (e) => {
    var p = document.getElementById('password-input')
    var pc = document.getElementById('password-confirm-input')

    if (e.target.checked) {
        p.setAttribute('type', 'text')
        pc.setAttribute('type', 'text')
    }

    if (!e.target.checked) {
        p.setAttribute('type', 'password')
        pc.setAttribute('type', 'password')
    }
})
