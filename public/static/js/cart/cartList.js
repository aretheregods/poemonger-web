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
    if (!e.target.dataset.checkoutToken) {
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

window.addEventListener('message', (e) => {
    var checkout = document.getElementById('purchase-cart_button')
    var key = `helcim-pay-js-${checkout.dataset.checkoutToken}`
    if (e.data.eventName === key) {
        if (e.data.eventStatus === 'ABORTED') {
            console.log({ error: e.data.eventMessage })
        }

        if (e.data.eventStatus === 'SUCCESS') {
            query
                .post({
                    path: '/cart/purchase/complete',
                    body: JSON.stringify({
                        works: checkout.dataset.works
                            .split(',')
                            .map((work) => parseInt(work)),
                        invoice: JSON.parse(e.data.eventMessage).data,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                })
                .then((_) => (location.href = '/read'))
        }
    }
})
