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
}

const read = new Hono<{ Bindings: Bindings; Variables: Variables }>()

read.use(
    async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next) => {
        const id = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
        const stub = c.env.POEMONGER_READER_SESSIONS.get(id)
        c.set('READER_SESSIONS' as never, stub as never)
        await next()
    }
)

read.get('/', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_SESSIONS.fetch(c.req.raw)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read">
            <h2>{response.message}</h2>
        </Base>
    )
})

read.get('/test', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_SESSIONS.reply()
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read - Test">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default read
