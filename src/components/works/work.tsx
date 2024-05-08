import { getImg } from '../../utils'

export default function Work({ imgId }: { imgId: string }) {
    return (
        <section>
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
        </section>
    )
}
