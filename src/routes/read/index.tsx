import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'
import { Poem } from '../../components/poetry'
import { readerSessions } from '../../'

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
        const query =
            'select id, title, sample_section, sample_length, lines, video, json_extract(author, "$.id") as author_id, json_extract(author, "$.name") as author from poetry where json_extract(poetry.work, "$.id") = 2;'
        const r = await c.var.READER_SESSIONS.query(c.req.raw, query)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Read">
            <>
                <h2>{response.message}</h2>
                {response.data?.map(
                    ({
                        title,
                        author,
                        lines,
                        video,
                        sample_length,
                        sample_section,
                    }) => (
                        <section class="poem-section-container">
                            <Poem
                                {...{
                                    title,
                                    author,
                                    lines,
                                    sample_length,
                                    sample_section,
                                }}
                            />
                        </section>
                    )
                ) || ''}
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
