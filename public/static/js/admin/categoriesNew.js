import HTTP from '../utils/http/index.js'

const request = new HTTP();
const f = document.getElementById('add-category');

f.addEventListener('submit', (e) => {
    e.preventDefault()

    request
        .post({
            path: '/admin/categories/new',
            body: new FormData(e.target, e.submitter),
        })
        .then((res) =>
            res.success
                ? (location.href = '/admin/categories')
                : console.error({ error: res.error })
        )
        .catch((e) => console.error(e))
})
