var dialog = document.getElementById('delete-account_modal')
var showButton = document.getElementById('delete-account_trigger')
var closeButton = document.getElementById('no-delete')

showButton.addEventListener('click', e => {
    dialog.showModal()
})

closeButton.addEventListener('click', e => {
    dialog.close()
})

dialog.addEventListener('click', e => {
    if (e.target === 'dialog') dialog.close()
})
