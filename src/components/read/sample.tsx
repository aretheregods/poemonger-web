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
                            <>
                                <section id="sample-info">
                                    <h3>This is a sample</h3>
                                </section>
                                <Poem
                                    {...{
                                        title,
                                        author,
                                        lines: sample,
                                    }}
                                />
                            </>
                        </section>
                        <section id="page-turners">
                            <input
                                id="page-range"
                                type="range"
                                value={chapter}
                                min="1"
                                max={chapters}
                                step="1"
                            />
                            {chapter !== 1 && (
                                <button
                                    id="previous"
                                    class="button"
                                    data-chapter={`${chapter - 1}`}
                                    title={`/read/${chapter}?${chapter - 1}`}
                                >
                                    &#10216;
                                </button>
                            )}
                            {chapter !== chapters && (
                                <button
                                    id="next"
                                    class="button"
                                    data-chapter={`${chapter + 1}`}
                                >
                                    &#10217;
                                </button>
                            )}
                        </section>
                    </>
                )
            })}
        </>
    )
}
