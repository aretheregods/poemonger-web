import HTTP from '../utils/http/index.js'

var query = new HTTP()
var apt = document.querySelectorAll('.audio-poem_trigger')
var atc = document.querySelectorAll('.add-to-cart')

apt.forEach((a) => {
    a.addEventListener('click', (e) => {
        function audioTransition() {
            var app = document.getElementById(
                `audio-poem_player-${e.target.dataset.workId}`
            )
            var audio = document.getElementById(`audio-poem_player-element-${e.target.dataset.workId}`)

            if (app.dataset.on == 1) {
                e.target.dataset.on = 0
                app.dataset.on = 0
                app.setAttribute('style', 'height: 0px; opacity: 0%; z-index: -1;')
                audio.setAttribute('preload', 'none')
                e.target.setAttribute(
                    'style',
                    'background-color: auto; color: auto;'
                )
            } else {
                e.target.dataset.on = 1
                app.dataset.on = 1
                app.removeAttribute('style')
                audio.setAttribute('preload', 'metadata')
                e.target.setAttribute(
                    'style',
                    'background-color: hsl( 244, 84%, 79% ); color: white;'
                )
            }
        }

        if(!document.startViewTransition) return audioTransition()
        else document.startViewTransition(audioTransition)
    })
})

atc.forEach((a) => {
    a.addEventListener('click', (e) => {
        var workId = e.target.dataset.workId
        var s = document.getElementById('shopping-cart_count')
        var b = document.getElementById(`add-to-cart_button-${workId}`)
        var i = document.getElementById(`added-icon_${workId}`)
        var a = document.getElementById(`added-add_${workId}`)
        if (e.target.dataset.added == 0)
            query.post({ path: `/cart/${workId}` }).then((added) => {
                if (added.added) {
                    e.target.dataset.added = 1
                    s.textContent = parseInt(s.textContent + 1)
                    b.classList.add('added')
                    i.innerHTML = `&#10003;`
                    a.textContent = 'Added'
                }
            })
        else
            query.post({ path: `/cart/remove/${workId}` }).then((deleted) => {
                if (deleted.deleted) {
                    e.target.dataset.added = 0
                    s.textContent = parseInt(s.textContent - 1)
                    b.classList.remove('added')
                    i.innerHTML = '&#65291;'
                    a.textContent = 'Add'
                }
            })
    })
})
