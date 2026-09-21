import { MinusIcon, PlusIcon } from './icons.jsx'

export const QuantityStepper = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
  size = 'md',
}) => {
  const isSmall = size === 'sm'
  const buttonSize = isSmall ? 'h-6 w-6' : 'h-8 w-8'
  const iconSize = isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-raised p-0.5 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Зменшити кількість"
        className={`flex ${buttonSize} items-center justify-center rounded-full text-text transition hover:bg-surface-hover disabled:cursor-not-allowed`}
      >
        <MinusIcon className={iconSize} />
      </button>
      <span
        className={`min-w-[1.5rem] text-center font-semibold tabular-nums ${
          isSmall ? 'text-sm' : ''
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Збільшити кількість"
        className={`flex ${buttonSize} items-center justify-center rounded-full bg-accent text-black transition hover:bg-accent-light disabled:cursor-not-allowed`}
      >
        <PlusIcon className={iconSize} />
      </button>
    </div>
  )
}
