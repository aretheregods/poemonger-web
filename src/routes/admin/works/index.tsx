import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

import { adminRedirect } from '../'

const works = new Hono()
works.use(adminRedirect)

works.get('/', c =>
    c.html(
        <Base title="Poemonger | Admin - Works">
            <h2>Admin Works</h2>
        </Base>
    )
)

export default works
