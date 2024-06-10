import AudioVideoButtons from '../../components/works/audioVideoButtons'
import { Poem } from '../../components/poetry'
import Pagination from './pagination'

export default function WorkPurchase({
    workId,
    poetry,
}: {
    workId: number
    poetry: Array<{
        work: { title: string; chapter: number; chapters: number }
        sections: { chapters: Array<{ title: string }> }
        poem: string
        author: string
        audio: string
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(
                ({ work, poem: title, sections, author, audio, lines }) => {
                    const { chapter, chapters } = JSON.parse(
                        (work as unknown) as string
                    )
                    const s = JSON.parse(sections)
                    return (
                        <>
                            <section class="poem-section-container">
                                <>
                                    <AudioVideoButtons
                                        {...{
                                            audioId: audio,
                                            workId,
                                            chapter,
                                            ctx: 'reader',
                                            position: sticky;
                                                top: 0px;
                                                    margin-top: 0px;
                                                        padding-block: 1rem;
                                                            background-color: white;
                                                                border-bottom: lightgrey 1px solid;
                                                                    height: 100%;
                                            chapters: s.chapters,
                                        }}
                                    />
                                    <Poem
                                        {...{
                                            id: workId,
                                            title,
                                            author,
                                            lines,
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
