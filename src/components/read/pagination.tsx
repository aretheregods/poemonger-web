export default function Pagination({
    chapter,
    chapters,
}: {
    chapter: number
    chapters: number
}) {
    return (
        <section id="page-turners">
            <input
                id="page-range"
                type="range"
                value={chapter}
                min="1"
                max={chapters}
                step="1"
            />
            <section id="page-buttons">
                <button
                    id="previous"
                    class="button"
                    data-chapter={`${chapter - 1}`}
                    title={`/read/${chapter}?${chapter - 1}`}
                    disabled={chapter === 1}
                >
                    &#10216;
                </button>
                <p>
                    <span id="chapter-number">{chapter}</span>/
                    <span id="chapters-total">{chapters}</span>
                </p>
                <button
                    id="next"
                    class="button"
                    data-chapter={`${chapter + 1}`}
                    disabled={chapter === chapters}
                >
                    &#10217;
                </button>
            </section>
        </section>
    )
}
