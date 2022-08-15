import { useState, useCallback, useRef, useEffect } from 'react'

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()
  const activeHttpRequests = useRef([])

  const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
    setIsLoading(true)
    const httpAbortCtrl = new AbortController()
    activeHttpRequests.current.push(httpAbortCtrl)

    try {
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal
      })
      const data = await response.json()

      activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl)

      if (!response.ok) {
        throw new Error(data.message)
      }
      setIsLoading(false)
      return data
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }, [])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
      // this cleanup function called on moving away from the component or before the next time this hook triggered, like navigating to next page
      // so we cancel the active http request, once the user navigates from request page to back page
    }
  }, [])

  return { isLoading, error, sendRequest, clearError }
}
