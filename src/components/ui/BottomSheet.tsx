import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, children }: Props) {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const dragY = useRef(0)

  useEffect(() => {
    const root = document.getElementById('app-root')
    if (isOpen) {
      setVisible(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true)
          root?.classList.add('sheet-open')
        })
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setAnimateIn(false)
      root?.classList.remove('sheet-open')
      const t = setTimeout(() => setVisible(false), 360)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    dragY.current = 0
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy < 0) return
    dragY.current = dy
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }

  const handleTouchEnd = () => {
    if (dragY.current > 60) {
      onClose()
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        sheetRef.current.style.transform = 'translateY(0)'
      }
    }
    dragY.current = 0
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 350ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          background: 'var(--sheet-bg)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '90vh',
          overflowY: 'auto',
          transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
          transition: animateIn
            ? 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 320ms cubic-bezier(0.4, 0, 1, 1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: 'rgba(0,0,0,0.15)',
              borderRadius: 2,
            }}
          />
        </div>

        {/* Title */}
        {title && (
          <div
            style={{
              padding: '4px 20px 16px',
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--sheet-text)',
              textAlign: 'center',
            }}
          >
            {title}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
