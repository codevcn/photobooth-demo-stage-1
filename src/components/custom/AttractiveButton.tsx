import { cn } from '@/lib/utils'

type StarElementProps = {
  classNames?: Partial<{
    svgPath: string
  }>
}

const StarElement = ({ classNames }: StarElementProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        fillRule: 'evenodd',
        clipRule: 'evenodd',
      }}
      viewBox="0 0 784.11 815.53"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <path
          className={classNames?.svgPath}
          d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
        />
      </g>
    </svg>
  )
}

type AttractiveButtonProps = {
  actionText: string
  onClick?: () => void
  classNames?: Partial<{
    container: string
    button: string
    star: string
  }>
}

export const AttractiveButton = ({ actionText, onClick, classNames }: AttractiveButtonProps) => {
  return (
    <div className={cn('NAME-button-container w-full', classNames?.container)}>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <div className="NAME-star">
        <StarElement classNames={{ svgPath: classNames?.star }} />
      </div>
      <button onClick={onClick} className={cn('NAME-attractive-button', classNames?.button)}>
        <span>{actionText}</span>
      </button>
    </div>
  )
}
