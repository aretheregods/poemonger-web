import { countries, locales } from '../../utils'

export default function Price({
    workId,
    price,
    locale,
    title,
    subtitle,
}: {
    workId?: number
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
    const T = ({ title, subtitle }: { title: string; subtitle: string }) => (
        <h4 class="work-title">
            {title}{' '}
            <span>
                <em>{subtitle ? `| ${subtitle}` : ''}</em>
            </span>
        </h4>
    )
    return (
        <section class="work-info">
            {workId ? (
                <a class="work_info-link" href={`/read/${workId}`}>
                    <T {...{ title, subtitle }} />
                </a>
            ) : (
                <T {...{ title, subtitle }} />
            )}
            <p class="work-price">{fp}</p>
        </section>
    )
}
