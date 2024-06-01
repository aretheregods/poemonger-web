import { Hono } from 'hono'

import { Base } from '../../Base'
import { CartItem } from '../../components/cart'
import {
    cartSessions,
    loggedOutRedirect,
    readerSessions,
    requestCountry,
} from '../../'
import { countries, locales } from '../../utils'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
    HELCIM_API_KEY: string
}

type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        purchase(works: Array<string>): Promise<Response>
    }
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Promise<Response>
        clearCart(): Promise<Response>
        getCartCount(): Promise<Response>
        getCart(r: Request): Promise<Response>
        deleteFromCart(workId: string): Promise<Response>
        itemInCart(workId: string): Promise<Response>
        purchaseCart(
            works: Array<string>,
            session_id: string | undefined
        ): Promise<Response>
    }
    cartSessions?: { size: number; data: Array<string> }
    currentSession?: {
        cookie: string
        currentSession: {
            created_at: string
            cart_id: string
            email: string
            session_id: string
        }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
    conversionRate: number
}

const cart = new Hono<{ Bindings: Bindings; Variables: Variables }>()

cart.use(requestCountry)
cart.use(loggedOutRedirect)
cart.use(readerSessions)
cart.use(cartSessions)

cart.get('/', async c => {
    const r = await c.var.READER_CARTS.getCart(c.req.raw)
    const data: {
        data: Array<{
            id: number
            title: string
            subtitle: string
            cover: string
            price: number
        }>
    } = await r.json()
    const price = data.data.reduce((amt, { price }) => (amt += price), 0)
    var i = locales[c.var.country]
    var fp = new Intl.NumberFormat(i.locale, {
        style: 'currency',
        currency: i.currency,
        currencyDisplay: 'narrowSymbol',
    }).format(price)
    var convertedPrice = ''
    if (c.var.country !== 'US') {
        convertedPrice = new Intl.NumberFormat(locales.US.locale, {
            style: 'currency',
            currency: locales.US.currency,
            currencyDisplay: 'symbol',
        }).format(price * c.var.conversionRate)
    }

    return c.html(
        <Base
            title="Poemonger | Cart"
            assets={[
                <link rel="stylesheet" href="/static/styles/price.css" />,
                <script
                    type="module"
                    src="/static/js/cart/cartList.js"
                    defer
                ></script>,
                <script
                    type="text/javascript"
                    src="https://secure.helcim.app/helcim-pay/services/start.js"
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <>
                <h2>
                    {c.var.cartSessions?.size
                        ? `You have ${
                              c.var.cartSessions.size == 1
                                  ? `${c.var.cartSessions.size} item`
                                  : `${c.var.cartSessions.size} items`
                          } in your cart`
                        : 'You have no items in your cart'}
                </h2>
                <section id="cart-main_container">
                    <section id="cart-item_list">
                        {data.data.map(
                            ({ id, title, subtitle, cover, price }) => (
                                <CartItem
                                    {...{
                                        id,
                                        title,
                                        subtitle,
                                        cover,
                                        price,
                                        locale: c.var.country,
                                    }}
                                />
                            )
                        )}
                    </section>
                    {c.var.cartSessions?.size ? (
                        <section id="price-checkout_container">
                            <fieldset>
                                <legend>Total</legend>
                                <h3>{ convertedPrice ? '~' : ''}{fp}</h3>
                                {convertedPrice ? <h4>Charge in USD: {convertedPrice}</h4> : ''}
                            </fieldset>
                            <button
                                id="purchase-cart_button"
                                data-href="/cart/purchase/init"
                                data-price={convertedPrice ? price * c.var.conversionRate : price}
                                data-conversion-rate={c.var.conversionRate}
                                data-country={c.var.country}
                                data-works={data.data.map(({ id }) => id)}
                                class="button purchase-cart"

                            >
                                Checkout
                            </button>
                        </section>
                    ) : (
                        ''
                    )}
                </section>
            </>
        </Base>
    )
})

cart.get('/purchase/:workId', c => {
    const workId = c.req.param('workId')
    return c.html(
        <Base
            title="Poemonger | Purchase Work"
            assets={[
                <script
                    type="text/javascript"
                    src="https://secure.helcim.app/helcim-pay/services/start.js"
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <h2>Buy this work {workId}</h2>
        </Base>
    )
})

cart.get('/purchase', c => {
    return c.html(
        <Base
            title="Poemonger | Purchase Cart"
            assets={[
                <script
                    type="text/javascript"
                    src="https://secure.helcim.app/helcim-pay/services/start.js"
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <h2>Buy a cart of works</h2>
        </Base>
    )
})

cart.post('/purchase/init', async c => {
    try {
        const b = await c.req.json()
        const o = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'api-token': c.env.HELCIM_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify(b),
        }
        const d = await fetch(
            'https://api.helcim.com/v2/helcim-pay/initialize',
            o
        )
        const r = await d.json()
        return c.json(r || {})
    } catch (error) {
        return c.json({ currentToken: '', secretToken: '', error })
    }
})

cart.post('/purchase/complete', async c => {
    const session_id = c.var.currentSession?.currentSession.session_id
    try {
        const works: {
            works: Array<string>
            invoice: { data: { dateCreated: string } }
        } = await c.req.json()
        const response = await c.var.READER_SESSIONS.purchase(works.works)
        const purchased: {
            error: boolean
            errorMessage: string
            purchased: boolean
        } = await response.json()
        if (!purchased.error && purchased.purchased)
            try {
                const responded = await c.var.READER_CARTS.clearCart()
                const deleted: { message: string } = await responded.json()
                if (deleted.message) {
                    const email = c.var.currentSession?.currentSession.email
                    const user: {
                        purchases: {}
                    } | null = await c.env.USERS_KV.get(`user=${email}`, {
                        type: 'json',
                    })
                    const session: {} | null = await c.env.USERS_SESSIONS.get(
                        `session=${session_id}`,
                        {
                            type: 'json',
                        }
                    )
                    await Promise.all([
                        c.env.USERS_KV.put(
                            `user=${email}`,
                            JSON.stringify({
                                ...user,
                                purchases: {
                                    ...user?.purchases,
                                    ...works.works.reduce(
                                        (worksObject, work) => {
                                            return {
                                                ...worksObject,
                                                [`purchases.${work}`]: works
                                                    .invoice.data,
                                            }
                                        },
                                        {}
                                    ),
                                },
                            })
                        ),
                        c.env.USERS_SESSIONS.put(
                            `session=${session_id}`,
                            JSON.stringify({
                                ...session,
                                purchases: {
                                    ...user?.purchases,
                                    ...works.works.reduce(
                                        (worksObject, work) => {
                                            return {
                                                ...worksObject,
                                                [`purchases.${work}`]: works
                                                    .invoice.data,
                                            }
                                        },
                                        {}
                                    ),
                                },
                            })
                        ),
                    ])
                    return c.json({ purchased: true, error: '' })
                }
            } catch (error) {
                return c.json({ error })
            }
    } catch (error) {
        return c.json({ purchased: false, error })
    }
})

cart.post('/remove/:workId', async c => {
    const workId = c.req.param('workId')
    let response = { count: 0, error: '' }
    try {
        const r = await c.var.READER_CARTS.deleteFromCart(workId)
        response = await r.json()
    } catch (e) {
        response.error += e
    }
    return c.json(response)
})

cart.post('/:workId', async c => {
    const workId = c.req.param('workId')
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_CARTS.addToCart(workId)
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.json(response)
})

export default cart
