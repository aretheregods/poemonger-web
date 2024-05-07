import { PoemVideo } from '../poetry'

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
                        var l = JSON.parse(lines as string)
                        var ss = sample_section ? l.slice(0, sample_section) : l
                        return (
                            <>
                                <section class="poem-section-container">
                                    <section class="poem-content-container">
                                        <h2>{title}</h2>
                                        <p title={`Author Name: ${author}`}>
                                            <em>By: {author}</em>
                                        </p>
                                        <section class="poem-container">
                                            {ss.map(
                                                (section: Array<string>) => {
                                                    var sl = sample_length
                                                        ? section.slice(
                                                              0,
                                                              sample_length as number
                                                          )
                                                        : section
                                                    return (
                                                        <>
                                                            <section class="poem-container">
                                                                {sl.map(
                                                                    (line) => {
                                                                        return (
                                                                            <p>
                                                                                {
                                                                                    line
                                                                                }
                                                                            </p>
                                                                        )
                                                                    }
                                                                )}
                                                            </section>
                                                            <br />
                                                        </>
                                                    )
                                                }
                                            )}
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
                                        </section>
                                    </section>
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
