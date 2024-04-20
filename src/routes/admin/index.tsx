import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../Base'
import Login from '../../components/login'

type Bindings = {
    ADMIN_SESSIONS: KVNamespace
    POEMONGER_ADMIN: KVNamespace
}

const admin = new Hono<{ Bindings: Bindings }>()

admin.get('/', (c) => {
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
            <>
                <h2>Admin Login</h2>
                <Login />
            </>
        </Base>
    )
})

admin.post('/check-admin', async (c) => {
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
            error =
                'There is not an account with this name or password.'
            status = 404
        } else salt = value?.salt
    } catch (e) {
        error = `This admin doesn't exist in our system - ${e}`
        status = 404
    }
    return c.json({ salt, error }, { status })
})

admin.post('/', async (c) => {
    const hasCookie = getCookie(c, 'poemonger_admin_session', 'secure')
    if (hasCookie) {
        try {
            const currentSession = await c.env.ADMIN_SESSIONS.get(
                `session=${hasCookie}`
            )
            if (currentSession) return c.redirect('/')
        } catch {
            console.log('no session')
        }
    }
    return c.json({})
})

export default admin
