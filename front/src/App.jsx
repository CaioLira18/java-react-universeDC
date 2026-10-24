import { useSyncExternalStore } from 'react'
import { AppRoutes } from './Routes/AppRoutes'
import { getPendingRequestCount, subscribeToPendingRequests } from './requestTracker'
import './App.css'
import './Components/LoadingScreen/LoadingScreen.css'

function App() {
  const pendingRequestCount = useSyncExternalStore(
    subscribeToPendingRequests,
    getPendingRequestCount,
    getPendingRequestCount
  )

  return (
    <div className="app" aria-busy={pendingRequestCount > 0}>
      <AppRoutes />
      {pendingRequestCount > 0 && (
        <main className="loadingScreen" role="status" aria-live="polite">
          <div className="loadingScreen__stars" aria-hidden="true" />
          <section className="loadingScreen__panel">
            <div className="loadingScreen__emblem">
              <span className="loadingScreen__orbit loadingScreen__orbit--outer" aria-hidden="true" />
              <span className="loadingScreen__orbit loadingScreen__orbit--inner" aria-hidden="true" />
              <img
                className="loadingScreen__logo"
                src="https://dc-universe-bucket.s3.us-east-1.amazonaws.com/logos/logo1.png"
                alt="Logo da DC"
              />
            </div>
            <p className="loadingScreen__eyebrow">SINAL DE ALERTA NO MULTIVERSO</p>
            <h1 className="loadingScreen__title">A LIGA ESTÁ SE FORMANDO!</h1>
            <p className="loadingScreen__message">
              Reunindo os heróis para a próxima missão...
            </p>
            <div className="loadingScreen__progress" aria-hidden="true">
              <span />
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
