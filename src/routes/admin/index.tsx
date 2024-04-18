import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../Base'
import Login from '../../components/login'

type Bindings = {
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
                    src="/static/js/login/index.js"
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

admin.post('/', async (c) => {
    const hasCookie = getCookie(c, 'poemonger_admin_session', 'secure')
    if (hasCookie) {
        try {
            const currentSession = await c.env.POEMONGER_ADMIN.get(
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
