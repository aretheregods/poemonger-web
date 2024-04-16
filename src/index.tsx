import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'

import { Base } from './Base'
import Email, { Activate } from './components/emails'
import ActivatePage from './components/signup/ActivatePage'
import SignUp from './components/signup'
import Hashes from './utils/hash'
import Login from './components/login'
import Logout from './components/logout'
import Reset from './components/reset'
import Delete from './components/reset'

type Bindings = {
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
    DKIM_PRIVATE_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(csrf())
app.use(secureHeaders())

app.get('/signup', (c) => {
    return c.html(
        <Base
            title="Poemonger | Sign Up"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/credentialsForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/signup/index.js"
                    defer
                ></script>,
            ]}
        >
            <SignUp />
        </Base>
    )
})

app.post('/signup', async (c) => {
    var n = Date.now()
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var messages = {
        success: `Successfully processed your.`,
        failure: `Could not process your request. Please send a form.`,
        error: 'There was a problem saving your information. Please try again.',
        exists: 'There is already an account with this email address.',
    }

    c.status(201)

    var message = messages.success
    if (!f) {
        message = messages.failure
        c.status(406)
    }

    var d = await c.req.formData()

    var email = d.get('email')
    var password = d.get('password')
    var first_name = d.get('first_name')
    var last_name = d.get('last_name')
    var salt = d.get('salt')

    var l = await c.env.USERS_KV.list({ prefix: `user=${email}` })
    if (l.keys.length) {
        message = `${messages.exists} ${JSON.stringify(l)}`
        c.status(409)
    } else {
        try {
            const H = new Hashes()
            const token = await H.Hash256(email as string)
            const hash = await H.HashPasswordWithSalt(password as string, n)
            await c.env.USERS_KV.put(
                `user=${email}`,
                JSON.stringify({
                    email: email,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    created_at: n,
                    active: false,
                    hash,
                    token,
                    salt,
                })
            )

            const req = new Request('https://api.mailchannels.net/tx/v1/send', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [
                                {
                                    name: `${first_name} ${last_name}`,
                                    email: email,
                                },
                            ],
                            dkim_domain: 'poemonger.com',
                            dkim_selector: 'mailchannels',
                            dkim_private_key: c.env.DKIM_PRIVATE_KEY,
                        },
                    ],
                    from: {
                        name: 'Poemonger | Welcome',
                        email: 'welcome@poemonger.com',
                    },
                    subject:
                        'Poetry is waiting. Finish activating your account.',
                    content: [
                        {
                            type: 'text/html',
                            value: Email({
                                children: Activate({
                                    email,
                                    token,
                                    url: c.req.url,
                                }),
                            }),
                        },
                    ],
                }),
            })
            const res = await fetch(req)
            var m = {}
            if (res.status === 202 || /accepted/i.test(res.statusText)) {
                m = { success: true }
            } else {
                try {
                    const { errors } = (await res.clone().json()) as {
                        errors: Array<object>
                    }
                    m = { success: false, errors }
                } catch {
                    m = { success: false, errors: [res.statusText] }
                }
            }

            return c.json(m)
        } catch (e) {
            message = `${messages.error} ${e}`
            c.status(500)
        }
    }

    return c.json({ message })
})

app.get('/activate', async (c) => {
    const e = c.req.query('user')
    const t = c.req.query('token')
    var error = false
    if (!e || !t) error = true
    else {
        try {
            const value = await c.env.USERS_KV.get<{
                token: string
            }>(`user=${e}`, { type: 'json' })

            if (!value || value?.token != t) error = true
            else {
                try {
                    await c.env.USERS_KV.put(
                        `user=${e}`,
                        JSON.stringify({ ...value, active: true })
                    )
                    error = false
                } catch (err) {
                    error = true
                }
            }
        } catch {
            error = true
        }
    }

    return c.html(
        <Base title="Poemonger | Activate">
            <ActivatePage error={error} />
        </Base>
    )
})

app.get('/login', async (c) => {
    const hasCookie = getCookie(c, 'poemonger_session', 'secure')
    if (hasCookie) {
        try {
            const currentSession = await c.env.USERS_SESSIONS.get(`session=${hasCookie}`)
            if (currentSession) return c.redirect('/')
        } catch { console.log('no session') }
    }

    return c.html(
        <Base
            title="Poemonger | Login"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/credentialsForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/login/index.js"
                    defer
                ></script>,
            ]}
        >
            <Login />
        </Base>
    )
})

