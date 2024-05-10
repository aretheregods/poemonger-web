var apt = document.querySelectorAll('.audio-poem_trigger')

apt.forEach((a) => {
    a.addEventListener('click', (e) => {
        var app = document.getElementById(`audio-poem_player-${workId}`)
        if (app.hasAttribute('style')) app.removeAttribute('style')
        else app.setAttribute('style', 'display: none;')
    })
})
