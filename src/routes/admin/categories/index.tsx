import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'
import { Categories } from '../../../components/admin'

const categories = new Hono()

categories.get('/', (c) =>
    c.html(
        <Base
            title="Poemonger | Admin - Categories"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/admin/poetryForm.css"
                />,
            ]}
        >
            <Categories />
        </Base>
    )
)

export default categories
