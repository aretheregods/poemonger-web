import { jsxRenderer } from 'hono/jsx-renderer';
import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
})
