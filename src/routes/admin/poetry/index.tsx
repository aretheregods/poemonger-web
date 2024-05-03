import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

type Bindings = {
    POEMONGER_POEMS: D1Database
}

type PoemPost = {
    title: string
    work: { id: number; title: string }
    category: string
    subcategory: string
    release_date: string
    sample_length: number
    poem: string[]
}

const poetry = new Hono<{ Bindings: Bindings }>()

poetry.get('/', async (c) => {
    const poemList = await c.env.POEMONGER_POEMS.prepare('select title, lines from poetry').all()
    return c.html(
        <Base title="Poemonger | Admin - Poetry">
            <>
                <h2>Admin Poetry</h2>
                {poemList.results.map(({ title, lines }) => {
                    return (
                        <>
                            <h4>{title}</h4>
                            {lines.map(section => {
                                section.map(line => {
                                    return <p>{line}</p>
                                })
                            })}
                        </>

                    )
                })}
            </>
        </Base>
    )
})

poetry.get('/new', async (c) => {
    const categoryList = await c.env.POEMONGER_POEMS.prepare('select name, description from categories where entity = "work";').all()
    const workList = await c.env.POEMONGER_POEMS.prepare('select id, title from works;').all()
    return c.html(
        <Base title="Poemonger | Admin - Poetry" assets={[
            <link
                rel="stylesheet"
                href="/static/styles/admin/poetryForm.css"
            />,
            <script type="module" src="/static/js/admin/categoriesNew.js" defer></script>,
        ]}>
            <form id="add-poem" action="/poetry" method="post">
                <label for="title">
                    <p>Title</p>
                    <input id="title" name="title" type="text" required />
                </label>
                <label for="work">
                    <p>Parent Work</p>
                    <select name="work" id="work" required>
                        <option value="" disabled>
                            --Select parent work--
                        </option>
                        {workList.results.map(({ id, title }) => (
                            <option id={`${id}`} value={`${id}`} title={`${title}`}>
                                {title}
                            </option>
                        ))}
                    </select>
                </label>
                <label for="category">
                    <p>Category</p>
                    <select name="category" id="category" required>
                        <option value="" disabled>
                            --Select poem category--
                        </option>
                        {categoryList.results.map(({ name, description }) => (
                            <option id={`${name}`} value={`${name}`} title={`${description}`}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
                <label for="subcategory">
                    <p>Subcategory</p>
                    <select name="subcategory" id="subcategory" required>
                        <option value="" disabled>
                            --Select poem subcategory--
                        </option>
                        {categoryList.results.map(({ name, description }) => (
                            <option id={`${name}`} value={`${name}`} title={`${description}`}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
                <label for="releaseDate">
                    <p>Release Date</p>
                    <input id="releaseDate" name="release_date" type="date" required />
                </label>
                <label for="sampleLength">
                    <p>Sample Length</p>
                    <input id="sampleLength" name="sample_length" type="number" required />
                </label>
                <label for="poem">
                    <p>Poem</p>
                        <textarea id="poem" name="poem" cols={60} rows={28} required
                        placeholder="Whose woods these are I think I know"></textarea>
                </label>
                <button id="submit" type="submit">Submit</button>
            </form>
        </Base>
    )
})

poetry.post('/new', async (c) => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var error
    var status = 201

    if (!f) {
        error = 'Error'
        c.status(406)
        return c.json({ error })
    }

    var body: PoemPost = await c.req.formData()
    var { title, work, category, subcategory, release_date, sample_length, poem } = body;

    try {
        const { success } = await c.env.POEMONGER_POEMS.prepare('insert into poetry(title, work, category, subcategory, release_date, sample_length, poem) values(?, json_value(?), ?, ?, ?, ?, ?);')
            .bind(title, work, category, subcategory, release_date, sample_length, poem)
            .all()
        if (success) return c.json({ success: true, error }, { status })
        else {
            return c.json({ success: false, error: `Something went wrong while trying to save your new poem` }, { status: 404 })
        }
    } catch (e: any) {
        return c.json({ success: false, error: 'Something was wrong with your request. Try again.' }, { status: 404 })
    }
})

export default poetry
