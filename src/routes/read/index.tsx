import { Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    try {
        const r = await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
        return c.html(
            <Base title="Poemonger | Read">
                <h2>{r.message}</h2>
            </Base>
        )
    } catch (e) {
        return c.html(
            <Base title="Poemonger | Read">
                <h2>There was an error</h2>
            </Base>
        )
    }
})

export default read
