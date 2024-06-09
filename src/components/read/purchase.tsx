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
        poem: string
        author: string
        audio: string
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ work, poem: title, author, audio, lines }) => {
                const { chapter, chapters } = JSON.parse(
                    (work as unknown) as string
                )
                return (
                    <>
                        <section class="poem-section-container">
                            <>
                                <AudioVideoButtons
                                    {...{
                                        audioId: audio,
                                        workId,
                                        ctx: 'reader',
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
            })}
        </>
    )
}
