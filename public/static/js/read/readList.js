import HTTP from '../utils/http/index.js'

var query = new HTTP()
var atc = document.querySelectorAll('.add-to-cart')

atc.forEach(a => {
    a.addEventListener('click', e => {
        var workId = e.target.dataset.workId
        var s = document.getElementById('shopping-cart_count')
        var b = document.getElementById(`add-to-cart_button-${workId}`)
        var i = document.getElementById(`added-icon_${workId}`)
        var a = document.getElementById(`added-add_${workId}`)
        if (e.target.dataset.added == 0)
            query.post({ path: `/cart/${workId}` }).then(added => {
                if (added.added) {
                    e.target.dataset.added = 1
                    s.textContent = parseInt(s.textContent) + 1
                    b.classList.add('added')
                    i.innerHTML = `&#10003;`
                    a.textContent = 'Added'
                }
            })
        else
            query.post({ path: `/cart/remove/${workId}` }).then(deleted => {
                if (deleted.deleted) {
                    e.target.dataset.added = 0
                    s.textContent = parseInt(s.textContent) - 1
                    b.classList.remove('added')
                    i.innerHTML = '&#65291;'
                    a.textContent = 'Add'
                }
            })
    })
})
