import { Price } from '../../components/works'
import { countries, getImg } from '../../utils'

export default function CartItem({
    id,
    title,
    subtitle,
    cover,
    price,
    locale,
}: {
    id: number
    title: string
    subtitle: string
    cover: string
    price: number
    locale: countries
}) {
    return (
        <section class="cart_item">
            <section class="cart_item-information">
                <a href={`/read/${id}`}>
                    <img
                        src={getImg(cover, 'verySmall')}
                        height="192"
                        width="120"
                        alt="A book cover"
                        class="book-cover"
                        loading="lazy"
                        decoding="async"
                        sizes="(((min-width: 320px) and (max-width: 768px)) 128px, 192px"
                    />
                </a>
                <Price
                    {...{
                        workId: id,
                        title,
                        subtitle,
                        price,
                        locale: locale,
                    }}
                />
            </section>
            <button class="cart_item-delete" data-work-id={id}>
                &Chi;
            </button>
        </section>
    )
}
