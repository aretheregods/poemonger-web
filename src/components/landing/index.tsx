import { Poem, PoemVideo } from '../poetry'
import { Variables } from '../../'

export default async function Landing({
    req,
    r,
    query,
}: {
    req: Request
    r: Variables['READER_SESSIONS']
    query: string
}) {
    try {
        let response = { message: 'There was an error:', data: [] }
        const res = await r.query(req, query, true)
        const results: { data: [] } = await res.json()
        return (
            <>
                {results?.data?.map(
                    ({
                        title,
                        author,
                        lines,
                        video,
                        sample_length,
                        sample_section,
                    }) => {
                        return (
                            <>
                                <section class="poem-section-container">
                                    <Poem
                                        {...{
                                            title,
                                            author,
                                            lines,
                                            sample_length,
                                            sample_section,
                                        }}
                                    >
                                        <>
                                            <hr class="ready-to-go_message" />
                                            <br />
                                            <p class="read-more-link">
                                                <a
                                                    href="/signup"
                                                    title="Sign up to read more awesome poetry"
                                                    class="button"
                                                >
                                                    Read better poetry &#128366;
                                                </a>
                                            </p>
                                        </>
                                    </Poem>
                                    <PoemVideo
                                        title={title as string}
                                        video={video as string}
                                    />
                                    <p class="read-more-link">
                                        <a
                                            href="/signup"
                                            title="Sign up to read more awesome poetry"
                                            class="button"
                                        >
                                            Read better poetry &#128366;
                                        </a>
                                    </p>
                                    <br />
                                    <hr class="video-poem-split" />
                                </section>
                            </>
                        )
                    }
                )}
            </>
        )
    } catch {
        return <h2>Error getting poems</h2>
    }
}
