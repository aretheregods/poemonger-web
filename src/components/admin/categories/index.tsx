import Input from '../../input'

export default function Categories(results: Array<Record<string, unknown>> = []) {
    return (
        <form
            id="add-category"
            class="poetry-form"
            data-static-form-name="add-category"
        >
            <ul>
                <li>
                    <Input
                        id="category-name"
                        name="name"
                        type="text"
                        placeholder="A globally unique category name"
                        label="Category name"
                        required
                    />
                </li>
                <li>
                    <Input
                        id="category-description"
                        name="description"
                        type="text"
                        placeholder="Enter a description for your new category"
                        label="Category description"
                        required
                    />
                </li>
                <li>
                    <label for="selectEntity">Entity Type</label>
                    <select name="entity" id="selectEntity" class="standard-input" required>
                        <option value="">Choose an entity the category applies to</option>
                        {results.map(({ t }) => {
                            return <option value={`${t}`}>{t}</option>
                        })}
                    </select>
                </li>
            </ul>
            <button id="submit" type="submit" class="button">
                Submit
            </button>
        </form>
    )
}
