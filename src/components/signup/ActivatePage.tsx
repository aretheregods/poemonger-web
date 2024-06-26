export default function ActivatePage({ error }: { error: boolean }) {
    if (error) {
        return (
            <h2>
                Please check your email for the correct link to activate your
                account.
            </h2>
        )
    }

    return (
        <h2>
            You've successfully activated your account.&nbsp;
            <span>
                <a href="/login">Log in to read poetry, now.</a>
            </span>
        </h2>
    )
}
