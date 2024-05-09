import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'
import { WorkPurchase, WorkSample } from '../../components/read'
import { Work } from '../../components/works'
import { readerSessions } from '../../'

import { countries } from '../../utils'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        query(arg: Request, arg1?: string, arg2?: boolean): Response
        purchase(): Response
        getPurchase(arg: string): Response
    }
    currentSession?: {
        cookie: string
        currentSession: {
            created_at: string
            session_id: string
            purchases: Array<string>
        }
    }
    currentSessionError?: { error: boolean; message: string }
}

const read = new Hono<{ Bindings: Bindings; Variables: Variables }>()

read.use(readerSessions)

read.get('/', async (c) => {
    let response = { message: 'There was an error:', data: [] }

    try {
        const query = `select id, title, subtitle, json_extract(prices, "$.${c.req.raw.cf?.country}") as price, cover, audio from works where id = 1;`
        const r = await c.var.READER_SESSIONS.query(c.req.raw, query)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base
            title="Poemonger | Read"
            assets={[<link rel="stylesheet" href="/static/styles/work.css" />]}
            loggedIn={!!c.var.currentSession}
        >
            <>
                <h2>{response.message}</h2>
                {response.data?.map(
                    ({ id, title, subtitle, cover, audio, price }) => (
                        <Work
                            workId={id}
                            imgId={cover}
                            price={price}
                            locale={c.req.raw.cf?.country as countries}
                            audioId={audio}
                            title={title}
                            subtitle={subtitle}
                        />
                    )
                ) || ''}
            </>
        </Base>
    )
})

read.get('/:workId', async (c) => {
    const workId = c.req.param('workId')
    let response = { purchase: '', error: '', poetry: [['']] }

    try {
        const r = await c.var.READER_SESSIONS.getPurchase(workId)
        response = await r.json()
    } catch (e) {
        response.error += ` ${e}`
        return c.html(
            <Base title="Poemonger | Error" loggedIn={!!c.var.currentSession}>
                <h2>There was an error getting poems: {response.error}</h2>
            </Base>
        )
    }

    return c.html(
        <Base title="Poemonger | Read - Test" loggedIn={!!c.var.currentSession}>
            <>
                {response.purchase && !response.error && (
                    <WorkPurchase workId={workId} poetry={response.poetry} />
                )}
                {!response.purchase && !response.error && (
                    <WorkSample workId={workId} poetry={response.poetry} />
                )}
                {response.error && (
                    <h2>There was an error getting poems: {response.error}</h2>
                )}
            </>
        </Base>
    )
})

export default read
