import { HTTP } from '../utils/index.js'

var cid = document.querySelectorAll('.cart_item-delete')
var query = new HTTP()

cid.forEach((d) => {
    d.addEventListener('click', (e) => {
        query
            .post(`/cart/remove/${e.target.dataset.workId}`)
            .then((r) => {
                window.location.reload()
            })
            .catch((e) => console.error({ e }))
    })
})
