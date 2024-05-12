document.addEventListener('DOMContentLoaded', (e) =>
    fetch('/cart/metadata')
        .then((r) => r.json)
        .then((r) => console.log({ r }))
)
