import { Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    let response = { message: 'There was an error' }
    try {
        const r = await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
        response = r
    } catch (e) {
        response.message += ` ${e}`
    }
    return await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
})

export default read
