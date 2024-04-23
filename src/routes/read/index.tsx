import { Hono } from 'hono'

import Base from '../../Base.tsx'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    const id = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
    const stub = c.env.POEMONGER_READER_SESSIONS.get(id)

    const r = await stub.fetch(c.req.raw)

    return r
})

export default read
