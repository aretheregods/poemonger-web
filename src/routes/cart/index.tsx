import { Context, Hono } from 'hono'
import { html } from 'hono/html'

import { Base } from '../../Base'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
}

type Variables = {
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Response
        getCartCount(): Response
    }
    currentSession?: {
        cookie: string
        currentSession: { created_at: string; cart_id: string }
    }
    currentSessionError?: { error: boolean; message: string }
}

const cart = new Hono<{ Bindings: Bindings; Variables: Variables }>()

cart.use(
    async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next) => {
        const id = c.var.currentSession
            ? c.env.POEMONGER_READER_CARTS.idFromString(
                  c.var.currentSession.currentSession.cart_id
              )
            : c.env.POEMONGER_READER_CARTS.newUniqueId()
        const stub = c.env.POEMONGER_READER_CARTS.get(id)
        c.set('READER_CARTS' as never, stub as never)
        await next()
    }
)

cart.get('/', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_CARTS.addToCart('1')
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Cart">
            <h2>{response.message}</h2>
        </Base>
    )
})

cart.get('/test', async (c) => {
    let response = { message: 'There was an error:' }

    try {
        const r = await c.var.READER_CARTS.getCartCount()
        response = await r.json()
    } catch (e) {
        response.message += ` ${e}`
    }
    return c.html(
        <Base title="Poemonger | Cart - Test">
            <h2>{response.message}</h2>
        </Base>
    )
})

export default cart
