import { useEffect } from 'react'

// INVARIANT (store owner's explicit requirement — never remove or weaken):
// while ANY modal/drawer/side menu is open, the page behind it must not
// scroll. Every overlay component must call useBodyScrollLock(isOpen).
//
// Locks BOTH <html> and <body>. Locking only <body> silently stopped
// working once index.css gave <html> `overflow-x: hidden` (needed for the
// promo carousel): a non-visible overflow on <html> makes <html> itself
// the page's scroll container, so `body { overflow: hidden }` no longer
// stops anything. Locking the root element directly keeps this working
// no matter what overflow rules <html> gets in the future.
//
// Скільки зараз відкрито компонентів, що заблокували скрол. Лічильник,
// а не просто булеве значення, — щоб коли одночасно відкрито дві модалки
// (наприклад кошик і поверх нього логін), закриття однієї не знімало
// блокування скролу, поки інша ще відкрита.
let lockCount = 0

const lock = () => {
  lockCount += 1
  if (lockCount === 1) {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }
}

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
}

// Підключити в будь-якій модалці/дроверу: useBodyScrollLock(isOpen) —
// поки isOpen === true, фон сторінки не скролиться.
export const useBodyScrollLock = (active) => {
  useEffect(() => {
    if (!active) return
    lock()
    return unlock
  }, [active])
}
