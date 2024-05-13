import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'
import { cartSessions, readerSessions } from '../../'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
}

type Variables = {
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Response
        getCartCount(): Response
        getCart(): Response
        deleteFromCart(workId: string): Response
        itemInCart(workId: string): Response
    }
    cartSessions?: { size: number; data: Array<string> }
    currentSession?: {
        cookie: string
        currentSession: { created_at: string; cart_id: string }
    }
    currentSessionError?: { error: boolean; message: string }
}

const cart = new Hono<{ Bindings: Bindings; Variables: Variables }>()

cart.use(readerSessions)
cart.use(cartSessions)

cart.get('/', async (c) => {
    let response = { message: 'There was an error:' }

    return c.html(
        <Base
            title="Poemonger | Cart"
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <h2>
                {c.var.cartSessions?.size
                    ? `You have ${
                          c.var.cartSessions.size == 1
                              ? `${c.var.cartSessions.size} item`
                              : `${c.var.cartSessions.size} items`
                      } in your cart`
                    : 'You have no items in your cart'}
            </h2>
        </Base>
    )
})

cart.post('/remove/:workId', async (c) => {
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

cart.post('/:workId', async (c) => {
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
