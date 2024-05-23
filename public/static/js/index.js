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
        entry.isIntersecting &&
            entry.target.dataset.worksFetched == 0 &&
            request.get('/landing/poems').then((d) => {
                console.log({ d })
                entry.target.dataset.worksFetched = 1
            })
    })
}
