import { Hono } from 'hono'

import { Base } from '../../../Base'
import { Categories } from '../../../components/admin'

type Bindings = {
    POEMONGER_POEMS: D1Database
}

const categories = new Hono<{ Bindings: Bindings }>()

categories.get('/', async (c) => {
    try {
        const categoriesList = await c.env.POEMONGER_POEMS.prepare('select name, description, path from categories;').all()
        return c.html(
            <Base title="Poemonger | Categories - List">
                <>
                    <div>
                        <h2>Categories List</h2>
                        <a href="/admin/categories/new">Add new category</a>
                    </div>
                    {categoriesList.results.map(({ name, path }) => {
                        return <p><a href={`/admin/categories/${path}`}>{name}</a></p>
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

categories.get('/new', async (c) => {
    try {
        const { results, error, success } = await c.env.POEMONGER_POEMS.prepare('select type as t from entities;').all()
        if (success) {
            return c.html(
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
                    <Categories results={results} />
                </Base>
            )
        } else {
            return c.html(
                <Base title="Poemonger | Admin - Error">
                    <h2>Error {error}</h2>
                </Base>
            )
        }
    } catch (e) {
        return c.html(
            <Base title="Poemonger | Admin - Category Error">
                <>
                    <h2>There was an error loading entities</h2>
                    <p>{e}</p>
                </>
            </Base>
        )
    }   
})

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

    try {
        const { success } = await c.env.POEMONGER_POEMS.prepare('insert into categories(name, description, path) values(?, ?, ?);')
            .bind(name, description, name.toLowerCase().split(' ').join('_'))
            .all()
        if (success) return c.json({ success: true, error }, { status })
        else {
            return c.json({ success: false, error: `Something went wrong while trying to save your new category` }, { status: 404 })
        }
    } catch (e: any) {
        return c.json({ success: false, error: 'Something was wrong with your request. Try again.' }, { status: 404 })
    }

    return c.json({ error }, { status })
})

categories.get('/:category', async (c) => {
    const categoryParam = c.req.param('category')
    try {
        const category: { name: string } | null = await c.env.POEMONGER_POEMS.prepare('select name, description from categories where path = ?')
            .bind(categoryParam as string)
            .first()

        if (category !== null) return c.html(
            <Base title={`Poemonger | Admin - Category: ${category}`}>
                <h2>Category {category?.name}</h2>
            </Base>
        )
        else return c.html(
            <Base title="Poemonger | Admin - Category">
                <h2>Could not find category</h2>
            </Base>
        )
    } catch (e) {
        return c.html(
            <Base title="Poemonger | Admin - Category">
                <h2>Error getting category</h2>
            </Base>
        )
    }

})

export default categories
