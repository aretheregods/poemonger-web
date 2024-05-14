var n = document.getElementById('next')
var p = document.getElementById('previous')
var r = document.getElementById('page-range')

if (n) n.addEventListener('click', chapterButtons)
if (p) p.addEventListener('click', chapterButtons)
if (r) r.addEventListener('change', chapterRange)

function chapterButtons(e) {
    var c = e.target.dataset.chapter
    if (e.ctrlKey) {
        var href = new URL(window.location.href)
        var params = href.searchParams
        params.set('chapter', c)
        window.open(href.href, '_blank')
    }
    var u = new URLSearchParams()
    u.set('chapter', c)
    window.location.search = u
}

function chapterRange(e) {
    var c = e.target.value
    var u = new URLSearchParams()
    u.set('chapter', c)
    window.location.search = u
}
