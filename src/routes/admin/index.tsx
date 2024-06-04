import { Context, Hono, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

import categories from './categories'
import poetry from './poetry'
import works from './works'

import { Base } from '../../Base'
import Login from '../../components/login'
import Logout from '../../components/logout'
import Admin from '../../components/admin'

import Hashes from '../../utils/hash'
import messages from '../../constants'

type Bindings = {
    ADMIN_SESSIONS: KVNamespace
    POEMONGER_ADMIN: KVNamespace
}

type variables = {
    currentAdminSession?: {
        cookie: string
        currentSession: { created_at: string }
    }
    currentAdminSessionError?: { error: boolean; message: string }
}

const admin = new Hono<{ Bindings: Bindings; Variables: variables }>()

admin.use(adminCookieAuth)
admin.use('/categories', adminRedirect)
admin.use('/poetry', adminRedirect)
admin.use('/works', adminRedirect)

admin.route('/categories', categories)
admin.route('/poetry', poetry)
admin.route('/works', works)

export async function adminCookieAuth(
    c: Context<{ Bindings: Bindings }>,
    next: Next
): Promise<void> {
    const hasCookie = getCookie(c, 'poemonger_admin_session', 'secure')
    if (hasCookie) {
        try {
            const currentSession = await c.env.ADMIN_SESSIONS.get(
                `session=${hasCookie}`,
                { type: 'json' }
            )
            currentSession &&
                c.set('currentAdminSession' as never, {
                    cookie: hasCookie,
                    currentSession,
                })
        } catch {
            c.set('currentAdminSessionError' as never, {
                error: true,
                message: 'Error getting session data',
            })
        }
    }
    await next()
}

export async function adminRedirect(
    c: Context<{ Bindings: Bindings; Variables: variables }>,
    next: Next
): Promise<Response | void> {
    if (!c.var.currentAdminSession || c.var.currentAdminSessionError) {
        return c.redirect('/admin')
    } else await next()
}

admin.get('/', c => {
    if (c.var.currentAdminSession && !c.var.currentAdminSessionError) {
        return c.redirect('/admin/dashboard')
    }
    return c.html(
        <Base
            title="Poemonger | Admin"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/credentialsForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/admin/index.js"
                    defer
                ></script>,
                <script
                    type="module"
                    src="/static/js/utils/pass/adminHash.js"
                    defer
                ></script>,
            ]}
        >
            <Login userType="admin" />
        </Base>
    )
})

admin.get('/dashboard', adminRedirect, c => {
    return c.html(
        <Base
            title="Poemonger | Admin Dashboard"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/admin/dashboard.css"
                />,
            ]}
        >
            <Admin />
        </Base>
    )
})

admin.post('/check-admin', async c => {
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
    var name = body.get('name')

    if (!name)
        return c.json({ error: 'No name in request', salt }, { status: 404 })
    try {
        const value = await c.env.POEMONGER_ADMIN.get<{
            salt: string
        }>(`admin=${name}`, { type: 'json' })

        if (!value) {
            error = messages.login.error
            status = 404
        } else salt = value?.salt
    } catch (e) {
        error = messages.login.error
        status = 404
    }
    return c.json({ salt, error }, { status })
})

admin.post('/', async c => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var admin = {}
    var error = true

    c.status(201)

    var message = messages.login.success
    if (!f) {
        message = messages.login.failure
        c.status(406)
    }

    var d = await c.req.formData()

    var name = d.get('name')
    var password = d.get('password')

    var a = await c.env.POEMONGER_ADMIN.get<{
        name: string
        created_at: number
        hash: string
    }>(`admin=${name}`, { type: 'json' })
    if (!a) {
        message = messages.login.error
        c.status(409)
    } else {
        try {
            const n = a.created_at
            const hash = a.hash
            const H = new Hashes()
            const h = await H.HashPasswordWithSalt(password as string, n)
            if (h === hash) {
                try {
                    const sessionId = crypto.randomUUID()
                    var adminData = {
                        created_at: n,
                        name: a.name,
                    }
                    error = false

                    await c.env.ADMIN_SESSIONS.put(
                        `session=${sessionId}`,
                        JSON.stringify(adminData),
                        { expirationTtl: 86400 }
                    )

                    setCookie(c, 'poemonger_admin_session', sessionId, {
                        path: '/',
                        prefix: 'secure',
                        secure: true,
                        httpOnly: true,
                        maxAge: 86400,
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
                        sameSite: 'Lax',
                    })
                    admin = adminData
                } catch (e) {
                    error = true
                    message = messages.login.error
                    c.status(409)
                }
            } else {
                error = true
                message = messages.login.error
                c.status(409)
            }
        } catch {
            error = true
            message = messages.login.error
            c.status(401)
        }
    }

    return c.json({ error, message, admin })
})

admin.get('/logout', adminRedirect, c => {
    return c.html(
        <Base
            title="Poemonger | Logout"
            assets={[
                <script
                    type="module"
                    src="/static/js/admin/logout.js"
                ></script>,
            ]}
        >
            <Logout />
        </Base>
    )
})

admin.post('/logout', async c => {
    if (c.var.currentAdminSession && !c.var.currentAdminSessionError) {
        try {
            await c.env.ADMIN_SESSIONS.delete(
                `session=${c.var.currentAdminSession.cookie}`
            )
            setCookie(
                c,
                'poemonger_admin_session',
                c.var.currentAdminSession.cookie,
                {
                    path: '/',
                    prefix: 'secure',
                    secure: true,
                    httpOnly: true,
                    maxAge: 86400 * -1,
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * -1),
                    sameSite: 'Lax',
                }
            )
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

export default admin
