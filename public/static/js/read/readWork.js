var n = document.getElementById('next')
var p = document.getElementById('previous')
var r = document.getElementById('page-range')

if (n) n.addEventListener('click', chapterButtons)
if (n) n.addEventListener('mouseup', chapterButtons)
if (p) p.addEventListener('click', chapterButtons)
if (p) p.addEventListener('mouseup', chapterButtons)
if (r) r.addEventListener('change', chapterRange)

window.addEventListener('pageshow', async e => {
    // if (e.viewTransition) {
        const transitionClass = determineTransitionClass(navigation.currentEntry);
		document.documentElement.dataset.transition = transitionClass;

		await e.viewTransition.finished;
		delete document.documentElement.dataset.transition;
	// } else {

	// 	// Do a reload animation
	// 	if (navigation.activation.navigationType == 'reload') {
	// 		document.documentElement.dataset.transition = "reload";
	// 		const t = document.startViewTransition(() => {
	// 			// NOOP
	// 		});
	// 		try {
	// 			await t.finished;
	// 			delete document.documentElement.dataset.transition;
	// 		} catch (e) {
	// 			console.log(e);
	// 		}
	// 		return;
	// 	}

	// 	// @TODO: manually create a “welcome” viewTransition here?
	// }
})

// Determine the View Transition class to use based on the old and new navigation entries
// Also take the navigateEvent into account to detect UA back/forward navigation
const determineTransitionClass = (newNavigationEntry) => {
	const destinationURL = new URL(newNavigationEntry.url);

	const currentPathname = destinationURL.searchParams.get('previous') || 0
	const destinationPathname = destinationURL.searchParams.get('chapter') || 0

    if (destinationURL.pathname.startsWith('/read') && (currentPathname || destinationPathname)) {
        if (currentPathname === destinationPathname) {
            return 'reload'
        } else if (parseInt(currentPathname) < parseInt(destinationPathname)) {
            return 'push'
        } else if (parseInt(currentPathname) > parseInt(destinationPathname)) {
            return 'pop'
        } else {
            console.warn('Unmatched Route Handling!')
            console.log({
                currentPathname,
                destinationPathname,
            })
            return 'none'
        }
    } else return
};

// Determine if the UA back button was used to navigate
const isUABackButton = (oldNavigationEntry, newNavigationEntry) => {
	return (newNavigationEntry.index < oldNavigationEntry.index);
};

// Determine if the UA forward button was used to navigate
const isUAForwardButton = (oldNavigationEntry, newNavigationEntry) => {
	return (newNavigationEntry.index > oldNavigationEntry.index);
};

function chapterButtons(e) {
    var c = e.target.dataset.chapter
    var p = e.target.dataset.previous
    if (e.ctrlKey || e.metaKey || e.button === 1) {
        var href = new URL(window.location.href)
        var params = href.searchParams
        params.set('chapter', c)
        params.set('previous', p)
        window.open(href.href, '_blank')
    } else {
        var u = new URLSearchParams()
        u.set('chapter', c)
        u.set("previous", p)
        window.location.search = u
    }
}

function chapterRange(e) {
    var c = e.target.value
    var p = e.target.dataset.previous
    var u = new URLSearchParams()
    u.set('chapter', c)
    u.set('previous', p)
    window.location.search = u
}
