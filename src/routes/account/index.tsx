import { Hono } from 'hono'
import { Base } from '../../Base'

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
            purchases: Array<string>
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
    return c.html(
        <Base
            title="Poemonger | Account"
            loggedIn={!!c.var.currentSession}
            shoppingCartCount={c.var.cartSessions?.size as number}
        >
            <h2>This is your account</h2>
        </Base>
    )
})

export default account
