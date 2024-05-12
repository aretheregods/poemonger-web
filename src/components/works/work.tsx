import Price from './price'
import { getImg } from '../../utils'
import { countries } from '../../utils'

export default async function Work({
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
            <section class="audio-video_tools flexible-buttons">
                <button data-work-id={workId} class="button audio-poem_trigger">
                    &#127911; Audio poem
                </button>
                <button data-work-id={workId} class="button video-poem_trigger">
                    &#9658; Video poem
                </button>
            </section>
            <figure
                id={`audio-poem_player-${workId}`}
                class="work-audio audio-poem_player"
                style="display: none;"
            >
                <figcaption>Listen to the first chapter</figcaption>
                <audio
                    src={`/audio/${audioId}`}
                    preload="metadata"
                    controlslist="nodownload"
                    controls
                ></audio>
            </figure>
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
                <button class="button add-to-cart" data-work-id={workId}>
                    &#65291; Add to cart
                </button>
            </section>
        </section>
    )
}
