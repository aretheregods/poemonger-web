import { Poem } from '../../components/poetry'

export default function WorkSample({
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
    return (
        <>
            {poetry?.map(({ work, author, sample }) => {
                return (
                    <>
                        <section class="poem-section-container">
                            <Poem
                                {...{
                                    title: work,
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
