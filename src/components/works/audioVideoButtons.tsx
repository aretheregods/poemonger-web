export default function AudioVideoButtons({
    workId,
    audioId,
    audioCaption = 'Listen to the first chapter',
    videoCaption = 'Video Coming Soon',
    chapter,
    chapters = [],
    ctx = 'work',
}: {
    workId: number
    audioId: string
    audioCaption?: string
    videoCaption?: string
    chapter: number
    chapters: Array<{ title: string }>
    ctx?: 'work' | 'reader'
}) {
    return (
        <>
            <section class="audio-video_tools flexible-buttons">
                <button
                    id={`audio-poem_trigger-${workId}`}
                    data-work-id={workId}
                    class="button audio-poem_trigger"
                    data-on="0"
                >
                    &#127911; Audio poem
                </button>
                <button
                    id={`video-poem_trigger-${workId}`}
                    data-work-id={workId}
                    class="button video-poem_trigger"
                    data-on="0"
                >
                    &#9658; Video poem
                </button>
                {ctx === 'work' ? (
                    ''
                ) : (
                    <>
                        <button
                            id="chapter-list_trigger"
                            class="button chapter-list_trigger"
                            popovertarget="chapters-list_list"
                        >
                            &equiv;
                        </button>
                        <dialog id="chapters-list_list" popover="auto">
                            <h2>Chapters</h2>
                            <ol>
                                {chapters.map(({ title }, index) => (
                                    <li>
                                        <a
                                            href={`/read/${workId}?chapter=${index +
                                                1}&prev=${chapter}`}
                                        >
                                            <p>{title}</p>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </dialog>
                    </>
                )}
            </section>
            <figure
                id={`audio-poem_player-${workId}`}
                class="work-audio audio-poem_player"
                style="height: 0px; opacity: 0%; z-index: -1;"
                data-on="0"
            >
                <figcaption>{audioCaption}</figcaption>
                <audio
                    id={`audio-poem_player-element-${workId}`}
                    src={`/audio/${audioId}`}
                    preload="none"
                    controlslist="nodownload"
                    controls
                ></audio>
            </figure>
            <figure
                id={`video-poem_player-${workId}`}
                class="work-video video-poem_player"
                style="height: 0px; opacity: 0%; z-index: -1;"
                data-on="0"
            >
                <figcaption>{videoCaption}</figcaption>
            </figure>
        </>
    )
}
