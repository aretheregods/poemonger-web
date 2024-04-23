import { Hono } from 'hono'

import Base from '../../Base.tsx'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    return await c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
})

export default read
