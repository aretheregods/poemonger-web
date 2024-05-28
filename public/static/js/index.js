var plw = document.getElementById('poemonger-landing-works')
var works = document.querySelectorAll('.work-description_container')
var w = document.querySelectorAll('.work-container')

works.forEach(work => {
    work.addEventListener('toggle', e => {
        if (e.newState === 'open') {
            plw.setAttribute('style', 'pointer-events: none;')
            w.forEach(container =>
                container.setAttribute('style', 'pointer-events: none;')
            )
        } else {
            plw.removeAttribute('style')
            w.forEach(container => container.removeAttribute('style'))
        }
    })
})
