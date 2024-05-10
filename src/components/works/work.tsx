import Price from './price'
import { getImg } from '../../utils'
import { countries } from '../../utils'

export default function Work({
    workId,
    imgId,
    price,
    locale,
    audioId,
    title,
    subtitle,
}: {
    workId: number
    imgId: string
    price: number
    locale: countries
    audioId: string
    title: string
    subtitle: string
}) {
    return (
        <section class="work-container">
            <section class="audio-video_tools">
                <section class="audio-tools">
                    <button
                        id={`audio-button_work-${workId}`}
                        class="button audio-poem"
                        data-visible="0"
                    >
                        Audio poem
                    </button>
                    <figure id={`audio_work-${workId}`} class="work-audio">
                        <figcaption>Listen to the first chapter</figcaption>
                        <audio
                            src={`/audio/${audioId}`}
                            preload="metadata"
                            controlslist="nodownload"
                            controls
                        ></audio>
                    </figure>
                </section>
            </section>
            <img
                src={getImg(imgId, 'medium')}
                alt="A book cover"
                class="book-cover"
                loading="lazy"
                decoding="async"
                srcset={`${getImg(imgId, 'small')} 320w,${getImg(
                    imgId,
                    'medium'
                )} 600w,${getImg(imgId, 'public')} 800w`}
                sizes="(min-width: 768px) 33vw,(min-width: 480px) 50vw,80vw"
            />
            <Price
                price={price}
                locale={locale}
                title={title}
                subtitle={subtitle}
            />
            <section class="read-purchase_buttons">
                <a href={`/read/${workId}`} class="button read-a-bit">
                    Read a bit
                </a>
                <button class="button add-to-cart">&#65291; Add to cart</button>
            </section>
        </section>
    )
}
