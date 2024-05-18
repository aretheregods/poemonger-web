import { Hono } from 'hono'

import { Base } from '../../Base'
import { CartItem } from '../../components/cart'
import {
    cartSessions,
    loggedOutRedirect,
    readerSessions,
    requestCountry,
} from '../../'
import { countries } from '../../utils'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
}

type Variables = {
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Promise<Response>
        getCartCount(): Promise<Response>
        getCart(r: Request): Promise<Response>
        deleteFromCart(workId: string): Promise<Response>
        itemInCart(workId: string): Promise<Response>
    }
    cartSessions?: { size: number; data: Array<string> }
    currentSession?: {
        cookie: string
        currentSession: { created_at: string; cart_id: string }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
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
                    {data.data.map(({ id, title, subtitle, cover, price }) => (
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
                    ))}
                    <a href="/cart/purchase" class="button purchase-cart">
                        Checkout
                    </a>
                </section>
            </>
        </Base>
    )
})

cart.get('/purchase/:workId', c => {
    const workId = c.req.param('workId')
    return c.html(
        <Base title="Poemonger | Purchase Work">
            <h2>Buy this work {workId}</h2>
        </Base>
    )
})

cart.get('/purchase', c => {
    return c.html(
        <Base title="Poemonger | Purchase Cart">
            <h2>Buy a cart of works</h2>
        </Base>
    )
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
