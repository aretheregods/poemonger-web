import { Poem } from '../../components/poetry'

export default function WorkSample({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<{
        work: { title: string; chapter: number; chapters: number }
        title: string
        author: string
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ work, title, author, sample }) => {
                const { chapter, chapters } = JSON.parse(
                    work as unknown as string
                )
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
                        <section id="page-turners">
                            {chapter !== 1 && (
                                <button
                                    id="previous"
                                    class="button"
                                    data-chapter={`${chapter - 1}`}
                                    title={`/read/${chapter}?${chapter - 1}`}
                                >
                                    Previous
                                </button>
                            )}
                            {chapter !== chapters && (
                                <button
                                    id="next"
                                    class="button"
                                    data-chapter={`${chapter + 1}`}
                                >
                                    Next
                                </button>
                            )}
                        </section>
                    </>
                )
            })}
        </>
    )
}
