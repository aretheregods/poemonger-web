export default function AddToCart({
    workId,
    workInCart,
}: {
    workId: number
    workInCart: boolean
}) {
    return (
        <button
            class="button add-to-cart"
            data-work-id={workId}
            data-added={~~workInCart}
        >
            <span id={`added-icon_${workId}`}>
                {workInCart ? <>&#10003;</> : <>&#65291;</>}
            </span>{' '}
            <span id={`added-add_${workId}`}>
                {workInCart ? 'Added' : 'Add'}
            </span>{' '}
            to cart
        </button>
    )
}
