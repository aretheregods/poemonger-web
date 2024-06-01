import HTTP from '../utils/http/index.js'

var request = new HTTP()
var f = document.getElementById('add-poem')
var w = document.getElementById('work')

f.addEventListener('submit', e => {
    e.preventDefault()

    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer(formMap, [key, value]) {
                if (key === 'lines' || key === 'sample') {
                    var sections = value.split(/\r|\n/)
                    var lines = sections.reduce(
                        (stanzas, line, index, original) => {
                            if (index === original.length - 1) {
                                return stanzas
                            }
                            if (line === '' && index !== original.length - 1) {
                                stanzas.push([])
                                return stanzas
                            }
                            stanzas[stanzas.length - 1].push(line)
                            return stanzas
                        },
                        [[]]
                    )
                    formMap.set(key, lines)
                }

                if (key === 'work') {
                    var [title, id] = value.split("=")
                    formMap.set('work', id)
                    formMap.set('work_title', title)
                }

                return formMap
            },
        })
        then(body => request.post({
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

