import { useEffect } from 'react'

// Скільки зараз відкрито компонентів, що заблокували скрол. Лічильник,
// а не просто булеве значення, — щоб коли одночасно відкрито дві модалки
// (наприклад кошик і поверх нього логін), закриття однієї не знімало
// блокування скролу, поки інша ще відкрита.
let lockCount = 0

const lock = () => {
  lockCount += 1
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden'
  }
}

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
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
