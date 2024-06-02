import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

import { adminRedirect } from '../'

type Bindings = {
    POEMONGER_POEMS: D1Database
    POEMS_KV: KVNamespace
    CATEGORIES_KV: KVNamespace
    WORKS_KV: KVNamespace
}

type PoemPost = {
    title: string
    work: {
        id: number
        title: string
        chapter: number
        chapters: number
    }
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
                <section>
                    <h2>Admin Poetry</h2>
                    <a href="/admin/poetry/new" class="button">
                        Add New Poem
                    </a>
                </section>
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
                                value={`${title}=${id}`}
                                title={`${title}`}
                            >
                                {title}
                            </option>
                        ))}
                    </select>
                </label>
                <label for="chapter">
                    <p>Chapter</p>
                    <input
                        id="chapter"
                        class="standard-input"
                        name="chapter"
                        type="number"
                        required
                    />
                </label>
                <label for="chapters">
                    <p>Total Work Chapters</p>
                    <input
                        id="chapters"
                        class="standard-input"
                        name="chapters"
                        type="number"
                        required
                    />
                </label>
                <label for="chapter-title">
                    <p>Chapter Title</p>
                    <input
                        id="chapter-title"
                        class="standard-input"
                        name="chapter_title"
                        type="text"
                        required
                    />
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
                        type="datetime-local"
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
                        id="lines"
                        name="lines"
                        cols={60}
                        rows={28}
                        required
                        placeholder="Whose woods these are I think I know"
                    ></textarea>
                </label>
                <label for="sample">
                    <p>Sample</p>
                    <textarea
                        id="sample"
                        name="sample"
                        cols={60}
                        rows={10}
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

    var body: FormData = await c.req.formData()
    var title = body.get('title')
    var work = body.get('work') || ''
    var workTitle = body.get('work_title') || ''
    var chapter = body.get('chapter') || ''
    var chapters = body.get('chapters') || ''
    var chapterTitle = body.get('chapter_title')
    var category = body.get('category')
    var subcategory = body.get('subcategory')
    var releaseDate = body.get('release_date')
    var single = body.get('single') || ''
    var sampleSection = body.get('sample_section') || ''
    var sampleLength = body.get('sample_length') || ''
    var lines = body.get('lines')
    var audio = body.get('audio')
    var image = body.get('image')
    var video = body.get('video')
    var sample = body.get('sample')

    try {
        const authorObj = JSON.stringify({
            id: 1,
            name: 'Warren Christopher Taylor',
        })
        const workObj = JSON.stringify({
            id: parseInt(work),
            title: workTitle,
            chapter: parseInt(chapter),
            chapters: parseInt(chapters),
        })
        const sectionObj = JSON.stringify({
            chapter: parseInt(chapter),
            name: chapterTitle,
        })
        const poetryQuery = c.env.POEMONGER_POEMS.prepare(
            `
            insert into poetry(title, author, category, subcategory, release_date, single, sample_section, sample_length, work, section, audio, image, video, lines, sample) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        ).bind(
            title,
            authorObj,
            category,
            subcategory,
            releaseDate,
            parseInt(single),
            parseInt(sampleSection),
            sampleLength,
            workObj,
            sectionObj,
            audio,
            image,
            video,
            lines,
            sample
        )
        const { success } = await poetryQuery.all()
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
                message: e,
            },
            { status: 404 }
        )
    }
})

export default poetry
