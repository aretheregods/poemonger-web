export default function WorkPurchase({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<{
        work: { title: string; chapter: number; chapters: number }
        author: string
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return <h2>Purchase of {workId}</h2>
}
