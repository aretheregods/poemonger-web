import { Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

const read = new Hono<{ Bindings: Bindings }>()

read.get('/', (c) => {
    let response = { message: 'There was an error:' }

    c.env.READER_SESSIONS_SERVICE.basicFetch(c.req.raw)
        .then((r) => r.json())
        .then((r) => (response = r))
        .catch((e) => {
            response.message += ` ${e}`
        })
    return c.html(
        <Base title="Poemonger | Read">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default read
