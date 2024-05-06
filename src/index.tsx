import { Context, Hono, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'

// routes
import { admin, read } from './routes'

// components
import { Base } from './Base'
import Email, { Activate } from './components/emails'
import ActivatePage from './components/signup/ActivatePage'
import SignUp from './components/signup'
import Hashes from './utils/hash'
import Landing from './components/landing'
import Login from './components/login'
import Logout from './components/logout'
import Nav from './components/nav'
import Reset from './components/reset'
import Delete from './components/reset'

type Bindings = {
    POEMONGER_POEMS: D1Database
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
    DKIM_PRIVATE_KEY: string
}

type Variables = {
    currentSession?: { cookie: string; currentSession: { created_at: string } }
    currentSessionError?: { error: boolean; message: string }
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(csrf())
app.use(secureHeaders())
app.use(userCookieAuth)
app.use('/read', loggedInRedirect)

app.route('/admin', admin)
app.route('/read', read)

export async function userCookieAuth(
    c: Context<{ Bindings: Bindings }>,
    next: Next
): Promise<void> {
    const hasCookie = getCookie(c, 'poemonger_session', 'secure')
    if (hasCookie) {
        try {
            const currentSession = await c.env.USERS_SESSIONS.get(
                `session=${hasCookie}`,
                { type: 'json' }
            )
            currentSession &&
                c.set('currentSession' as never, {
                    cookie: hasCookie,
                    currentSession,
                })
        } catch {
            c.set('currentSessionError' as never, {
                error: true,
                message: 'Error getting session data',
            })
        }
    }
    await next()
}

export async function loggedInRedirect(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
): Promise<Response | void> {
    if (!c.var.currentSession || c.var.currentSessionError) {
        return c.redirect('/read')
    } else await next()
}

app.get('/signup', (c) =>
    c.html(
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
)

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
            const currentSession = await c.env.USERS_SESSIONS.get(
                `session=${hasCookie}`
            )
            if (currentSession) return c.redirect('/')
        } catch {
            console.log('no session')
        }
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

    var body = await c.req.formData()
    var email = body.get('email')

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
                    var userData = {
                        created_at: Date.now(),
                        first_name: u.first_name,
                        last_name: u.last_name,
                        email: u.email,
                    }
                    error = false

                    await c.env.USERS_SESSIONS.put(
                        `session=${sessionId}`,
                        JSON.stringify(userData),
                        { expirationTtl: 86400 * 60 }
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
                    user = userData
                } catch (e) {
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

app.get('/logout', (c) =>
    c.html(
        <Base
            title="Poemonger | Logout"
            assets={[
                <script
                    type="module"
                    src="/static/js/logout/index.js"
                ></script>,
            ]}
        >
            <Logout />
        </Base>
    )
)

app.post('/logout', async (c) => {
    const hasCookie = getCookie(c, 'poemonger_session', 'secure')
    if (hasCookie) {
        try {
            await c.env.USERS_SESSIONS.delete(`session=${hasCookie}`)
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
            return c.json({ success: true })
        } catch {
            c.status(500)
            return c.json({ success: false })
        }
    } else {
        c.status(404)
        return c.json({ success: false })
    }
})

app.get('/reset', (c) =>
    c.html(
        <Base title="Poemonger | Reset">
            <Reset />
        </Base>
    )
)

app.get('/delete', (c) =>
    c.html(
        <Base title="Poemonger | Delete">
            <Delete />
        </Base>
    )
)

app.get('/', async (c) => {
    if (c.var.currentSession && !c.var.currentSessionError) {
        return c.redirect('/read')
    }

    try {
        const { results, error, success } = await c.env.POEMONGER_POEMS.prepare(
            'select id, title, sample_section, sample_length, lines from poetry where json_extract(poetry.work, "$.id") = 2;'
        ).all()

        const props = {
            title: 'Poemonger | Real Poetry',
            children: (
                <>
                    {results.map(
                        ({ title, lines, sample_length, sample_section }) => {
                            var l = JSON.parse(lines as string)
                            var ss = sample_section
                                ? l.slice(0, sample_section)
                                : l
                            return (
                                <>
                                    <h2>{title}</h2>
                                    <section class="poem-container">
                                        {ss.map((section: Array<string>) => {
                                            var sl = sample_length
                                                ? section.slice(
                                                      0,
                                                      sample_length as number
                                                  )
                                                : section
                                            return (
                                                <>
                                                    <section class="poem-container">
                                                        {sl.map((line) => {
                                                            return <p>{line}</p>
                                                        })}
                                                    </section>
                                                    <br />
                                                </>
                                            )
                                        })}
                                        <p>...</p>
                                        <h1>
                                            <a href="/signup">Read more now</a>
                                        </h1>
                                    </section>
                                </>
                            )
                        }
                    )}
                </>
            ),
        }
        return c.html(<Base {...props} />)
    } catch {
        const props = {
            title: 'Poemonger | Error',
            children: <h2>Error getting poems</h2>,
        }
        return c.html(<Base {...props} />)
    }
})

export default app
