import HTTP from '../utils/http/index.js'

var query = new HTTP()
var apt = document.querySelectorAll('.audio-poem_trigger')
var atc = document.querySelectorAll('.add-to-cart')

apt.forEach((a) => {
    a.addEventListener('click', (e) => {
        var app = document.getElementById(
            `audio-poem_player-${e.target.dataset.workId}`
        )
        if (app.hasAttribute('style')) app.removeAttribute('style')
        else app.setAttribute('style', 'display: none;')

        if (e.target.hasAttribute('style')) e.target.removeAttribute('style')
        else
            e.target.setAttribute(
                'style',
                'background-color: hsl( 244, 84%, 79% ); color: white;'
            )
    })
})

atc.forEach((a) => {
    a.addEventListener('click', (e) => {
        if (e.target.dataset.added == 0)
            query
                .post({ path: `/cart/${e.target.dataset.workId}` })
                .then((added) => {
                    if (added.added) {
                        var s = document.getElementById('shopping-cart_count')
                        var i = document.getElementById(
                            `added-icon_${e.target.dataset.workId}`
                        )
                        var a = document.getElementById(`added-add_${workId}`)
                        e.target.dataset.added = 1
                        s.textContent = parseInt(s.textContent + 1)
                        i.textContent = `&#10003;`
                        a.textContent = 'Added'
                    }
                })
        else
            query
                .post({ path: `/cart/remove/${e.target.dataset.workId}` })
                .then((deleted) => {
                    if (deleted.deleted) {
                        var s = document.getElementById('shopping-cart_count')
                        var i = document.getElementById(
                            `added-icon_${e.target.dataset.workId}`
                        )
                        var a = document.getElementById(`added-add_${workId}`)
                        e.target.dataset.added = 0
                        s.textContent = parseInt(s.textContent - 1)
                        i.textContent = '&#65291;'
                        a.textContent = 'Add'
                    }
                })
    })
})
