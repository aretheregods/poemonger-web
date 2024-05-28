export default function AudioVideoButtons({
    workId,
    audioId,
    audioCaption = 'Listen to the first chapter',
}: {
    workId: number
    audioId: string
    audioCaption?: string
}) {
    return (
        <>
            <section class="audio-video_tools flexible-buttons">
                <button
                    data-work-id={workId}
                    class="button audio-poem_trigger"
                    data-on="0"
                >
                    &#127911; Audio poem
                </button>
                <button
                    data-work-id={workId}
                    class="button video-poem_trigger"
                    data-on="0"
                >
                    &#9658; Video poem
                </button>
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
        </>
    )
}
