export default function WorkSample({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<Array<string>>
}) {
    return <h2>Sample of {workId}</h2>
}
