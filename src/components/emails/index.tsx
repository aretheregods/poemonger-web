import { html } from "hono/html";

export default function Email({ children }: { children?: JSX.Element }) {
    return html`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
            />
        </head>

        <body>
            <main>${children}</main>
        </body>
    </html>`;
}

export { default as Activate } from './Activate';
