import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

import { Base } from '../../../Base'

type Bindings = {
    POEMONGER_POEMS: D1Database
}

const poetry = new Hono<{ Bindings: Bindings }>()

poetry.get('/', (c) =>
    c.html(
        <Base title="Poemonger | Admin - Poetry">
            <h2>Admin Poetry</h2>
        </Base>
    )
)

poetry.get('/new', async (c) => {
    const categoryList = await c.env.POEMONGER_POEMS.prepare('select title, name, description from categories where entity = "work";').all()
    const workList = await c.env.POEMONGER_POEMS.prepare('select id, title from works;').all()
    return c.html(
        <Base title="Poemonger | Admin - Poetry">
        <form id="form" action="/poetry" method="post">
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

export default poetry
