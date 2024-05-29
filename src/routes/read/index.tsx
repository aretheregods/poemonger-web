import { Hono } from 'hono'

import { Base } from '../../Base'
import { WorkPurchase, WorkSample } from '../../components/read'
import { Work } from '../../components/works'
import {
    cartSessions,
    loggedOutRedirect,
    readerSessions,
    requestCountry,
} from '../../'

import { countries } from '../../utils'

type Bindings = {
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
}

type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        query(arg: Request, arg1?: string, arg2?: boolean): Promise<Response>
        purchase(): Promise<Response>
        getPurchase(
            arg: string,
            arg1?: number,
            arg2?: boolean
        ): Promise<Response>
    }
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Promise<Response>
        getCartMetadata(): Promise<Response>
    }
    cartSessions?: { size: number; data: Array<string> }
    currentSession?: {
        cookie: string
        currentSession: {
            created_at: string
            session_id: string
            purchases: {}
        }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
}

const read = new Hono<{ Bindings: Bindings; Variables: Variables }>()

read.use(requestCountry)
read.use(loggedOutRedirect)
read.use(readerSessions)
read.use(cartSessions)

read.get('/', async c => {
    let response = { message: 'There was an error:', data: [] }
    let renderData = { purchased: [], available: [] }

    try {
        const query = `select id, title, subtitle, json_extract(prices, "$.${c.var.country}") as price, cover, audio, description from works where id != 2;`
        const r = await c.var.READER_SESSIONS.query(c.req.raw, query)
        response = await r.json()
        renderData = response.data?.reduce(
            (
                data,
                { id, title, subtitle, cover, audio, price, description }
            ) => {
                const purchased = c.var.currentSession?.currentSession.purchases.hasOwnProperty(
                    `purchases.${id}`
                )
                const d = {
                    id,
                    title,
                    subtitle,
                    cover,
                    audio,
                    price,
                    description,
                } as never
                if (purchased) data.purchased.push(d)
                else data.available.push(d)
                return data
            },
            { purchased: [], available: [] }
        )
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base
            title="Poemonger | Read"
            assets={[
                <link rel="stylesheet" href="/static/styles/work.css" />,
                <link rel="prefetch" href="/read/1" />,
                <link rel="prefetch" href="/cart" />,
                <script
                    type="module"
                    src="/static/js/read/readList.js"
                    defer
                ></script>,
                <script
                    type="module"
                    src="/static/js/events/audioVideoEvents.js"
                    defer
                ></script>,
                <script
                    src="/static/js/specRules/specRulesRead.js"
                    defer
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <>
                {renderData.purchased.length ? (
                    <section id="poemonger-works_purchased">
                        <h2>Purchased</h2>
                        <section class="works-container">
                            {renderData.purchased.map(
                                ({
                                    id,
                                    title,
                                    subtitle,
                                    cover,
                                    audio,
                                    price,
                                    description,
                                }) => {
                                    return (
                                        <Work
                                            workId={id}
                                            imgId={cover}
                                            price={price}
                                            locale={c.var.country}
                                            audioId={audio}
                                            title={title}
                                            subtitle={subtitle}
                                            purchased={true}
                                            description={JSON.parse(
                                                description
                                            )}
                                        />
                                    )
                                }
                            )}
                        </section>
                    </section>
                ) : (
                    ''
                )}
                {renderData.available.length ? (
                    <section id="poemonger-works_available">
                        <h2>Available</h2>
                        <section class="works-container">
                            {renderData.available.map(
                                ({
                                    id,
                                    title,
                                    subtitle,
                                    cover,
                                    audio,
                                    price,
                                }) => {
                                    return (
                                        <Work
                                            workId={id}
                                            imgId={cover}
                                            price={price}
                                            locale={c.var.country}
                                            audioId={audio}
                                            title={title}
                                            subtitle={subtitle}
                                            workInCart={
                                                c.var.cartSessions?.data.includes(
                                                    `items.${id}` as never
                                                ) || false
                                            }
                                        />
                                    )
                                }
                            )}
                        </section>
                    </section>
                ) : (
                    ''
                )}
            </>
        </Base>
    )
})

read.get('/cartdata', c => {
    return c.json(c.var.cartSessions)
})

read.get('/:workId', async c => {
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
            audio: string
            video: string
            image: string
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
        const sampleWorkJs = !response.purchase
            ? [
                  <script
                      type="module"
                      src="/static/js/read/readList.js"
                      defer
                  ></script>,
              ]
            : []

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
                    <script
                        src="/static/js/specRules/specRulesRead.js"
                        defer
                    ></script>,
                    ...sampleWorkJs,
                ]}
                shoppingCartCount={c.var.cartSessions?.size as number}
            >
                <>
                    {response.purchase && !response.error && (
                        <WorkPurchase
                            workId={~~workId}
                            poetry={response.poetry}
                        />
                    )}
                    {!response.purchase && !response.error && (
                        <WorkSample
                            workId={workId}
                            poetry={response.poetry}
                            workInCart={
                                c.var.cartSessions?.data.includes(
                                    `items.${workId}` as never
                                ) || false
                            }
                        />
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
