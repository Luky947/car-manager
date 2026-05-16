import { useState, useEffect, type ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function CenterModal({ isOpen, onClose, title, children }: Props) {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true))
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setAnimateIn(false)
      const t = setTimeout(() => setVisible(false), 280)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        opacity: animateIn ? 1 : 0,
        transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#f5f5f7',
          borderRadius: 24,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          maxHeight: '70vh',
          overflowY: 'auto',
          position: 'relative',
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'scale(1)' : 'scale(0.88)',
          transition: animateIn
            ? 'opacity 350ms cubic-bezier(0.34,1.56,0.64,1), transform 350ms cubic-bezier(0.34,1.56,0.64,1)'
            : 'opacity 250ms cubic-bezier(0.4,0,1,1), transform 250ms cubic-bezier(0.4,0,1,1)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: '#0a0a0a', marginBottom: 16 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}
