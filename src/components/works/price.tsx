import { countries, locales } from '../../utils'

export default function Price({
    workId,
    price,
    locale,
    title,
    subtitle,
    purchased = false,
}: {
    workId?: number
    price: number
    locale: countries
    title: string
    subtitle: string
    purchased?: boolean
}) {
    var i = locales[locale]
    var fp = new Intl.NumberFormat(i.locale, {
        style: 'currency',
        currency: i.currency,
        currencyDisplay: 'narrowSymbol',
    }).format(price)
    const T = ({ title, subtitle }: { title: string; subtitle: string }) => (
        <h4 class="work-title">
            {title}{' '}
            <span>
                <em>{subtitle ? `| ${subtitle}` : ''}</em>
            </span>
        </h4>
    )
    return (
        <section class="work-info flexible-buttons">
            {workId ? (
                <a class="work_info-link" href={`/read/${workId}`}>
                    <T {...{ title, subtitle }} />
                </a>
            ) : (
                <T {...{ title, subtitle }} />
            )}
            {purchased ? (
                // <h4 class="work-like">&#x2661;</h4>
                ''
            ) : (
                <p class="work-price">{fp}</p>
            )}
        </section>
    )
}
