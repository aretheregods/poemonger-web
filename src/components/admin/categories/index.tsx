import Input from '../../input'

export default function Categories(entityOptions: Array<{ type: string }> = []) {
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
                    <label htmlFor="selectEntity">Entity Type</label>
                    <select name="entity" id="selectEntity" class="standard-input" required>
                        <option value="">Choose an entity the category applies to</option>
                        {entityOptions.map(({ type }) => {
                            return <option value={`${type}`}>{type}</option>
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
