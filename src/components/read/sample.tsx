import { AddToCart } from '../../components/cart'
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
        poem: string
        author: string
        single: boolean
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ work, poem: title, author, single, sample }) => {
                const { chapter, chapters } = JSON.parse(
                    (work as unknown) as string
                )
                return (
                    <>
                        <section class="poem-section-container">
                            <>
                                <section id="sample-info">
                                    <h3>This is a sample</h3>
                                    <AddToCart
                                        {...{ workId: ~~workId, workInCart }}
                                    />
                                    <button
                                        id="chapter-list_trigger"
                                        class="button chapter-list_trigger"
                                        popovertarget="chapters-list_list"
                                    >
                                        &equiv;
                                    </button>
                                    <dialog id="chapters-list_list" popover>
                                        Chapters
                                    </dialog>
                                </section>
                                <Poem
                                    {...{
                                        id: ~~workId,
                                        title,
                                        author,
                                        single,
                                        lines: sample,
                                        isSample: true,
                                    }}
                                />
                            </>
                        </section>
                        <Pagination {...{ chapter, chapters }} />
                    </>
                )
            })}
        </>
    )
}
