if (
    HTMLScriptElement.supports &&
    HTMLScriptElement.supports('speculationrules')
) {
    const specScript = document.createElement('script')
    specScript.type = 'speculationrules'
    const specRules = {
        prerender: [
            {
                where: { href_matches: ['/read/*', '/read'. '/cart'] },
            },
        ],
        prefetch: [
            {
                urls: ['/cart'],
            },
        ],
    }
    specScript.textContent = JSON.stringify(specRules)
    console.log('added speculation rules to: cart')
    document.body.append(specScript)
}
