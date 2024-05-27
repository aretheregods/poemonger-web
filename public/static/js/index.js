var apt = document.querySelectorAll('.audio-poem_trigger')
var plw = document.getElementById('poemonger-landing-works')
var works = document.querySelectorAll('.work-description_container')
var w = document.querySelectorAll('.work-container')

works.forEach(work => {
    work.addEventListener('toggle', e => {
        if (e.newState === 'open') {
            plw.setAttribute('style', 'pointer-events: none;')
            w.forEach(container =>
                container.setAttribute('style', 'pointer-events: none;')
            )
        } else {
            plw.removeAttribute('style')
            w.forEach(container => container.removeAttribute('style'))
        }
    })
})

apt.forEach(a => {
    a.addEventListener('click', e => {
        function audioTransition() {
            var app = document.getElementById(
                `audio-poem_player-${e.target.dataset.workId}`
            )
            var audio = document.getElementById(
                `audio-poem_player-element-${e.target.dataset.workId}`
            )

            if (app.dataset.on == 1) {
                e.target.dataset.on = 0
                app.dataset.on = 0
                app.setAttribute(
                    'style',
                    'height: 0px; opacity: 0%; z-index: -1;'
                )
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

        if (!document.startViewTransition) return audioTransition()
        else document.startViewTransition(audioTransition)
    })
})
