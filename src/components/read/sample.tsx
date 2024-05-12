import { Poem } from '../../components/poetry'
import Pagination from './pagination'

export default function WorkSample({
    workId,
    poetry,
    workInCart,
}: {
    workId: string
    workInCart: boolean
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
                                    <button
                                        class="button add-to-cart"
                                        data-work-id={workId}
                                        data-added={~~workInCart}
                                    >
                                        <span id={`added-icon_${workId}`}>
                                            &#65291;
                                        </span>{' '}
                                        <span id={`added-add_${workId}`}>
                                            Add
                                        </span>{' '}
                                        to cart
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
                                    <section id="poem-sample_buy-it-now">
                                        <hr id="poem-sample_separator" />
                                        <button class="button buy-it-now">
                                            &#128366; Buy it now
                                        </button>
                                    </section>
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
