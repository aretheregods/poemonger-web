var apt = document.querySelectorAll('.audio-poem_trigger')
var vpt = document.querySelectorAll('.video-poem_trigger')

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
                    'background-color: hsl( 244, 84%, 59% ); color: white;'
                )
            }
        }

        if (!document.startViewTransition) return audioTransition()
        else document.startViewTransition(audioTransition)
    })
})

vpt.forEach(v => {
    v.addEventListener('click', e => {
        function videoTransition() {
            var vpp = document.getElementById(
                `video-poem_player-${e.target.dataset.workId}`
            )

            if (app.dataset.on == 1) {
                e.target.dataset.on = 0
                vpp.dataset.on = 0
                vpp.setAttribute(
                    'style',
                    'height: 0px; opacity: 0%; z-index: -1;'
                )
                e.target.setAttribute(
                    'style',
                    'background-color: auto; color: auto;'
                )
            } else {
                e.target.dataset.on = 1
                vpp.dataset.on = 1
                vpp.removeAttribute('style')
                e.target.setAttribute(
                    'style',
                    'background-color: hsl( 244, 84%, 59% ); color: white;'
                )
            }
        }

        if (!document.startViewTransition) return videoTransition()
        else document.startViewTransition(videoTransition)
    })
})
