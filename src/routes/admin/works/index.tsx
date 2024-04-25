import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

const works = new Hono()

works.get('/', (c) =>
    c.html(
        <Base title="Poemonger | Admin - Works">
            <h2>Admin Works</h2>
        </Base>
    )
)

export default works
