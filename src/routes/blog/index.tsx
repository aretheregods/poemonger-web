import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { createMiddleware } from 'hono/factory'
import { secureHeaders } from 'hono/secure-headers'

import { Base } from '../../Base'
import Footer from '../../components/landing/footer'
import Email, { Sale } from '../../components/emails'
import { requestCountry, userCookieAuth } from '../../'
import { countries, locales } from '../../utils'

export type Bindings = {
    POEMONGER_POEMS: D1Database
    POEMONGER_BLOG: D1Database
    POEMONGER_READER_CARTS: DurableObjectNamespace
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
    CURRENCY_CONVERTER: KVNamespace
    STORAGE_MAIN: R2Bucket
    DKIM_PRIVATE_KEY: string
    HELCIM_API_KEY: string
}

export type Variables = {
    currentSession?: {
        cookie: string
        currentSession: {
            email: string
            created_at: string
            session_id: string
            cart_id: string
        }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
    conversionRate: number
}

const blog = new Hono<{ Bindings: Bindings; Variables: Variables }>()

blog.use(csrf())
blog.use(secureHeaders())
blog.use(userCookieAuth)
blog.use(requestCountry)

blog.get('/', async c => {
    return c.html(
        <Base
            title="Poemonger | Blog"
            assets={[<link rel="stylesheet" href="/static/styles/blog.css" />]}
            loggedIn={!!c.var.currentSession}
            footer={<Footer />}
        >
            <h2>Blog</h2>
        </Base>
    )
})

export default blog
