import { getImg } from '../../utils'

export default function Work({ imgId }: { imgId: string }) {
    return (
        <section>
            <img
                src={getImg(imgId, 'public')}
                alt="A book cover"
                width="300"
                height="200"
                loading="lazy"
                decoding="async"
                srcset={`${getImg(imgId, 'small')} 400w,${getImg(
                    imgId,
                    'medium'
                )} 600w,${getImg(imgId, 'public')} 800w`}
            />
        </section>
    )
}
