var n = document.getElementById('next')
var p = document
    .getElementById('previous')

    [(n, p)].forEach((b) => {
        if (b)
            b.addEventListener('click', (e) => {
                switch (e.target.id) {
                    case 'next':
                    case 'previous':
                        var c = e.target.dataset.chapter
                        var u = new URLSearchParams()
                        u.set('chapter', c)
                        window.location.search = u
                }
            })
    })
