import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EditPage from '@/pages/edit/Wrapper'
import PaymentPage from './pages/payment/Page'
import NotFound from '@/pages/NotFound'
import { LocalStorageHelper } from './utils/localstorage'
// import TimelapsePage from './pages/timelasp/Timelasp'
import Temp from './dev/pages/Temp'
import { ToastContainer } from 'react-toastify'
import ScanQRPage from './pages/scan-qr/Page'
import { AppRootProvider } from './providers/RootProvider'
import { useEffect } from 'react'
import { useEditedImageContext } from './context/global-context'
import { useIdleDetector } from './hooks/use-idle-detector'
import { IdleWarningModal } from './components/custom/IdleWarningModal'
import { useNavigate } from 'react-router-dom'
import IntroPage from './pages/intro/Page'
import { isHomePage } from './utils/helpers'

const IdleCountdown = () => {
  const navigate = useNavigate()

  // ==================== Idle Detection - Toàn cục ====================
  const { showWarning, warningCountdown, confirmActive } = useIdleDetector({
    idleTimeout: 36000, // 36 giây không hoạt động
    warningTimeout: 10000, // 10 giây cảnh báo
    onIdle: () => {
      // Quay về trang chủ khi hết thời gian
      navigate('/')
      LocalStorageHelper.clearAllMockupImages()
    },
  })

  return (
    !isHomePage() && (
      <IdleWarningModal show={showWarning} countdown={warningCountdown} onConfirm={confirmActive} />
    )
  )
}

function AppContent() {
  const { clearAllEditedImages } = useEditedImageContext()

  const handleReturnHome = () => {
    if (isHomePage()) {
      LocalStorageHelper.clearAllMockupImages()
    }
  }

  useEffect(() => {
    handleReturnHome()
  }, [location.pathname])

  useEffect(() => {
    return () => {
      clearAllEditedImages()
    }
  }, [])

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // "light" | "dark" | "colored"
        toastStyle={{ color: '#fff', fontWeight: 'bold' }}
      />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/qr" element={<ScanQRPage />} />
        {/* <Route path="/" element={<TimelapsePage />} /> */}
        <Route path="/edit" element={<EditPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/temp" element={<Temp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <IdleCountdown />
    </>
  )
}

function App() {
  return (
    <AppRootProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppRootProvider>
  )
}

export default App