app.post('/login/check-email', async (c) => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var salt
    var error
    var status = 201

    if (!f) {
        error = 'Error'
        c.status(406)
        return c.json({ error, salt })
    }

    var body = await c.req.formData();
    var email = body.get("email");

    if (!email)
        return c.json({ error: 'No email in request', salt }, { status: 404 })
    try {
        const value = await c.env.USERS_KV.get<{
            active: boolean
            salt: string
        }>(`user=${email}`, { type: 'json' })

        if (!value) {
            error =
                'There is not an account with this email address or password.'
            status = 404
        } else if (value?.active) salt = value?.salt
        else {
            error = 'Activate your account first. Click our link in your email'
            status = 404
        }
    } catch (e) {
        error = `This email doesn't exist in our system - ${e}`
        status = 404
    }
    return c.json({ salt, error }, { status })
})

app.post('/login', async (c) => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var user = {}
    var error = true
    var messages = {
        success: `Successfully processed your login request.`,
        failure: `Could not process your request. Please send a form.`,
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

    var email = d.get('email')
    var password = d.get('password')

    var u = await c.env.USERS_KV.get<{
        first_name: string
        last_name: string
        email: string
        created_at: number
        hash: string
    }>(`user=${email}`, { type: 'json' })
    if (!u) {
        message = messages.exists
        c.status(409)
    } else {
        try {
            const n = u.created_at
            const hash = u.hash
            const H = new Hashes()
            const h = await H.HashPasswordWithSalt(password as string, n)
            if (h === hash) {
                try {
                    const sessionId = crypto.randomUUID()
                    const currentSession = await c.env.USERS_SESSIONS.get<{ session_id: string }>(`user=${email}`, { type: 'json' })
                    var userData = {
                        created_at: Date.now(),
                        first_name: u.first_name,
                        last_name: u.last_name,
                        email: u.email,
                    }
                    if (currentSession) {
                        currentSession.session_id = sessionId;
                        userData = currentSession;
                    }
                    error = false
                        
                    await c.env.USERS_SESSIONS.put(
                        `session=${sessionId}`,
                        JSON.stringify(userData)
                    )

                    setCookie(c, 'poemonger_session', sessionId, {
                        path: '/',
                        prefix: 'secure',
                        secure: true,
                        httpOnly: true,
                        maxAge: 86400 * 60,
                        expires: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * 60
                        ),
                        sameSite: 'Lax',
                    })
                    setCookie(c, 'user_email', email, {
                        path: '/',
                        prefix: 'secure',
                        secure: true,
                        httpOnly: true,
                        maxAge: 86400 * 366,
                        expires: new Date(
                            Date.now() + 1000 * 60 * 60 * 24 * 366
                        ),
                        sameSite: 'Lax',
                    })
                    user = userData;
                    delete user.session_id;
                } catch(e) {
                    error = true
                    message = `${messages.error} ${e}`
                    c.status(409)
                }
            }
        } catch {
            message = messages.exists
            c.status(401)
        }
    }

    return c.json({ error, message, user })
})

app.get('/logout', (c) => {
    return c.html(
        <Base 
            title="Poemonger | Logout"
            assets={[<script type="module" src="/static/js/logout/index.js"></script>]}
        >
            <Logout />
        </Base>
    )
})

app.post('/logout', async (c) => {
    const hasCookie = getCookie(c, 'poemonger_session', 'secure')
    if(hasCookie) {
        try {
            await c.env.USERS_SESSIONS.delete(hasCookie)
            c.status(204)
            return c.json({ success: true, cookie: '' })
        } catch {
            c.status(500)
            return c.json({ success: false, cookie: hasCookie })
        }
    } else {
        c.status(404)
        return c.json({ success: false, cookie: hasCookie })
    }
})

app.get('/reset', (c) => {
    return c.html(
        <Base title="Poemonger | Reset">
            <Reset />
        </Base>
    )
})

app.get('/delete', (c) => {
    return c.html(
        <Base title="Poemonger | Delete">
            <Delete />
        </Base>
    )
})

app.get('/admin', (c) => {
    const props = {
        title: 'Poemonger | Admin',
        children: <h1>Hello, Poemonger Admin</h1>,
    }
    return c.html(<Base {...props} />)
})

app.get('/', (c) => {
    const props = {
        title: 'Poemonger',
        children: <h1>Hello, Poemonger</h1>,
    }
    return c.html(<Base {...props} />)
})

export default app
