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
                                <section id="poetry-twelve-steps">
                                    <figure>
                                        <legend>
                                            <h2>
                                                I'm Warren Christopher Taylor.
                                                And this is why I changed my
                                                poetry
                                            </h2>
                                            <h3>
                                                <em>
                                                    12 Poetic Steps (Or How I
                                                    Learned to Stop Worrying and
                                                    Love Real, Traditional
                                                    Poetry)
                                                </em>
                                            </h3>
                                        </legend>
                                        <ul>
                                            <li>
                                                We admitted that we were
                                                powerless over how much free
                                                verse poetry sucks.
                                            </li>
                                            <li>
                                                Came to believe that rhythm
                                                greater than free verse can
                                                restore poetry to sanity.
                                            </li>
                                            <li>
                                                Made a decision to turn poetry
                                                over to rhythm, rhyme and
                                                structure as we understood
                                                poetry.
                                            </li>
                                            <li>
                                                Made a searching inventory of
                                                what we really like about
                                                poetry.
                                            </li>
                                            <li>
                                                Admitted to ourselves the exact
                                                nature of how contemporary
                                                poetry sucks.
                                            </li>
                                            <li>
                                                Were entirely ready to have
                                                Poemonger's poetry show all
                                                that's wrong with poetry.
                                            </li>
                                            <li>
                                                Humbly enjoy poemonger's poems
                                                so much that we want to change
                                                contemporary poetry.
                                            </li>
                                            <li>
                                                Made a list of everything we
                                                love about poetry and became
                                                willing to use it in real
                                                poetry.
                                            </li>
                                            <li>
                                                Made direct amends to write
                                                rhythmic and fun poetry real,
                                                actual people would enjoy.
                                            </li>
                                            <li>
                                                Continue to take inventory of
                                                every word we write and hear
                                                when it has no rhythm, logic or
                                                beauty at all.
                                            </li>
                                            <li>
                                                Sought through having real
                                                people read our poems to find
                                                out that people actually love
                                                fun, rhythmic poetry with
                                                understandable and logical
                                                stories to tell.
                                            </li>
                                            <li>
                                                Having had a poetic awakening as
                                                a result of Poemonger, we tried
                                                to carry this message of
                                                poetry's rhythm and
                                                possibilities to poets and all
                                                people.
                                            </li>
                                        </ul>
                                    </figure>
                                </section>
                                <section
                                    id="poemonger-landing-works"
                                    data-works-fetched="0"
                                >
                                    <h2>Warren's Real Poetic Works</h2>
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
