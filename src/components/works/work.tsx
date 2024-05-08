import Price from './price'
import { getImg } from '../../utils'
import { countries } from '../../utils'

export default function Work({
    imgId,
    price,
    locale,
}: {
    imgId: string
    price: number
    locale: countries
}) {
    return (
        <section class="work-container">
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
                <button class="button">Read it now</button>
                <button class="button buy-it-now">Buy it now</button>
            </section>
        </section>
    )
}
