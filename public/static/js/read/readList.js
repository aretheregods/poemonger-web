var apt = document.querySelectorAll('.audio-poem_trigger')

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
                'background-color: hsl( 244, 84%, calc(79% - 20%) ); color: white;'
            )
    })
})
