import { html } from 'hono/html';

type pageValues = {
  children?: JSX.Element,
  title: string,
  header?: JSX.Element,
  footer?: JSX.Element,
  assets?: Array<JSX.Element>,
}

export const Base = ({ children, title, header, footer, assets = [] }: pageValues) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
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
        <title>${title}</title>
        ${assets}
      </head>
      <body>
        ${header}
        <main>${children}</main>
        ${footer}
      </body>
    </html>
  `;
}