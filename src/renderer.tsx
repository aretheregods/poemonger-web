import { jsxRenderer } from 'hono/jsx-renderer';
import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link rel="icon" href="/static/logos/logo.svg" type="image/svg+xml" sizes="512x512" />
        <link rel="apple-touch-icon" href="/static/logos/apple-touch-icon.png" />
        <link rel="manifest" href="/static/manifest.webmanifest"></link>
        <link href="/static/style.css" rel="stylesheet" />
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
})
