export default function Poem({
    title,
    author,
    lines,
    sample_length = 0,
    sample_section = 0,
    single = false,
    isSample = false,
    children,
}: {
    title: unknown
    author: unknown
    lines: unknown
    sample_length?: unknown
    sample_section?: unknown
    single?: boolean
    isSample?: boolean
    children?: JSX.Element
}) {
    var l = JSON.parse(lines as string)
    var ss = sample_section ? l.slice(0, sample_section) : l
    return (
        <section class="poem-content-container">
            <h2>{title}</h2>
            <p title={`Author Name: ${author}`}>
                <em>By: {author}</em>
            </p>
            <section class="poem-container">
                {ss?.map((section: Array<string>) => {
                    var sl = sample_length
                        ? section.slice(0, sample_length as number)
                        : section
                    return (
                        <>
                            <section class="poem-container">
                                {sl.map(line => {
                                    return <p>{line}</p>
                                })}
                            </section>
                            <br />
                        </>
                    )
                })}
                {children}
            </section>
            {!single && isSample && (
                <section id="poem-sample_buy-it-now">
                    <hr id="poem-sample_separator" />
                    <button class="button buy-it-now">
                        &#128366; Buy it now
                    </button>
                </section>
            )}
        </section>
    )
}
