import { Poem, PoemVideo } from '../poetry'

type results = {
    title: string
    author: string
    lines: string[][]
    sample_length: number
    sample_section: number
}

export default async function Landing({
    d,
    query,
}: {
    d: D1Database
    query: string
}) {
    try {
        const { results, error, success } = await d.prepare(query).all()
        return (
            <>
                {results.map(
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
