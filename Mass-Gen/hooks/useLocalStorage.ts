'use client'
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch {
      setStoredValue(initialValue)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue(previousValue => {
      const valueToStore = value instanceof Function ? value(previousValue) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {}
      return valueToStore
    })
  }

  return [storedValue, setValue] as const
}
