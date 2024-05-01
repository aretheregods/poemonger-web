import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { Client as LibsqlClient, createClient } from "@libsql/client/web";

import { Base } from '../../../Base'
import { Categories } from '../../../components/admin'

type Bindings = {
    POEMONGER_POEMS: KVNamespace
    TURSO_URL?: string;
    TURSO_AUTH_TOKEN?: string;
}

type Meta = {
    name: string;
    description: string;
}

const categories = new Hono<{ Bindings: Bindings }>()

function buildLibsqlClient(env: Bindings): LibsqlClient {
    const url = env.TURSO_URL?.trim();
    if (url === undefined) {
      throw new Error("TURSO_URL env var is not defined");
    }

    const authToken = env.TURSO_AUTH_TOKEN?.trim();
    if (authToken == undefined) {
      throw new Error("TURSO_AUTH_TOKEN env var is not defined");
    }

    return createClient({ url, authToken })
}

categories.get('/', async (c) => {
    try {
        const client = buildLibsqlClient(c.env)
        const categoriesList = await client.execute('select name, description from categories;')
        return c.html(
            <Base title="Poemonger | Categories - List">
                <>
                    <h2>Categories List</h2>
                    {categoriesList.rows.map(async ({ name }) => {
                        return <p><a href={`/admin/categories/${name}`}>{name}</a></p>
                    })}
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
                <script type="module" src="/static/js/admin/categoriesNew.js" defer></script>,
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
        return c.json({ success: false, error: 'No name or description in request' }, { status: 404 })

    const client = buildLibsqlClient(c.env);
    try {
        await client.execute({ sql: 'insert into categories(name, description) values(?, ?);', args: [name, description] })
        return c.json({ success: true, error })
    } catch {
        return c.json({ success: false, error: 'Something went wrong while trying to save your new category' }, { status: 500 })
    }

    return c.json({ error }, { status })
})

export default categories
