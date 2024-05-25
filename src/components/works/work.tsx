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
    description = [],
    workInCart = false,
    landing = false,
}: {
    workId: number
    imgId: string
    price: number
    locale: countries
    audioId: string
    title: string
    subtitle: string
    description?: Array<string>
    workInCart?: boolean
    landing?: boolean
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
                style="height: 0px; opacity: 0%; z-index: -1;"
                data-on="0"
            >
                <figcaption>Listen to the first chapter</figcaption>
                <audio
                    id={`audio-poem_player-element-${workId}`}
                    src={`/audio/${audioId}`}
                    preload="none"
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
                    fetchPriority={landing ? 'low' : 'high'}
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
            <section class="read-purchase_buttons flexible-buttons">
                <a href={`/read/${workId}`} class="button read-a-bit">
                    Read a bit
                </a>
                {landing ? (
                    <>
                        <button
                            id={`work-description_trigger-${workId}`}
                            popovertarget={`work-description_container-${workId}`}
                            class="button work-description"
                        >
                            Description
                        </button>
                        <dialog
                            id={`work-description_container-${workId}`}
                            class="work-description_container"
                            popover="auto"
                        >
                            {description.map((desc) => (
                                <>
                                    <p>{desc}</p>
                                    <br />
                                </>
                            ))}
                        </dialog>
                    </>
                ) : (
                    <AddToCart {...{ workId, workInCart }} />
                )}
            </section>
        </section>
    )
}
