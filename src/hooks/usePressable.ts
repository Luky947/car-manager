import { useState, useRef } from 'react'

export function usePressable(onPress?: () => void) {
  const [pressed, setPressed] = useState(false)
  const lastTouch = useRef(0)

  const handlers = {
    onTouchStart: () => {
      lastTouch.current = Date.now()
      setPressed(true)
    },
    onTouchEnd: () => {
      setPressed(false)
      onPress?.()
    },
    onTouchCancel: () => setPressed(false),
    onMouseDown: () => {
      if (Date.now() - lastTouch.current < 500) return
      setPressed(true)
    },
    onMouseUp: () => {
      if (Date.now() - lastTouch.current < 500) return
      setPressed(false)
      onPress?.()
    },
    onMouseLeave: () => setPressed(false),
  }

  const style = {
    transform: pressed ? 'scale(0.98)' : 'scale(1)',
    opacity: pressed ? 0.7 : 1,
    background: pressed ? '#222222' : '#1c1c1e',
    transition: pressed
      ? 'transform 60ms cubic-bezier(0.2,0,0,1), opacity 60ms, background 60ms'
      : 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms, background 200ms',
  }

  return { handlers, style, pressed }
}
