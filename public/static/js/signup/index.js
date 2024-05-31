import { hashPassword, HTTP } from '../utils/index.js'

var f = document.getElementById('signup')
var p = document.getElementById('password-input')
var pc = document.getElementById('password-confirm-input')
var r = document.getElementById('reveal-password-container')
var request = new HTTP()

f.addEventListener('submit', e => {
    e.preventDefault()
    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer: hashPassword({}),
        })
        .then(body =>
            request.post({
                path: '/signup',
                headers: { 'X-Poemonger-Form': 'signup ' },
                body,
            })
        )
        .then(response => console.log({ response }))
        .catch(e => console.log({ e }))
})

p.addEventListener('change', e => {
    var c = document.getElementById('password-confirm-input')

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
