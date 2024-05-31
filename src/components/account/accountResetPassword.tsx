import Input from '../input'

export default function AccountResetPassword() {
    return (
        <form id="reset" class="credentials-form" data-static-form-name="reset">
            <h2 id="form-title">Reset Password</h2>
            <br />
            <ul>
                <li>
                    <Input
                        {...{
                            name: 'old_password',
                            label: 'Old Password',
                            type: 'password',
                            placeholder: 'Enter Your Old Password',
                            autocomplete: 'current-password',
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
