export default function PoemVideo({
    title,
    video,
}: {
    title: string
    video: string
}) {
    return (
        <section class="poem-video-section">
            <h3>
                {title} <em>(Official Poetry Video)</em>
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
    )
}
