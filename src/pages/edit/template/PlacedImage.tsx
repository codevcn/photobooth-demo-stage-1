import { TPlacedImage } from '@/utils/types/global'

type TPlacedImageProps = {
  placedImage: TPlacedImage
}

export const PlacedImage = ({ placedImage }: TPlacedImageProps) => {
  const { placementState } = placedImage
  return (
    <div className="w-full h-full">
      <img
        src={placedImage.imgURL}
        alt="Placed Image"
        className="h-full w-full"
        style={{ objectFit: placementState.objectFit }}
      />
    </div>
  )
}
