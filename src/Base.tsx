import { html } from 'hono/html'

type pageValues = {
    children?: JSX.Element
    title: string
    shoppingCartCount?: number
    header?: JSX.Element
    footer?: JSX.Element
    assets?: Array<JSX.Element>
    loggedIn?: boolean
}

export const Base = ({
    children,
    title,
    header,
    footer,
    assets = [],
    loggedIn = false,
    shoppingCartCount = 0,
}: pageValues) => {
    return html`
        <!DOCTYPE html>
        <html>
            <head>
                <meta
                    content="width=device-width, initial-scale=1"
                    name="viewport"
                />
                <link
                    rel="icon"
                    href="/static/logos/logo.svg"
                    type="image/svg+xml"
                    sizes="512x512"
                />
                <link
                    rel="apple-touch-icon"
                    href="/static/logos/apple-touch-icon.png"
                />
                <link rel="manifest" href="/static/manifest.webmanifest" />
                <link href="/static/styles/index.css" rel="stylesheet" />
                <script type="importmap">
                    {
                        "imports": {
                            "argon2": "https://cdn.jsdelivr.net/npm/hash-wasm/dist/argon2.umd.min.js/+esm"
                        }
                    }
                </script>
                <title>${title}</title>
                ${assets}
            </head>
            <body>
                <header>
                    ${header ?? (
                        <nav>
                            <a href="/">
                                <img
                                    src="/static/logos/poemonger.svg"
                                    height="41"
                                    width="128"
                                    fetchpriority="high"
                                    loading="eager"
                                />
                            </a>
                            <section class="login-signup_links">
                                {loggedIn ? (
                                    <>
                                        <a
                                            id="shopping-cart_button"
                                            href="/cart"
                                        >
                                            <h2 id="shopping-cart_nav">
                                                <span id="shopping-cart_count">
                                                    {shoppingCartCount}
                                                </span>{' '}
                                                &#128722;
                                            </h2>
                                        </a>
                                        <button
                                            popovertarget="logged-in-popover_container"
                                            class="button"
                                        >
                                            Logged In
                                        </button>
                                        <section
                                            id="logged-in-popover_container"
                                            popover="auto"
                                        >
                                            <a href="/logout">Log out</a>
                                        </section>
                                    </>
                                ) : (
                                    <>
                                        <a href="/login" title="log in">
                                            Login
                                        </a>
                                        <a
                                            href="signup"
                                            title="sign up for better poetry"
                                            class="button"
                                        >
                                            Sign up
                                        </a>
                                    </>
                                )}
                            </section>
                        </nav>
                    )}
                </header>
                <main>${children}</main>
                ${footer}
            </body>
        </html>
    `
}
