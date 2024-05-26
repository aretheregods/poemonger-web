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
    if(!e.target.dataset.checkoutToken) {
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
            .then((r) => {
                if (!r?.error) {
                    e.target.dataset.checkoutToken = r.checkoutToken
                    appendHelcimPayIframe(r.checkoutToken)
                }
            })
            .catch((e) => console.error(e))
    } else appendHelcimPayIframe(e.target.dataset.checkoutToken)
})
