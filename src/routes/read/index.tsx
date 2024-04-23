import { Hono } from 'hono'

type Bindings = { POEMONGER_READER_SESSIONS: DurableObjectNamespace }

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    const a = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
    const stub = c.env.POEMONGER_READER_SESSIONS.get(a)

    const r = await stub.fetch(c.req.url)

    return c.json(r)
})

export default read
