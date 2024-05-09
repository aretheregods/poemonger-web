import { Poem } from '../../components/poetry'

export default function WorkSample({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<{
        work: string
        title: string
        author: string
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ title, author, sample }) => {
                return (
                    <>
                        <section class="poem-section-container">
                            <Poem
                                {...{
                                    title,
                                    author,
                                    lines: sample,
                                }}
                            />
                        </section>
                    </>
                )
            })}
        </>
    )
}
