document.addEventListener('DOMContentLoaded', (e) =>
    fetch('/read/cartdata')
        .then((r) => r.json)
        .then((r) => console.log({ r }))
)
