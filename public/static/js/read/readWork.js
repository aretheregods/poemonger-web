var n = document.getElementById('next')
var p = document.getElementById('previous')
var r = document.getElementById('page-range')

if (n) n.addEventListener('click', chapterButtons)
if (n) n.addEventListener('mouseup', chapterButtons)
if (p) p.addEventListener('click', chapterButtons)
if (p) p.addEventListener('mouseup', chapterButtons)
if (r) r.addEventListener('change', chapterRange)

function chapterButtons(e) {
    var c = e.target.dataset.chapter
    if (e.metaKey || e.button === 1) {
        var href = new URL(window.location.href)
        var params = href.searchParams
        params.set('chapter', c)
        window.open(href.href, '_blank')
    } else {
        var u = new URLSearchParams()
        u.set('chapter', c)
        window.location.search = u
    }
}

function chapterRange(e) {
    var c = e.target.value
    var u = new URLSearchParams()
    u.set('chapter', c)
    window.location.search = u
}
