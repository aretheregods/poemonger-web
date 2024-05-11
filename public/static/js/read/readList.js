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
                    console.log({ added })
                    e.target.dataset.workId = 1
                })
        else
            query
                .post({ path: `/cart/remove/${e.target.dataset.workId}` })
                .then((removed) => {
                    console.log({ removed })
                    e.target.dataset.workId = 0
                })
    })
})
