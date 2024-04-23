import { Hono } from 'hono'

import { Base } from '../../Base.tsx'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    let response = { message: 'There was an error' }
    try {
        response = await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default read
