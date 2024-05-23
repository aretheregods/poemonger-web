var plw = document.getElementById('poemonger-landing-works'),
var options = {
    root: plw,
    rootMargin: '0px',
    threshold: 1,
}

var i = new IntersectionObserver(makeWorks, options)
i.observe(plw)


function makeWorks(entries, observer) {
    entries.forEach(entry => {
        console.log('entered')
    })
}
