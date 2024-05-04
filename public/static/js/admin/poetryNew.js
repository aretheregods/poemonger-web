import HTTP from '../utils/http/index.js'

const request = new HTTP()
const f = document.getElementById('add-poem')

f.addEventListener('submit', (e) => {
    e.preventDefault()

    request
        .parseForm({
            formElement: e.target,
            submitter: e.submitter,
            reducer(formMap, [key, value]) {
                if (key === 'lines') {
                    var sections = value.split('\n\n')
                    var lines = sectinos.map(s => s.split('\n'))
                    
                }
            }
        })
        .post({
            path: '/admin/poetry/new',
            body: new FormData(e.target, e.submitter),
        })
        .then((res) =>
            res.success
                ? (location.href = '/admin/poetry')
                : console.error({ error: res.error })
        )
        .catch((e) => console.error(e))
})
