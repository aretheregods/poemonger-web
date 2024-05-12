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
        getPurchase(arg: string, arg1?: number, arg2?: boolean): Response
    }
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Response
        getCartMetadata(): Response
        itemInCart(workId: string): Response
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
    let cartValue = { data: new Map() }

    try {
        const query = `select id, title, subtitle, json_extract(prices, "$.${c.req.raw.cf?.country}") as price, cover, audio from works where id = 1;`
        const r = await c.var.READER_SESSIONS.query(c.req.raw, query)
        const cartCount = await c.var.READER_CARTS.getCartMetadata()
        response = await r.json()
        cartValue = await cartCount.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base
            title="Poemonger | Read"
            assets={[
                <link rel="stylesheet" href="/static/styles/work.css" />,
                <script
                    type="module"
                    src="/static/js/read/readList.js"
                    defer
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={cartValue.data.size}
        >
            <>
                {response.data?.map(
                    ({ id, title, subtitle, cover, audio, price }) => {
                        return (
                            <Work
                                workId={id}
                                imgId={cover}
                                price={price}
                                locale={c.req.raw.cf?.country as countries}
                                audioId={audio}
                                title={title}
                                subtitle={subtitle}
                                itemInCart={cartValue.data.get(`items.${id}`)}
                            />
                        )
                    }
                ) || ''}
            </>
        </Base>
    )
})

read.get('/:workId', async (c) => {
    const workId = c.req.param('workId')
    const chapter = c.req.query('chapter')
    let response: {
        purchase: boolean
        error: string
        poetry: Array<{
            work: { title: string; chapter: number; chapters: number }
            title: string
            author: string
            single: boolean
            sample?: Array<Array<string>>
            lines?: Array<Array<string>>
        }>
    }

    try {
        const r = await c.var.READER_SESSIONS.getPurchase(
            workId,
            chapter ? parseInt(chapter) : (chapter as undefined),
            true
        )
        response = await r.json()

        return c.html(
            <Base
                title={`Poemonger | Read - ${workId}`}
                loggedIn={!!c.var.currentSession}
                assets={[
                    <link rel="stylesheet" href="/static/styles/read.css" />,
                    <script
                        type="module"
                        src="/static/js/read/readWork.js"
                        defer
                    ></script>,
                ]}
            >
                <>
                    {response.purchase && !response.error && (
                        <WorkPurchase
                            workId={workId}
                            poetry={response.poetry}
                        />
                    )}
                    {!response.purchase && !response.error && (
                        <WorkSample workId={workId} poetry={response.poetry} />
                    )}
                    {response.error && (
                        <h2>
                            There was an error getting poems: {response.error}
                        </h2>
                    )}
                </>
            </Base>
        )
    } catch (e) {
        return c.html(
            <Base title="Poemonger | Error" loggedIn={!!c.var.currentSession}>
                <h2>There was an error getting poems: {` ${e}`}</h2>
            </Base>
        )
    }
})

export default read
