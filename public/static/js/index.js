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
            entry.target.innerHTML = '<p>Loading...</p>'
            request.get('/landing/poems').then((d) => {
                var works = d.data
                    .map((work) => `<p>${work.title}</p>`)
                    .join('')
                entry.target.innerHTML = works
                entry.target.dataset.worksFetched = 1
            })
        }
    })
}
