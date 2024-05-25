import { HTTP } from '../utils/index.js'

var cid = document.querySelectorAll('.cart_item-delete')
var pb = document.getElementById('purchase-cart_button')
var query = new HTTP()

cid.forEach((d) => {
    d.addEventListener('click', (e) => {
        query
            .post({ path: `/cart/remove/${e.target.dataset.workId}` })
            .then((r) => {
                window.location.reload()
            })
            .catch((e) => console.error({ e }))
    })
})

pb.addEventListener('click', (e) => {
    var amount = parseFloat(e.target.dataset.price)
    query
        .post({
            path: e.target.dataset.href,
            body: JSON.stringify({
                amount,
                paymentType: 'purchase',
                currency: 'USD',
            }),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((r) => console.log(r))
        .catch((e) => console.error(e))
})
