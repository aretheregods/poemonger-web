import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'
import { Categories } from '../../../components/admin'

type Bindings = {
    POEMONGER_POEMS: KVNamespace
}

const categories = new Hono<{ Bindings: Bindings }>()

categories.get('/', async (c) => {
    try {
        const categoriesList = await c.env.POEMONGER_POEMS.list()
        c.html(
            <Base title="Poemonger | Categories - List">
                <>
                    <h2>Categories List</h2>
                </>
            </Base>
        )
    } catch {
        return c.html(
            <Base title="Poemonger | Categories - Error">
                <h2>Error getting categories list</h2>
            </Base>
        )
    }
})

categories.get('/new', (c) =>
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

categories.post('/new', async (c) => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var error
    var status = 201

    if (!f) {
        error = 'Error'
        c.status(406)
        return c.json({ error })
    }

    var body = await c.req.formData()
    var name = body.get('name')
    var description = body.get('description')

    if (!name || !description)
        return c.json({ error: 'No name or description in request' }, { status: 404 })

    try {
        const currentCategory = await c.env.POEMONGER_POEMS.get(`category=${name}`)
        if (currentCategory !== null) {
            return c.json({ error: 'This category already exists' }, { status: 404 })
        } else {
            try {
                await c.env.POEMONGER_POEMS.put(`category=${name}`, '', { metadata: { description } })
            } catch {
                return c.json({ error: 'Something went wrong while trying to save your new category' }, { status: 500 })
            }
        }
    } catch {
        return c.json({ error: 'Something went wrong while searching for this category' }, { status: 500 })
    }

    return c.json({ error }, { status })
})

export default categories
