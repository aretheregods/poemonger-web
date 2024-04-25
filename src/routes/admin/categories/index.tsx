import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

const categories = new Hono()

categories.get('/', (c) =>
    c.html(
        <Base title="Poemonger | Admin - Categories">
            <h2>Admin Categories</h2>
        </Base>
    )
)

export default categories
