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
            entry.target.dataset.worksFetched = 1
            var p = document.createElement('p')
            p.setAttribute('id', 'works-loading')
            p.textContent = 'Loading'
            entry.target.appendChild(p)
            request.get('/landing/poems').then((d) => {
                entry.target.removeChild(
                    document.getElementById('works-loading')
                )
                var child = document.createDocumentFragment()
                var works = d.data.forEach((work) => {
                    var workP = document.createElement('p')
                    workP.textContent = work.title
                    child.appendChild(workP)
                })
                entry.target.appendChild(child)
            })
        }
    })
}
