import { HTTP } from './utils/index.js'

var request = new HTTP()
var plw = document.getElementById('poemonger-landing-works')
var options = {
    threshold: 1,
}

var i = new IntersectionObserver(makeWorks, options)
i.observe(plw)

function makeWorks(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.worksFetched == 0) {
            entry.target.appendChild(
                document
                    .createElement('p')
                    .setAttribute('id', 'works-loading')
                    .textContent('Loading...')
            )
            request.get('/landing/poems').then((d) => {
                entry.target.removeChild(
                    document.getElementById('works-loading')
                )
                var child = document.createDocumentFragment()
                var works = d.data.map((work) =>
                    child.appendChild('p').textContent(work.title)
                )
                works.forEach((w) => entry.target.appendChild(w))
                entry.target.dataset.worksFetched = 1
            })
        }
    })
}
