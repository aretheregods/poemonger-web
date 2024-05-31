import { HTTP } from '../utils'

var dialog = document.getElementById('delete-account_modal')
var showButton = document.getElementById('delete-account_trigger')
var closeButton = document.getElementById('no-delete')
var deleteButton = document.getElementById('yes-delete')

showButton.addEventListener('click', e => {
    dialog.showModal()
})

closeButton.addEventListener('click', e => {
    dialog.close()
})

dialog.addEventListener('click', e => {
    if (e.target === 'dialog') dialog.close()
})

deleteButton.addEventListener('click', e => {
    var query = new HTTP()
    query.post({ path: '/account/delete' }).then(r => {
        if (!r.error && r.deleted) location.href = '/'
    })
})
