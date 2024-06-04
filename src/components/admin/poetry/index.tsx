import Input from '../../input'

export default function Poetry() {
    return (
        <form id="add-poem">
        <ul>
            <li>
                <Input id="poem-title" name="title" type="text" label="Title" placeholder="Enter a poem title" required />
            </li>
            <li>
                <Input id="poem-author" name="author" type="text" label="Author" placeholder="Choose an author" required />
            </li>
        </ul>
        </form>
    )
}
