import { getImg } from '../../utils'

export default function Work({ imgId }: { imgId: string }) {
    return (
        <section>
            <img
                src={getImg(imgId, 'small')}
                alt="A book cover"
                width="400"
                height="640"
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
