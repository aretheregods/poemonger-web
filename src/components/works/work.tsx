import Price from './price'
import { getImg } from '../../utils'
import { countries } from '../../utils'

export default function Work({
    imgId,
    price,
    locale,
    audioId,
}: {
    imgId: string
    price: number
    locale: countries
    audioId: string
}) {
    return (
        <section class="work-container">
            <figure class="work-audio">
                <figcaption>Listen to the first chapter</figcaption>
                <audio src={`/audio/${audioId}`} controls></audio>
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
            <Price price={price} locale={locale} />
            <section class="read-purchase_buttons">
                <button class="button">Read a bit</button>
                <button class="button buy-it-now">Buy it now</button>
            </section>
        </section>
    )
}
