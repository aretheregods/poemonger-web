var poem = document.querySelector('.poem-section-container')

poem.addEventListener('keydown', chapterKeys)

function chapterKeys(e) {
    var href = new URL(window.location.href)
    var params = href.searchParams
    var c = params.get('chapter')
    var p = params.get('previous')
    if (e.code === 39) {
        params.set('chapter', c ? parseInt(c) + 1 : 2)
        params.set('previous', p ? c : 1)
    }
    if (e.code === 37) {
        if(!c) return
        params.set('chapter', parseInt(c) - 1)
        params.set('previous', c)
    }

    window.open(href.href, '_blank')
}