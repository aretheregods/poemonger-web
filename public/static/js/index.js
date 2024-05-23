var plw = document.getElementById('poemonger-landing-works')
var works = document.querySelector('.work-description_container')

works.forEach((work) => {
    work.addEventListener('toggle', (e) => {
        if (e.newState === 'open') {
            plw.setAttribute('style', 'pointer-events: none;')
        } else {
            plw.removeAttribute('style')
        }
    })
})
