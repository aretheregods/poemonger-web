import HTTP from '../utils/http/index.js'

var request = new HTTP()
var f = document.getElementById('add-poem')

f.addEventListener('submit', e => {
    e.preventDefault()

    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer(formMap, [key, value]) {
                if (key === 'lines' || key === 'sample') {
                    var field = document.getElementById(key)
                    var stanzas = field.value.split(/\r\r|\n\n/)
                    var lines = stanzas.map(stanza => stanza.split(/\r|\n/))
                    formMap.set(key, JSON.stringify(lines))
                }

                if (key === 'work') {
                    var [title, id] = value.split("=")
                    formMap.set('work', id)
                    formMap.set('work_title', title)
                }

                return formMap
            },
        })
        .then(body => request.post({
            path: '/admin/poetry/new',
            body,
        }))
        .then(res =>
            res.success
                ? (location.href = '/admin/poetry')
                : console.error({ error: res.error })
        )
        .catch(e => console.error(e))
})

