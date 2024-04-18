import { Hono } from 'hono'
import { Base } from '../../Base'
import Login from '../../components/login'

const admin = new Hono()

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

export default admin
