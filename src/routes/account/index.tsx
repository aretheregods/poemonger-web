import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { Base } from '../../Base'

import {
    cartSessions,
    loggedOutRedirect,
    readerSessions,
    requestCountry,
} from '../../'
import { AccountResetPassword } from '../../components/account'
import { countries, Hashes, locales } from '../../utils'

type Bindings = {
    POEMONGER_READER_CARTS: DurableObjectNamespace
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
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
        deleteAll(): Promise<Response>
    }
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Promise<Response>
        getCartMetadata(): Promise<Response>
        clearCart(): Promise<Response>
    }
    cartSessions?: { size: number; data: Array<string> }
    currentSession?: {
        cookie: string
        currentSession: {
            email: string
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
account.use(readerSessions())
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
                    <legend>Account Links</legend>
                    <ul id="account-purchases_list">
                        <li>
                            <a href="/account/purchases">Purchases</a>
                        </li>
                        <li>
                            <a href="/account/reset">Reset Password</a>
                        </li>
                        <li>
                            <a href="/account/delete">Delete Account</a>
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
        <Base
            title="Poemonger | Account - Delete"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/accountDelete.css"
                />,
                <script
                    type="module"
                    src="/static/js/account/deleteAccount.js"
                    defer
                ></script>,
            ]}
            loggedIn={true}
        >
            <>
                <h2>Delete Account</h2>
                <section>
                    <h3>
                        <em>
                            If you delete your account, you will no longer have
                            access to any poetry you have purchased.
                        </em>
                    </h3>
                    <button
                        id="delete-account_trigger"
                        class="button delete-account"
                    >
                        Delete
                    </button>
                    <dialog id="delete-account_modal">
                        <h4>Are you sure you want to delete your account</h4>
                        <section>
                            <button id="no-delete" class="button">
                                No
                            </button>
                            <button id="yes-delete" class="button">
                                Yes
                            </button>
                        </section>
                    </dialog>
                </section>
            </>
        </Base>
    )
})

account.post('/delete', async c => {
    try {
        await c.var.READER_SESSIONS.deleteAll()
        await c.var.READER_CARTS.clearCart()
        await c.env.USERS_KV.delete(
            `user=${c.var.currentSession?.currentSession.email}`
        )
        await c.env.USERS_SESSIONS.delete(
            `session=${c.var.currentSession?.currentSession.session_id}`
        )
        const hasCookie = getCookie(c, 'poemonger_session', 'secure')
        if (hasCookie) {
            setCookie(c, 'poemonger_session', hasCookie, {
                path: '/',
                prefix: 'secure',
                secure: true,
                httpOnly: true,
                maxAge: 86400 * -1,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * -1),
                sameSite: 'Lax',
            })
            c.status(200)
            return c.json({ error: false, deleted: true })
        } else {
            c.status(404)
            return c.json({
                error: true,
                deleted: false,
                message: 'You were not logged in',
            })
        }
    } catch {
        return c.json({ error: true, deleted: false })
    }
})

account.get('/reset', c => {
    return c.html(
        <Base
            title="Poemonger | Account - Reset Password"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/credentialsForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/account/accountResetPassword.js"
                    defer
                ></script>,
            ]}
            loggedIn={true}
        >
            <AccountResetPassword />
        </Base>
    )
})

account.post('/reset/salt', async c => {
    var salt
    var error
    var status = 201

    try {
        const user = await c.env.USERS_KV.get<{
            password: string
            salt: string
        }>(`user=${c.var.currentSession?.currentSession.email}`, {
            type: 'json',
        })

        salt = user?.salt
    } catch (e) {
        error = `There was an error - ${e}`
        status = 404
    }

    return c.json({ salt, error }, { status })
})

account.post('/reset/password', async c => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var user = {}
    var error = true
    var messages = {
        success: `Successfully processed your login request.`,
        failure: `Could not process your request. You did something weird.`,
        error: 'There was a problem saving your information. Please try again.',
        exists: 'There is not an account with this email address or password.',
    }

    c.status(201)

    var message = messages.success
    if (!f) {
        message = messages.failure
        c.status(406)
    }

    var d = await c.req.formData()

    var oldPassword = d.get('old_password')
    var newPassword = d.get('password')
    var confirmNewPassword = d.get('confirm_password')

    var u = await c.env.USERS_KV.get<{
        resetToken: number
        email: string
        created_at: number
        password: string
    }>(`user=${c.var.currentSession?.currentSession.email}`, { type: 'json' })
    if (!u || newPassword !== confirmNewPassword) {
        message = messages.exists
        c.status(409)
    } else {
        if (oldPassword === u.password) {
            try {
                const n = u.created_at
                const H = new Hashes()
                const hash = await H.HashPasswordWithSalt(
                    newPassword as string,
                    n
                )
                await c.env.USERS_KV.put(
                    `user=${u.email}`,
                    JSON.stringify({ ...u, hash, password: newPassword })
                )
                const hasCookie = getCookie(c, 'poemonger_session', 'secure')
                if (hasCookie) {
                    setCookie(c, 'poemonger_session', hasCookie, {
                        path: '/',
                        prefix: 'secure',
                        secure: true,
                        httpOnly: true,
                        maxAge: 86400 * -1,
                        expires: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * -1
                        ),
                        sameSite: 'Lax',
                    })
                    c.status(200)
                    return c.json({ error: false, message: '' })
                } else {
                    c.status(404)
                    return c.json({
                        error: true,
                        message: 'You were not logged in',
                    })
                }
            } catch (error) {
                c.status(400)
                return c.json({ error: true, message: error })
            }
        } else {
            message = messages.error
            c.status(409)
        }
    }

    return c.json({ error, message, user })
})

export default account
