import { Hono } from 'hono'

type Bindings = { POEMONGER_READER_SESSIONS: DurableObjectNamespace }

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    return c.json(await c.env.POEMONGER_READER_SESSIONS.fetch(c.req.url))
})

export default read
