import { Poem } from '../../components/poetry'
import Pagination from './pagination'

export default function WorkSample({
    workId,
    poetry,
}: {
    workId: string
    poetry: Array<{
        work: { title: string; chapter: number; chapters: number }
        title: string
        author: string
        single: boolean
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ work, title, author, single, sample }) => {
                const { chapter, chapters } = JSON.parse(
                    work as unknown as string
                )
                return (
                    <>
                        <section class="poem-section-container">
                            <>
                                <section id="sample-info">
                                    <h3>This is a sample</h3>
                                    <button class="button add-to-cart">
                                        &#65291; Add to cart
                                    </button>
                                </section>
                                <Poem
                                    {...{
                                        title,
                                        author,
                                        lines: sample,
                                    }}
                                />
                                {!single && (
                                    <>
                                        <hr />
                                        <button class="button buy-it-now">
                                            &#128214; Buy it now
                                        </button>
                                    </>
                                )}
                            </>
                        </section>
                        <Pagination {...{ chapter, chapters }} />
                    </>
                )
            })}
        </>
    )
}
