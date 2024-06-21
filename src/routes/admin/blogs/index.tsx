import { Hono } from 'hono'

import { Base } from '../../../Base'

import { adminRedirect } from '../'

type Bindings = {
    POEMONGER_BLOG: D1Database
    POEMONGER_POEMS: D1Database
    ADMIN_SESSIONS: KVNamespace
    POEMONGER_ADMIN: KVNamespace
}

type variables = {
    currentAdminSession?: {
        cookie: string
        currentSession: { created_at: string }
    }
    currentAdminSessionError?: { error: boolean; message: string }
}

const blogs = new Hono<{ Bindings: Bindings; Variables: variables }>()
blogs.use(adminRedirect)

blogs.get('/', async c => {
    const { results, error } = await c.env.POEMONGER_BLOG.prepare(
        `select title from blogs`
    ).all()
    if (error) {
        return c.html(
            <Base
                title="Poemonger | Admin - Blogs Error"
                loggedIn={!!c.var.currentAdminSession?.currentSession}
            >
                <h2>Published Blogs</h2>
                <h3>There was an error. Try again</h3>
                <h4>{error}</h4>
            </Base>
        )
    } else {
        return c.html(
            <Base
                title="Poemonger | Admin - Blogs"
                loggedIn={!!c.var.currentAdminSession?.currentSession}
            >
                <h2>Published Blogs</h2>
                {results.map(({ title }) => {
                    return <p>{title}</p>
                })}
            </Base>
        )
    }
})

blogs.get('/new', async c => {
    const { results: poems, error } = await c.env.POEMONGER_POEMS.prepare(
        ''
    ).all()
    return c.html(
        <Base title="Poemonger | Admin - New Blog">
            <h2>New Blog</h2>
            <form id="add-blog" action="/admin/blogs/new" method="post">
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
                <label for="related_poem">
                    <p>Related Poem</p>
                    <select name="related_poem" id="related_poem" required>
                        <option value="" disabled>
                            --Select related poem--
                        </option>
                        {poems.map(({ id, title }) => (
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

blogs.get('/edit/:id', async c => {
    return c.html(
        <Base title="Poemonger | Admin - Edit Blog">
            <h2>Edit Blog</h2>
        </Base>
    )
})

blogs.post('/new', async c => {
    return c.json({ success: true })
})

blogs.put('/edit', async c => {
    return c.json({ success: true })
})

export default blogs
