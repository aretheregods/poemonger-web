import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'
import { Poem } from '../../components/poetry'
import { Work } from '../../components/works'
import { readerSessions } from '../../'

import { countries } from '../../utils'

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

read.use(readerSessions)

read.get('/', async (c) => {
    let response = { message: 'There was an error:', data: [] }

    try {
        const query = `select id, title, subtitle, json_extract(prices, "$.${c.req.raw.cf?.country}") as price, cover from works where id = 1;`
        const r = await c.var.READER_SESSIONS.query(c.req.raw, query)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base
            title="Poemonger | Read"
            assets={[<link rel="stylesheet" href="/static/styles/work.css" />]}
        >
            <>
                <h2>{response.message}</h2>
                {response.data?.map(({ id, title, subtitle, cover, price }) => (
                    <Work
                        imgId={cover}
                        price={price}
                        locale={c.req.raw.cf?.country as countries}
                    />
                )) || ''}
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
