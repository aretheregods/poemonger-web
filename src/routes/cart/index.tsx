import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        fetch(arg: Request): Response
        reply(): Response
    }
    currentSession?: {
        cookie: string
        currentSession: { created_at: string; session_id: string }
    }
    currentSessionError?: { error: boolean; message: string }
}

const cart = new Hono<{ Bindings: Bindings; Variables: Variables }>()

cart.use(
    async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next) => {
        const id = c.var.currentSession
            ? c.env.POEMONGER_READER_SESSIONS.idFromString(
                  c.var.currentSession.currentSession.session_id
              )
            : c.env.POEMONGER_READER_SESSIONS.newUniqueId()
        const stub = c.env.POEMONGER_READER_SESSIONS.get(id)
        c.set('READER_SESSIONS' as never, stub as never)
        await next()
    }
)

cart.get('/', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_SESSIONS.fetch(c.req.raw)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Cart">
            <h2>{response.message}</h2>
        </Base>
    )
})

cart.get('/test', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_SESSIONS.reply()
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Cart - Test">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default cart
