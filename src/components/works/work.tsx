import { AddToCart } from '../cart'
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
    workInCart,
}: {
    workId: number
    imgId: string
    price: number
    locale: countries
    audioId: string
    title: string
    subtitle: string
    workInCart: boolean
}) {
    return (
        <section class="work-container">
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
                style="heigh: 0px; opacity: 0%;"
                data-on="0"
            >
                <figcaption>Listen to the first chapter</figcaption>
                <audio
                    src={`/audio/${audioId}`}
                    preload="metadata"
                    controlslist="nodownload"
                    controls
                ></audio>
            </figure>
            <a href={`/read/${workId}`}>
                <img
                    src={getImg(imgId, 'medium')}
                    height="640"
                    width="400"
                    alt="A book cover"
                    class="book-cover"
                    fetchPriority="high"
                    loading="lazy"
                    decoding="async"
                    srcset={`${getImg(imgId, 'small')} 320w,${getImg(
                        imgId,
                        'medium'
                    )} 600w,${getImg(imgId, 'public')} 800w`}
                    sizes="(min-width: 768px) 33vw,(min-width: 480px) 50vw,80vw"
                />
            </a>
            <Price {...{ workId, price, locale, title, subtitle }} />
            <section class="read-purchase_buttons">
                <a href={`/read/${workId}`} class="button read-a-bit">
                    Read a bit
                </a>
                <AddToCart {...{ workId, workInCart }} />
            </section>
        </section>
    )
}
