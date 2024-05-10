var tap = new CustomEvent('toggleAudioPlayer', {
    bubbles: true,
    cancelable: false,
})
var apt = document.getElementsByClassName('audio-poem_trigger')
var app = document.getElementsByClassName('audio-poem_player')

app.forEach((a) => {
    a.addEventListener(`toggleAudioPlayer_${a.dataset.workId}`, (e) => {
        if (e.target.style.display) e.target.removeAttribute('style')
        else e.target.setAttribute('style', 'display: none;')
    })
})

apt.forEach((a) => {
    a.addEventListener('click', (e) => {
        this.dispatchEvent(
            new CustomEvent(`toggleAudioPlayer_${e.target.dataset.workId}`, {
                bubbles: true,
            })
        )
    })
})
