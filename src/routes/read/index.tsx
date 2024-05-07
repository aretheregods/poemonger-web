import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        query(arg: Request, arg1?: string, arg2?: boolean): Response
        reply(): Response
    }
    currentSession?: {
        cookie: string
        currentSession: { created_at: string; session_id: string }
    }
    currentSessionError?: { error: boolean; message: string }
}

const read = new Hono<{ Bindings: Bindings; Variables: Variables }>()

read.use(
    async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next) => {
        const id = c.var.currentSession
            ? c.env.POEMONGER_READER_SESSIONS.idFromString(
                  c.var.currentSession.currentSession.session_id
              )
            : c.env.POEMONGER_READER_SESSIONS.newUniqueId()
        const stub = c.env.POEMONGER_READER_SESSIONS.get(id)
        c.set('READER_SESSIONS' as never, stub as never)
        await next()
    }
)

read.get('/', async (c) => {
    let response = { message: 'There was an error:', data: [] }

    try {
        const r = await c.var.READER_SESSIONS.query(c.req.raw)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read">
            <>
                <h2>{response.message}</h2>
                {response.data?.map(({ title }) => <p>{title}</p>) || ''}
            </>
        </Base>
    )
})

read.get('/test', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_SESSIONS.reply()
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read - Test">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default read
