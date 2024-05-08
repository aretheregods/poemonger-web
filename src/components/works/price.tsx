import { countries, locales } from '../../utils'

export default function Price({
    price,
    locale,
}: {
    price: number
    locale: countries
}) {
    var i = locales[locale]
    var fp = new Intl.NumberFormat(i.locale, {
        style: 'currency',
        currency: i.currency,
        currencyDisplay: 'narrowSymbol',
    }).format(price)
    return <p>{fp}</p>
}
