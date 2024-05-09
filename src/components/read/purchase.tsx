export default function WorkPurchase({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<Array<string>>
}) {
    return <h2>Purchase of {workId}</h2>
}
