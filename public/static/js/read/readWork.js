var n = document.getElementById('next')
var p = document.getElementById('previous')

if (n) n.addEventListener('click', chapterNav)
if (p) p.addEventListener('click', chapterNav)

function chapterNav(e) {
    var c = e.target.dataset.chapter
    var u = new URLSearchParams()
    u.set('chapter', c)
    window.location.search = u
}
