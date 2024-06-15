var header = document.getElementById('poemonger-nav-header')
var hero = document.getElementById('hero-img')

const intersectionObserver = new IntersectionObserver(entries => {
    if (entries[0].intersectionRatio <= 0) header.classList.add('hero-img-gone')
    else header.classList.remove('hero-img-gone')
})

intersectionObserver.observe(hero)
