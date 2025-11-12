import { cn } from '@/lib/utils'

type TAppLoadingProps = {
  message: string
}

export const AppLoading = ({ message }: TAppLoadingProps) => {
  return (
    <div
      id="app-loading"
      className="flex-col items-center justify-center fixed top-0 left-0 right-0 bottom-0 bg-black/70 flex z-[999]"
    >
      <div className="relative bottom-[20px]">
        <div className="STYLE-animation-loading-shapes text-pink-cl"></div>
        <p className="QUERY-loading-message w-max text-base font-bold text-white mt-6 absolute top-[calc(50%+50px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {message}
        </p>
      </div>
    </div>
  )
}

type TPageLoadingProps = {
  message: string
}

export const PageLoading = ({ message }: TPageLoadingProps) => {
  return (
    <div id="page-loading" className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="relative bottom-[20px]">
        <div className="STYLE-animation-loading-shapes text-pink-cl"></div>
        <p className="QUERY-loading-message text-pink-cl w-max text-lg font-bold mt-6 absolute top-[calc(50%+50px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {message}
        </p>
      </div>
    </div>
  )
}

type TSectionLoadingProps = {
  message: string
} & Partial<{
  classNames: Partial<{
    container: string
    message: string
    shapesContainer: string
  }>
}>

export const SectionLoading = ({ message, classNames }: TSectionLoadingProps) => {
  return (
    <div
      id="section-loading"
      className={cn('flex flex-col items-center justify-center', classNames?.container)}
    >
      <div className="relative bottom-[20px]">
        <div
          className={cn('STYLE-animation-loading-shapes text-pink-cl', classNames?.shapesContainer)}
        ></div>
        <p
          className={cn(
            'QUERY-loading-message text-pink-cl w-max text-lg font-bold mt-6 absolute top-[calc(50%+50px)] left-1/2 -translate-x-1/2 -translate-y-1/2',
            classNames?.message
          )}
        >
          {message}
        </p>
      </div>
    </div>
  )
}
