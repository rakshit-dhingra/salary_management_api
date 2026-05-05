import { useState, useCallback, createContext, useContext } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toast-root">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-dot" />
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() { return useContext(Ctx) }