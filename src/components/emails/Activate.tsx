import Email from '.';

export default function Activate({ email, token, url }: { email: string | null; token: string; url: string }) {
    const location = new URL(url);
    const host = location.hostname;

    return (
        <Email>
            <table>
                <thead>
                    <tr>
                        <td><h1>Welcome to POEMONGER</h1></td>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Finish signing up. <span><a href={`https://${host}/activate?user=${email}&token=${token}`}>Activate your account</a></span></td></tr>
                </tbody>
            </table>
        </Email>
    );
}