import HTTP from '../utils/http/index.js'

const request = new HTTP();
const f = document.getElementById('add-category');

f.addEventListener('submit', (e) => {
    e.preventDefault();

    request.post({ path: '/admin/categories/new', body: new FormData(e.target, e.submitter) })
        .then(res => console.log({ res: res.json() }))
        .catch(e => console.error(e))
})
