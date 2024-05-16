export default function Pagination({
    chapter,
    chapters,
}: {
    chapter: number
    chapters: number
}) {
    const disabledStyle = '--button-color-l: 95%; pointer-events: none;'
    return (
        <section id="page-turners">
            <input
                id="page-range"
                type="range"
                value={chapter}
                data-previous={chapter}
                min="1"
                max={chapters}
                step="1"
            />
            <section id="page-buttons">
                <button
                    id="previous"
                    class="button"
                    data-chapter={`${chapter - 1}`}
                    data-previous={chapter}
                    title={
                        chapter === 1
                            ? ''
                            : `/read/${chapter}?chapter=${chapter - 1}&prev=${chapter}`
                    }
                    disabled={chapter === 1}
                    style={`${chapter === 1 ? disabledStyle : ''}`}
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
                    data-previous={chapter}
                    title={
                        chapter === chapters
                            ? ''
                            : `/read/${chapter}?chapter=${chapter + 1}&prev=${chapter}`
                    }
                    disabled={chapter === chapters}
                    style={`${chapter === chapters ? disabledStyle : ''}`}
                >
                    &#10217;
                </button>
            </section>
        </section>
    )
}
