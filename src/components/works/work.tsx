import { AddToCart } from '../cart'
import AudioVideoButtons from './audioVideoButtons'
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
    purchased = false,
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
    purchased?: boolean
    workInCart?: boolean
    landing?: boolean
}) {
    return (
        <section class="work-container">
            <AudioVideoButtons {...{ workId, audioId }} />
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
                    {purchased ? 'Read it now' : 'Read a bit'}
                </a>
                {landing || purchased ? (
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
                                <p>{desc}</p>
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
