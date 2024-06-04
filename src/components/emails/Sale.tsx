export default function Sale({
    workId,
    workTitle,
    url,
}: {
    workId: string
    workTitle: string
    url: string
}) {
    const location = new URL(url)
    const host = location.hostname

    return `<table>
        <thead>
            <tr>
                <td>
                    <h1>Thank you or your purchase of: ${workTitle}</h1>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <h2>
                        Read it now,{' '}
                        <span>
                        <a href="${`https://${host}/read/${workId}`}">here</a>
                        </span>
                    </h2>
                </td>
            </tr>
        </tbody>
    </table>
    `
}
