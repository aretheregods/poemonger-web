export default function Landing(results: Array<Record<string, unknown>>) {
    return (
        <>
            <h2>This is the landing page</h2>
            {results.map((r) => (
                <p>{r.title}</p>
            ))}
        </>
    )
}
