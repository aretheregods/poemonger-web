var tap = new CustomEvent('toggleAudioPlayer', {
    bubbles: true,
    cancelable: false,
})
var apt = document.querySelectorAll('.audio-poem_trigger')
var app = document.querySelectorAll('.audio-poem_player')

app.forEach((a) => {
    a.addEventListener(`toggleAudioPlayer_${a.dataset.workId}`, (e) => {
        if (e.target.hasAttribute('style')) e.target.removeAttribute('style')
        else e.target.setAttribute('style', 'display: none;')
    })
})

apt.forEach((a) => {
    a.addEventListener('click', (e) => {
        e.target.dispatchEvent(
            new CustomEvent(`toggleAudioPlayer_${e.target.dataset.workId}`, {
                bubbles: true,
            })
        )
    })
})
