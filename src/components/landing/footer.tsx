export default function Footer() {
    return (
        <footer>
            <img
                src="/static/logos/logo_small-512.png"
                alt="Poemonger Logo"
                loading="lazy"
                fetchpriority="low"
                height="64"
                width="64"
            />
            <section id="landing-page_footer">
                <a href="/about">
                    <p>About</p>
                </a>
                <a href="/contact">
                    <p>Contact</p> Us
                </a>
            </section>
        </footer>
    )
}
