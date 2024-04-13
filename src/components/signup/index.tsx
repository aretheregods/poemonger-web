import Input from '../input'

export default function SignUp() {
    return (
        <form
            id="signup"
            class="credentials-form"
            data-static-form-name="signup"
        >
            <ul>
                <li>
                    <Input
                        {...{
                            name: 'first_name',
                            label: 'First name',
                            type: 'name',
                            placeholder: 'Enter your first name',
                            autocomplete: 'given-name',
                            required: true,
                        }}
                    />
                </li>
                <li>
                    <Input
                        {...{
                            name: 'last_name',
                            label: 'Last name',
                            type: 'name',
                            placeholder: 'Enter your last name',
                            autocomplete: 'family-name',
                            required: true,
                        }}
                    />
                </li>
                <li>
                    <Input
                        {...{
                            name: 'email',
                            label: 'Email address',
                            type: 'email',
                            placeholder: 'Enter your email address',
                            autocomplete: 'email',
                            required: true,
                        }}
                    />
                </li>
                <li>
                    <Input
                        {...{
                            name: 'password',
                            label: 'Password (Ex. abcABC123)',
                            type: 'password',
                            placeholder: 'Password (Ex. abcABC123)',
                            autocomplete: 'new-password',
                            required: true,
                        }}
                    />
                </li>
                <li>
                    <Input
                        {...{
                            name: 'confirm_password',
                            id: 'password-confirm-input',
                            label: 'Confirm Password',
                            type: 'password',
                            placeholder: 'Confirm your password',
                            autocomplete: 'new-password',
                            required: true,
                        }}
                    />
                </li>
                <li id="reveal-password-container">
                    <input type="checkbox" id="reveal-password" />
                    <label for="reveal-password">Show password</label>
                </li>
            </ul>
            <button type="submit" class="button">
                Submit
            </button>
        </form>
    )
}
