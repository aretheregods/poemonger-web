import { Hono } from 'hono'
import { Base } from '../../Base'

import {
    cartSessions,
    loggedOutRedirect,
    readerSessions,
    requestCountry,
} from '../../'
import { countries, locales } from '../../utils'

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
            first_name: string
            last_name: string
            created_at: string
            session_id: string
            purchases: { string: { amount: string } }
        }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
}

const account = new Hono<{ Bindings: Bindings; Variables: Variables }>()

account.use(requestCountry)
account.use(loggedOutRedirect)
account.use(readerSessions)
account.use(cartSessions)

account.get('/', c => {
    const { first_name, last_name, created_at, purchases } = c.var
        .currentSession?.currentSession || {
        first_name: '',
        last_name: '',
        created_at: '',
        purchases: {},
    }
    const userLocale = locales.hasOwnProperty(c.var.country)
        ? c.var.country
        : 'US'

    return c.html(
        <Base
            title="Poemonger | Account"
            assets={[
                <link rel="stylesheet" href="/static/styles/account.css" />,
            ]}
            loggedIn={true}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <>
                <h2>
                    This is your account, {first_name} {last_name}
                </h2>
                <p>
                    You've been with poemonger since{' '}
                    {new Date(created_at).toLocaleDateString(
                        locales[userLocale].locale
                    )}
                </p>
                <figure>
                    <legend>Purchase Receipts</legend>
                    <ul id="account-purchases_list">
                        <li>
                            <a href="/account/purchases">Purchases</a>
                        </li>
                        <li>
                            <a href="/account/reset">Purchases</a>
                        </li>
                        <li>
                            <a href="/account/delete">Purchases</a>
                        </li>
                    </ul>
                </figure>
            </>
        </Base>
    )
})

account.get('/purchases', c => {
    return c.html(
        <Base title="Poemonger | Account - Purchases" loggedIn={true}>
            <h2>Account Purchases</h2>
        </Base>
    )
})

account.get('/delete', c => {
    return c.html(
        <Base title="Poemonger | Account - Delete" loggedIn={true}>
            <h2>Account Delete</h2>
        </Base>
    )
})

account.get('/reset', c => {
    return c.html(
        <Base title="Poemonger | Account - Reset Password" loggedIn={true}>
            <h2>Account Reset Password</h2>
        </Base>
    )
})

export default account
