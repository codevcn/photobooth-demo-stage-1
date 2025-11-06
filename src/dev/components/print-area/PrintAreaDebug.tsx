import React from 'react'

type TPrintAreaDebugProps = {
  printAreaBounds: {
    x: number
    y: number
    width: number
    height: number
  } | null
  isOutOfBounds: boolean
  editingProduct?: {
    name: string
    print_x?: number
    print_y?: number
    print_w?: number
    print_h?: number
  }
}

export const PrintAreaDebug: React.FC<TPrintAreaDebugProps> = ({
  printAreaBounds,
  isOutOfBounds,
  editingProduct,
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs z-[100]">
      <div className="font-bold mb-2">
        <span>Print Area Debug</span>
      </div>

      <div className="space-y-1">
        <div>
          <span>Product: </span>
          {editingProduct?.name || <span>None</span>}
        </div>

        {editingProduct && (
          <div>
            <span>Config: x=</span>
            {editingProduct.print_x}
            <span>%, y=</span>
            {editingProduct.print_y}
            <span>%, w=</span>
            {editingProduct.print_w}
            <span>%, h=</span>
            {editingProduct.print_h}
            <span>%</span>
          </div>
        )}

        {printAreaBounds && (
          <div>
            <span>Bounds: x=</span>
            {Math.round(printAreaBounds.x)}
            <span>, y=</span>
            {Math.round(printAreaBounds.y)}
            <span>, w=</span>
            {Math.round(printAreaBounds.width)}
            <span>, h=</span>
            {Math.round(printAreaBounds.height)}
          </div>
        )}

        <div className={`font-bold ${isOutOfBounds ? 'text-red-400' : 'text-green-400'}`}>
          <span>Status: </span>
          {isOutOfBounds ? <span>OUT OF BOUNDS</span> : <span>IN BOUNDS</span>}
        </div>

        <div>
          <span>Elements: </span>
          {document.querySelectorAll('.NAME-root-element').length}
        </div>
      </div>
    </div>
  )
}
