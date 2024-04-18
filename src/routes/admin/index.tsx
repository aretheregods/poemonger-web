import { Hono } from 'hono'
import { Base } from '../../Base'

const admin = new Hono()

admin.get('/', (c) => {
    return c.html(
        <Base title="Poemonger | Admin">
            <h2>Hello Admin</h2>
        </Base>
    )
})

export default admin
