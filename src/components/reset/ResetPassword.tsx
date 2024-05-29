import Input from '../input'

export default function ResetPassword() {
    return (
        <>
            <h2 id="form-title">Reset Password</h2>
            <form
                id="reset-password"
                class="credentials-form"
                data-static-form-name="reset-password"
            >
                <ul>
                    <li>
                        <Input
                            name="token"
                            label="Reset Token"
                            type="text"
                            placeholder="Enter your reset token"
                            required
                        />
                    </li>
                    <li>
                        <Input
                            name="new-password"
                            label="New Password"
                            type="password"
                            placeholder="Enter your password"
                            autocomplete="new-password"
                            required
                        />
                    </li>
                    <li>
                        <Input
                            name="confirm-new-password"
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm your password"
                            autocomplete="new-password"
                            required
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
        </>
    )
}
