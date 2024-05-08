import { countries, locales } from '../../utils'

export default function Price({
    price,
    locale,
    title,
    subtitle,
}: {
    price: number
    locale: countries
    title: string
    subtitle: string
}) {
    var i = locales[locale]
    var fp = new Intl.NumberFormat(i.locale, {
        style: 'currency',
        currency: i.currency,
        currencyDisplay: 'narrowSymbol',
    }).format(price)
    return (
        <section class="work-info">
            <h4 class="work-title">
                {title}{' '}
                <span>
                    <em>{subtitle ? `: ${subtitle}` : ''}</em>
                </span>
            </h4>
            <p class="work-price">{fp}</p>
        </section>
    )
}
