let pendingRequestCount = 0
let isInstalled = false
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

export const subscribeToPendingRequests = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getPendingRequestCount = () => pendingRequestCount

export const installRequestTracker = () => {
  if (isInstalled || typeof window === 'undefined') return

  isInstalled = true
  const originalFetch = window.fetch.bind(window)

  window.fetch = (...args) => {
    pendingRequestCount += 1
    notifyListeners()

    const finishRequest = () => {
      pendingRequestCount = Math.max(0, pendingRequestCount - 1)
      notifyListeners()
    }

    try {
      return originalFetch(...args).finally(finishRequest)
    } catch (error) {
      finishRequest()
      throw error
    }
  }
}
