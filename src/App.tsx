import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EditPage from '@/pages/edit/Page'
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

function App() {
  const { clearAllEditedImages } = useEditedImageContext()

  useEffect(() => {
    // LocalStorageHelper.clearAllMockupImages()
    // return () => {
    //   clearAllEditedImages()
    // }
  }, [])

  return (
    <AppRootProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored" // "light" | "dark" | "colored"
          toastStyle={{ color: '#000' }}
        />
        <Routes>
          <Route path="/" element={<ScanQRPage />} />
          {/* <Route path="/" element={<TimelapsePage />} /> */}
          <Route path="/edit" element={<EditPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/temp" element={<Temp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppRootProvider>
  )
}

export default App
