export default function Poem({
    title,
    author,
    sample_length,
    sample_section: ss,
    children,
}: {
    title: string
    author: string
    sample_length: number
    sample_section: string[][]
    children: JSX.Element
}) {
    return (
        <section class="poem-content-container">
            <h2>{title}</h2>
            <p title={`Author Name: ${author}`}>
                <em>By: {author}</em>
            </p>
            <section class="poem-container">
                {ss.map((section: Array<string>) => {
                    var sl = sample_length
                        ? section.slice(0, sample_length as number)
                        : section
                    return (
                        <>
                            <section class="poem-container">
                                {sl.map((line) => {
                                    return <p>{line}</p>
                                })}
                            </section>
                            <br />
                        </>
                    )
                })}
                {children}
            </section>
        </section>
    )
}
