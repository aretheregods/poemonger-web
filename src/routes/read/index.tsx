import { Hono } from 'hono'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', async (c) => {
    return await c.env.READER_SESSIONS_SERVICE(c.req)
})

export default read
