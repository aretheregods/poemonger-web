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
        title: string
        author: string
        audioId: string
        lines?: Array<Array<string>>
    }>
}) {
    return (
        <>
            {poetry?.map(({ work, title, author, audioId, lines }) => {
                const { chapter, chapters } = JSON.parse(
                    (work as unknown) as string
                )
                return (
                    <>
                        <section class="poem-section-container">
                            <>
                                <AudioVideoButtons {...{ audioId, workId }} />
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
