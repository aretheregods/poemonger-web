import Input from '../input'

type inputProps = {
    name: 'name' | 'email'
    label: string
    type: 'text' | 'email'
    placeholder: string
    autocomplete?: 'email'
}

export default function Login({
    userType = 'user',
}: {
    userType?: 'admin' | 'user'
}) {
    const userAttributes: inputProps =
        userType === 'admin'
            ? {
                  name: 'name',
                  label: 'Username',
                  type: 'text',
                  placeholder: 'Enter your username',
              }
            : {
                  name: 'email',
                  label: 'Email address',
                  type: 'email',
                  placeholder: 'Enter your email address',
                  autocomplete: 'email',
              }

    return (
        <>
            <h2 id="form-title">
                {userType === 'admin' ? 'Admin ' : ''}Log in
            </h2>
            <form
                id="login"
                class="credentials-form"
                data-static-form-name="login"
            >
                <ul>
                    <li>
                        <Input
                            {...{
                                ...userAttributes,
                                required: true,
                            }}
                        />
                    </li>
                    <li>
                        <Input
                            {...{
                                name: 'password',
                                label: 'Password',
                                type: 'password',
                                placeholder: 'Enter your password',
                                autocomplete: 'current-password',
                                required: true,
                            }}
                        />
                    </li>
                    {userType === 'admin' ? (
                        ''
                    ) : (
                        <li>
                            <a id="forgot-password" href="/reset">
                                Forgot Password
                            </a>
                        </li>
                    )}
                    <li id="reveal-password-container">
                        <input type="checkbox" id="reveal-password" />
                        <label for="reveal-password">Show password</label>
                    </li>
                </ul>
                <button type="submit" class="button">
                    Submit
                </button>
                {userType === 'admin' ? (
                    ''
                ) : (
                    <>
                        <br />
                        <hr />
                        <section id="other-link-container">
                            <p>
                                Don't have an account?{' '}
                                <span>
                                    <a href="/signup">Sign up</a>
                                </span>
                            </p>
                        </section>
                    </>
                )}
            </form>
        </>
    )
}
