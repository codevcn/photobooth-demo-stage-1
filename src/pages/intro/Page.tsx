import { AttractiveButton } from '@/components/custom/AttractiveButton'
import { useNavigate } from 'react-router-dom'

const IntroPage = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen">
      <div className="relative h-full w-full">
        <div className="relative h-full w-full z-10">
          <video
            className="NAME-intro-video w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload"
          >
            <source src="/videos/intro-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="w-[90%] scale-95 transition z-20 text-base font-bold shadow-md -translate-x-1/2 fixed top-4 left-1/2 bg-pink-cl text-white rounded-md p-2">
        <AttractiveButton
          actionText="Thử ngay"
          classNames={{
            button: 'text-center w-full',
            star: 'text-white bg-white fill-white',
          }}
          onClick={() => navigate('/qr')}
        />
      </div>
      {/* <button className="">Thử ngay</button> */}
    </div>
  )
}

export default IntroPage
