import { Context, Hono, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'

// routes
import { account, admin, cart, read } from './routes'

// components
import { Base } from './Base'
import Email, { Activate } from './components/emails'
import ActivatePage from './components/signup/ActivatePage'
import SignUp from './components/signup'
import Hashes from './utils/hash'
import Landing from './components/landing'
import Login from './components/login'
import Logout from './components/logout'
import Reset from './components/reset'
import Delete from './components/reset'

// utils
import { countries, locales } from './utils'

export type Bindings = {
    POEMONGER_POEMS: D1Database
    POEMONGER_READER_CARTS: DurableObjectNamespace
    POEMONGER_READER_SESSIONS: DurableObjectNamespace
    USERS_KV: KVNamespace
    USERS_SESSIONS: KVNamespace
    STORAGE_MAIN: R2Bucket
    DKIM_PRIVATE_KEY: string
}

export type Variables = {
    READER_SESSIONS: DurableObjectNamespace & {
        query(arg: Request, arg1?: string, arg2?: boolean): Promise<Response>
        reply(): Promise<Response>
    }
    READER_CARTS: DurableObjectNamespace & {
        addToCart(workId: string): Promise<Response>
        getCartMetadata(): Promise<Response>
    }
    currentSession?: {
        cookie: string
        currentSession: {
            created_at: string
            session_id: string
            cart_id: string
        }
    }
    currentSessionError?: { error: boolean; message: string }
    country: countries
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(csrf())
app.use(secureHeaders())
app.use(userCookieAuth)
app.use(requestCountry)

app.route('/account', account)
app.route('/admin', admin)
app.route('/cart', cart)
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

export async function loggedOutRedirect(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
): Promise<Response | void> {
    if (!c.var.currentSession || c.var.currentSessionError) {
        return c.redirect('/login')
    } else await next()
}

export async function readerSessions(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
) {
    const id = c.var.currentSession
        ? c.env.POEMONGER_READER_SESSIONS.idFromString(
              c.var.currentSession.currentSession.session_id
          )
        : c.env.POEMONGER_READER_SESSIONS.idFromName('LandingPage')
    const cart = c.var.currentSession
        ? c.env.POEMONGER_READER_CARTS.idFromString(
              c.var.currentSession.currentSession.cart_id
          )
        : c.env.POEMONGER_READER_CARTS.newUniqueId()
    const stub = c.env.POEMONGER_READER_SESSIONS.get(id)
    const cartStub = c.env.POEMONGER_READER_CARTS.get(cart)
    c.set('READER_SESSIONS' as never, stub as never)
    c.set('READER_CARTS' as never, cartStub as never)
    await next()
}

export async function cartSessions(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
) {
    let cartValue = { size: 0, data: [], error: '' }
    const cart = await c.var.READER_CARTS.getCartMetadata()
    cartValue = await cart.json()
    c.set('cartSessions' as never, cartValue as never)
    await next()
}

export async function requestCountry(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
) {
    const nation = (c.req.raw.cf?.country as countries) || 'US'
    const country = Object.hasOwn(locales, nation)
        ? (c.req.raw.cf?.country as countries)
        : 'US'
    c.set('country' as never, country as never)
    await next()
}

app.get('/signup', (c) => {
    if (c.var.currentSession || c.var.currentSessionError) {
        return c.redirect('/read')
    }

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
            const cart_id = c.env.POEMONGER_READER_CARTS.newUniqueId()
            const session_id = c.env.POEMONGER_READER_SESSIONS.newUniqueId()
            await c.env.USERS_KV.put(
                `user=${email}`,
                JSON.stringify({
                    email: email,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    created_at: n,
                    active: false,
                    purchases: [],
                    cart_id: cart_id.toString(),
                    session_id: session_id.toString(),
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
    if (c.var.currentSession || c.var.currentSessionError) {
        return c.redirect('/read')
    }

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
    if (c.var.currentSession || c.var.currentSessionError) {
        return c.redirect('/read')
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
        cart_id: string
        session_id: string
        purchases: Array<string>
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
                    var userData = await c.env.USERS_SESSIONS.get(
                        `session=${u.session_id}`,
                        { type: 'json' }
                    )
                    if (userData) {
                        user = userData
                    } else {
                        user = {
                            created_at: Date.now(),
                            first_name: u.first_name,
                            last_name: u.last_name,
                            email: u.email,
                            cart_id: u.cart_id,
                            session_id: u.session_id,
                            purchases: [],
                        }

                        await c.env.USERS_SESSIONS.put(
                            `session=${u.session_id}`,
                            JSON.stringify(user),
                            { expirationTtl: 86400 * 60 }
                        )
                    }

                    setCookie(c, 'poemonger_session', u.session_id, {
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
                    user = userData as {}
                    error = false
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

app.get('/logout', loggedOutRedirect, (c) =>
    c.html(
        <Base
            title="Poemonger | Logout"
            assets={[
                <script
                    type="module"
                    src="/static/js/logout/index.js"
                ></script>,
            ]}
            loggedIn={!!c.var.currentSession}
        >
            <Logout />
        </Base>
    )
)

app.post('/logout', async (c) => {
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
        return c.json({ success: true })
    } else {
        c.status(404)
        return c.json({ success: false })
    }
})

app.get('/reset', loggedOutRedirect, (c) =>
    c.html(
        <Base title="Poemonger | Reset" loggedIn={!!c.var.currentSession}>
            <Reset />
        </Base>
    )
)

app.get('/delete', loggedOutRedirect, (c) =>
    c.html(
        <Base title="Poemonger | Delete" loggedIn={!!c.var.currentSession}>
            <Delete />
        </Base>
    )
)

app.get('/audio/:audioId', async (c) => {
    if (!c.var.currentSession || c.var.currentSessionError) {
        return c.notFound()
    }

    const { audioId } = c.req.param()
    const object = await c.env.STORAGE_MAIN.get(audioId)

    if (object === null) {
        return c.notFound()
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('Content-Type', 'audio/x-m4a')

    return new Response(object.body, {
        headers,
    })
})

app.get('/', readerSessions, async (c) => {
    if (c.var.currentSession && !c.var.currentSessionError) {
        return c.redirect('/read')
    }

    const data = [
        {
            title: 'Cancel & Tear',
            subtitle: 'Love Story',
            description: [
                [
                    "Since he came back from the war, he's been disappearing. Sometimes, just a hand vanishes. Sometimes more. He tries to hide it from Julia. But he knows she'll find out sooner or later. And his love for her is too great for him to risk losing her. How can he hide his disappearing body?",
                ],
                [
                    "When you read this poem, you'll find traditional rhythmic poetry meeting free-verse poetry in one of the most original and innovative styles of any poet writing today. There's nothing else like this story out there.",
                ],
                ['Be one of the first to read a new era in poetry.'],
                [
                    "Poetry's structured beauty is ready to give a new voice to fiction.",
                ],
                [
                    "Read Warren Christopher Taylor's Cancel & Tear to join the new wave.",
                ],
            ],
            imgId: '07681682-d46b-48b2-ca89-fb8de1739600',
            videoId: 'f169164d8d5a3e08ca8ce3302cae9f90',
            audioId: '',
            price: 1999,
            workId: 1,
        },
        {
            title: 'Days Beside Ourselves',
            subtitle: 'Year One',
            description: [
                ['See how fun and friendly traditional poetry can be.'],
                [
                    'Using rhythm, rhyme and fun bite-sized love stories in sonnets, Days Beside Ourselves tells stories you can relate to.',
                ],
                [
                    'Our couple meets, falls in love, and goes through the paths of life together, getting into all sorts of fun along the way.',
                ],
                [
                    "Whether they're on vacation at the beach, having a living room picnic on a rainy day, or being followed by a black cat, they have each other. And that's really all that matters.",
                ],
                [
                    'And with the smooth, musical, traditional sonnets telling each story, all that matters to you and me is the awesome poetry.',
                ],
                [
                    'You can read the book straight through. Or you can take it one sonnet at a time.',
                ],
                [
                    'No matter what, though, meet your newest poetry best friends.',
                ],
                ['Read Days Beside Ourselves: Year One now.'],
            ],
            imgId: '11df3118-7fe3-4b53-1b64-d157924caf00',
            videoId: 'https://youtube.com/embed/8w9xnwA0pIQ',
            audioId: '',
            price: 2499,
            workId: 2,
        },
        {
            title: 'Katja4u',
            subtitle: 'A Murder Mystery Romance',
            description: [
                [
                    "Warning: I'm meant for reading hard and fast. And afterwards you'll feel all hot and wet.",
                ],
                [
                    "I'm a story in old-school poetry - a novel in traditional sonnets. Yes, with rhythm, rhyme and everything. You know those other novels are wasting your time. They're 5 times longer and take forever to read. But I'm so sexy, you'll wish we could go forever.",
                ],
                [
                    "Read my sample now. Then come right back here. I'll be waiting.",
                ],
                [
                    "But don't stop there. Just get my book and pound right through me. Then, you'll see how much better I'll make you feel. Yes, I promise.",
                ],
                [
                    "Read me now and find out just how much. You'll only need to spend a couple of hours with me to get just what you need. It'll be our little secret.",
                ],
                [
                    'And after we finish, leave a review to let everyone know how much fun we had.',
                ],
                [
                    "I'm a camgirl who sells sex online to put myself through school. Sounds exciting, right? And everything was fun and fine until something crazy started going on. My best friend might have been murdered. Is one of our fans the killer?",
                ],
                [
                    'My online sex work paid the bills until this psycho wanted to film me as he serial killed me, like I think he did my friend. Is the killer someone I know, a fan. Or is my friend even really dead? Is she just being an a**hole and pranking me?',
                ],
                [
                    'This is what happens when you sell your sexy body online. A psycho fan might get it in his mind to murder you and your other cam girl friend.',
                ],
                ['Sex work sells. But it can also get you killed'],
                [
                    'Read me now so you can find out the whole story and who wants to kill me.',
                ],
            ],
            imgId: '9af92141-923b-4eaf-181d-4f6019fc7800',
            videoId: '',
            audioId: '',
            price: 2799,
            workId: 3,
        },
    ]

    const props = {
        title: 'Poemonger | Real Poetry',
        assets: [
            <link rel="stylesheet" href="/static/styles/landing.css" />,
            <script
                src="/static/js/specRules/specRulesLogin.js"
                defer
            ></script>,
        ],
        children: (
            <Landing
                req={c.req.raw}
                r={c.var.READER_SESSIONS}
                works={data}
                locale={c.var.country}
                query={`
                    select id, title, sample_section, sample_length, lines, video, json_extract(author, "$.id") as author_id, json_extract(author, "$.name") as author
                    from poetry 
                    where json_extract(poetry.work, "$.id") = 2;
                    `}
            />
        ),
    }
    return c.html(<Base {...props} />)
})

export default app
