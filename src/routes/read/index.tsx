import { Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    let response = { message: 'There was an error:' }
    try {
        const r = await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
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
    const id = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
    const stub = c.env.POEMONGER_READER_SESSIONS.get(id)

    try {
        const r = await stub.reply()
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
