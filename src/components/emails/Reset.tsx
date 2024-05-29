export default function Reset({
    email,
    resetToken,
    url,
}: {
    email: string
    resetToken: number
    url: string
}) {
    const location = new URL(url)
    const host = location.hostname

    return `<table>
        <thead>
            <tr>
                <td>
                    <h1>Reset your POEMONGER password</h1>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Reset Code: <code>${resetToken}</code></td>
                <td>
                    <a
                        href="${`https://${host}/reset/password?user=${email}`}"
                    >
                        Reset here
                    </a>
                </td>
            </tr>
        </tbody>
    </table>`
}
