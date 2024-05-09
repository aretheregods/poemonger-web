export default function WorkPurchase({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<{
        work: string
        author: string
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return <h2>Purchase of {workId}</h2>
}
