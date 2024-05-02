import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

const poetry = new Hono()

poetry.get('/', (c) =>
    c.html(
        <Base title="Poemonger | Admin - Poetry">
            <h2>Admin Poetry</h2>
        </Base>
    )
)

poetry.get('/new', (c) => {})

export default poetry
