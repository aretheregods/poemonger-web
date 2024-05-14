import { Context, Hono } from 'hono'

import { Base } from '../../Base'
import { Price } from '../../components/works'
import { cartSessions, readerSessions } from '../../'
import { countries, getImg } from '../../utils'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
}

type Variables = {
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Response
        getCartCount(): Response
        getCart(r: Request): Response
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
                {data.data.map(({ id, title, subtitle, cover, price }) => (
                    <section>
                        <a href={`/read/${id}`}>
                            <img
                                src={getImg(cover, 'verySmall')}
                                alt="A book cover"
                                class="book-cover"
                                loading="lazy"
                                decoding="async"
                                srcset={`${getImg(
                                    cover,
                                    'verySmall'
                                )} 128w,${getImg(cover, 'tiny')} 64w`}
                                sizes="(max-width: 128px) 33vw,(max-width: 64px) 20vw"
                            />
                        </a>
                        <Price
                            {...{
                                id,
                                title,
                                subtitle,
                                price,
                                locale: c.req.raw.cf?.country as countries,
                            }}
                        />
                    </section>
                ))}
            </>
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
