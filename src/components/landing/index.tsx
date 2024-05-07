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
                                    <section class="poem-video-section">
                                        <h3>
                                            {title}{' '}
                                            <em>(Official Poetry Video)</em>
                                        </h3>
                                        <div
                                            class="poem-video-container"
                                            style="position: relative; padding-top: 177.77777777777777%;"
                                        >
                                            <iframe
                                                src={`https://customer-atan7w69apqpwpbi.cloudflarestream.com/${video}/iframe?poster=https://customer-atan7w69apqpwpbi.cloudflarestream.com/${video}/thumbnails/thumbnail.jpg%3Ftime%3D%26height%3D600&title=Poetry+Shouldn%27t+Suck`}
                                                loading="lazy"
                                                class="poetry-video_iframe"
                                                style="border: none; position: absolute; top: 0; left: 0; height: 100%;"
                                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                allowfullscreen={true}
                                            ></iframe>
                                        </div>
                                    </section>
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
