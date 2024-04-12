export default function ActivatePage({ error, value }: { error: boolean; value: object; }) {
    if (error) {
        return (
            <h2>
                Please check your email for the correct link to activate your
                account.
                {JSON.stringify(value)}
            </h2>
        );
    }

    return (
        <h2>
            You've successfully activated your account. 
            <span>
                <a href="/login">Log in to read poetry, now.</a>
            </span>
        </h2>
    );
}
