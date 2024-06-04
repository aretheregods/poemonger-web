export default function Sale({ url }: { url: string }) {
    const location = new URL(url)
    const host = location.hostname

    return `<table>
        <thead>
            <tr>
                <td>
                    <h1>Thank you or your purchase</h1>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <h2>
                        You can read your new favourite poetry
                        <span>
                        <a href="${`https://${host}/read`}"> here</a>
                        </span>
                    </h2>
                </td>
            </tr>
            <tr>
                <td>
                    <h2>
                        You can read your receipts
                        <span>
                        <a href="${`https://${host}/account/purchases`}"> here</a>
                        </span>
                    </h2>
                </td>
            </tr>
        </tbody>
    </table>
    `
}
