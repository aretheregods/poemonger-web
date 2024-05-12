export default function AddToCart({
    workId,
    workInCart,
}: {
    workId: number
    workInCart: boolean
}) {
    return (
        <button
            id={`add-to-cart_button-${workId}`}
            class={`button add-to-cart ${workInCart && 'added'}`}
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
