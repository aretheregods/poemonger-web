import { html } from 'hono/html'

import Input from '../../input'

export default function Categories() {
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
                        name="category"
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
            </ul>
            <button id="submit" type="submit">
                Submit
            </button>
        </form>
    )
}
