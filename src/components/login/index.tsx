import Input from "../input";

export default function Login() {
    return (
        <form id="login" class="credentials-form" data-static-form-name="login">
            <ul>
                <li>
                    <Input
                        {...{
                            name: "email",
                            label: "Email address",
                            type: "email",
                            placeholder: "Enter your email address",
                            autocomplete: "email",
                            required: true,
                        }}
                    />
                </li>
                <li>
                    <Input
                        {...{
                            name: "password",
                            label: "Password",
                            type: "password",
                            placeholder: "Enter your password",
                            autocomplete: "current-password",
                            required: true,
                        }}
                    />
                </li>
            </ul>
            <button type="submit" class="button">
                Submit
            </button>
        </form>
    );
}