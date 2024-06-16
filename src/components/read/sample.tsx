import { AddToCart } from '../../components/cart'
import { Poem } from '../../components/poetry'
import Pagination from './pagination'

export default function WorkSample({
    ctx = 'signedUp',
    workId,
    poetry,
    workInCart = false,
}: {
    ctx?: 'landing' | 'signedUp'
    workId: string
    workInCart?: boolean
    poetry: Array<{
        work: { title: string; chapter: number; chapters: number }
        poem: string
        sections: { chapters: Array<{ title: string }> }
        author: string
        single: boolean
        sample?: Array<Array<string>>
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(
                ({ work, poem: title, sections, author, single, sample }) => {
                    const { chapter, chapters } = JSON.parse(
                        (work as unknown) as string
                    )
                    const s = JSON.parse((sections as unknown) as string)
                    return (
                        <>
                            <section class="poem-section-container">
                                <>
                                    <section id="sample-info">
                                        {ctx === 'landing' ? (
                                            <>
                                                <h3>Log in to purchase</h3>
                                                <a href="/login" class="button">
                                                    Login
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <h3>This is a sample</h3>
                                                <AddToCart
                                                    {...{
                                                        workId: ~~workId,
                                                        workInCart,
                                                    }}
                                                />
                                            </>
                                        )}
                                        <button
                                            id="chapter-list_trigger"
                                            class="button chapter-list_trigger"
                                            popovertarget="chapters-list_list"
                                        >
                                            &equiv;
                                        </button>
                                        <dialog
                                            id="chapters-list_list"
                                            popover="auto"
                                        >
                                            <h2>Chapters</h2>
                                            <ol>
                                                {s.chapters.map(
                                                    (
                                                        {
                                                            title,
                                                        }: { title: string },
                                                        index: number
                                                    ) => (
                                                        <li>
                                                            <a
                                                                href={`/read/${workId}?chapter=${index +
                                                                    1}&prev=${chapter}`}
                                                            >
                                                                <p>{title}</p>
                                                            </a>
                                                        </li>
                                                    )
                                                )}
                                            </ol>
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
                }
            )}
        </>
    )
}
