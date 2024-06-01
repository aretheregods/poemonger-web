import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

import { adminRedirect } from '../'

type Bindings = {
    POEMONGER_POEMS: D1Database
}

type PoemPost = {
    title: string
    work: { id: number; title: string }
    category: string
    subcategory: string
    release_date: string
    single: number
    sample_section: number
    sample_length: number
    poem: string[]
    image: string
    audio: string
    video: string
}

const poetry = new Hono<{ Bindings: Bindings }>()
poetry.use(adminRedirect)

poetry.get('/', async c => {
    const poemList = await c.env.POEMONGER_POEMS.prepare(
        'select title, sample_section, sample_length, lines from poetry'
    ).all()

    return c.html(
        <Base title="Poemonger | Admin - Poetry">
            <>
                <h2>Admin Poetry</h2>
                {poemList.results.map(
                    ({ title, sample_section, sample_length, lines }) => {
                        var l = JSON.parse(lines as string)
                        var ss = sample_section ? l.slice(0, sample_section) : l
                        return (
                            <>
                                <h4>{title}</h4>
                                {ss.map((section: Array<string>) => {
                                    var sl = sample_length
                                        ? section.slice(
                                              0,
                                              sample_length as number
                                          )
                                        : section
                                    return (
                                        <>
                                            {sl.map(line => (
                                                <p>{line}</p>
                                            ))}
                                            <br />
                                        </>
                                    )
                                })}
                            </>
                        )
                    }
                )}
            </>
        </Base>
    )
})

poetry.get('/new', async c => {
    const categoryList = await c.env.POEMONGER_POEMS.prepare(
        'select name, description from categories where entity = "work";'
    ).all()
    const workList = await c.env.POEMONGER_POEMS.prepare(
        'select id, title from works;'
    ).all()
    return c.html(
        <Base
            title="Poemonger | Admin - Poetry"
            assets={[
                <link
                    rel="stylesheet"
                    href="/static/styles/admin/poetryForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/admin/poetryNew.js"
                    defer
                ></script>,
            ]}
        >
            <form id="add-poem" action="/poetry" method="post">
                <label for="title">
                    <p>Title</p>
                    <input
                        id="title"
                        class="standard-input"
                        name="title"
                        type="text"
                        required
                    />
                </label>
                <label for="work">
                    <p>Parent Work</p>
                    <select name="work" id="work" required>
                        <option value="" disabled>
                            --Select parent work--
                        </option>
                        {workList.results.map(({ id, title }) => (
                            <option
                                id={`${id}`}
                                value={`${id}`}
                                title={`${title}`}
                            >
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
                            <option
                                id={`${name}`}
                                value={`${name}`}
                                title={`${description}`}
                            >
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
                            <option
                                id={`${name}`}
                                value={`${name}`}
                                title={`${description}`}
                            >
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
                <label for="releaseDate">
                    <p>Release Date</p>
                    <input
                        id="releaseDate"
                        class="standard-input"
                        name="release_date"
                        type="date"
                        required
                    />
                </label>
                <label for="single">
                    <p>Single</p>
                    <input
                        id="single"
                        class="standard-input"
                        name="single"
                        type="number"
                        required
                    />
                </label>
                <label for="sampleSection">
                    <p>Sample Section</p>
                    <input
                        id="sampleSection"
                        class="standard-input"
                        name="sample_section"
                        type="number"
                        required
                    />
                </label>
                <label for="sampleLength">
                    <p>Sample Length</p>
                    <input
                        id="sampleLength"
                        class="standard-input"
                        name="sample_length"
                        type="number"
                        required
                    />
                </label>
                <label for="poem">
                    <p>Poem</p>
                    <textarea
                        id="poem"
                        name="lines"
                        cols={60}
                        rows={28}
                        required
                        placeholder="Whose woods these are I think I know"
                    ></textarea>
                </label>
                <label for="image">
                    <p>Image File Name/ID</p>
                    <input
                        id="image"
                        class="standard-input"
                        name="image"
                        type="text"
                        placeholder="The image file name"
                    />
                </label>
                <label for="audio">
                    <p>Audio File Name/ID</p>
                    <input
                        id="audio"
                        class="standard-input"
                        name="audio"
                        type="text"
                        placeholder="The audio file name"
                    />
                </label>
                <label for="video">
                    <p>Video File Name/ID</p>
                    <input
                        id="video"
                        class="standard-input"
                        name="video"
                        type="text"
                        placeholder="The video file name"
                    />
                </label>
                <button id="submit" type="submit" class="button">
                    Submit
                </button>
            </form>
        </Base>
    )
})

poetry.post('/new', async c => {
    var ct = c.req.header('Content-Type')
    var f = /multipart\/form-data/g.test(ct || '')
    var error
    var status = 201

    if (!f) {
        error = 'Error'
        c.status(406)
        return c.json({ error })
    }

    var body: PoemPost = await c.req.parseBody()
    var {
        title,
        work,
        category,
        subcategory,
        release_date,
        single,
        sample_section,
        sample_length,
        poem,
    } = body

    try {
        const { success } = await c.env.POEMONGER_POEMS.prepare(
            'insert into poetry(title, work, category, subcategory, release_date, single, sample_section, sample_length, lines) values(?, json_value(?), ?, ?, ?, ?, ?, ?, ?);'
        )
            .bind(
                title,
                work,
                category,
                subcategory,
                release_date,
                single,
                sample_section,
                sample_length,
                poem
            )
            .all()
        if (success) return c.json({ success: true, error }, { status })
        else {
            return c.json(
                {
                    success: false,
                    error: `Something went wrong while trying to save your new poem`,
                },
                { status: 404 }
            )
        }
    } catch (e) {
        return c.json(
            {
                success: false,
                error: 'Something was wrong with your request. Try again.',
            },
            { status: 404 }
        )
    }
})

export default poetry
