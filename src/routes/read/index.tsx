import { Hono } from 'hono'

type Bindings = { POEMONGER_READER_SESSIONS: DurableObjectNamespace }

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    const id = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
    const stub = c.env.POEMONGER_READER_SESSIONS.get(id)

    return stub.fetch(c.req)
})

export default read
