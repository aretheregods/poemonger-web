var poem = document.querySelector('.poem-section-container')

poem.addEventListener('keydown', chapterKeys)

function chapterKeys(e) {
    var href = new URL(window.location.href)
    var params = href.searchParams
    var c = params.get('chapter')
    var p = params.get('previous')
    if (e.code === 39) {
        var u = new URLSearchParams()
        u.set('chapter', c ? parseInt(c) + 1 : 2)
        u.set('previous', p ? c : 1)
        window.location.search = u
    }
    if (e.code === 37) {
        if (!c) return
        var u = new URLSearchParams()
        params.set('chapter', parseInt(c) - 1)
        params.set('previous', c)
        window.location.search = u
    }
}