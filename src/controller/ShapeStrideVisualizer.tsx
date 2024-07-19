import { useEffect, useState } from "react"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { ShapeStrideInput, ShapeStrideMasks } from "./ShapeStrideInput"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import {
  arrangeIntoShape,
  constructDataElements,
} from "../utils/constructDataElements"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { validateShapeStrides } from "../utils/validateShapeStrides"

export const ShapeStrideVisualizer: React.FC<{}> = () => {
  const [shapeStridesMasks, setShapeStridesMasks] = useState<ShapeStrideMasks>()
  const [memoryLayout, setMemoryLayout] = useState<DataElement[]>([])
  const [shapeLayout, setShapeLayout] = useState<
    [NestedDataElementArray, number[]]
  >([[], []])
  useEffect(() => {
    if (shapeStridesMasks) {
      try {
        const elements = constructDataElements({
          shape: shapeStridesMasks.shape,
          stride: shapeStridesMasks.strides,
        })
        const elementsAsShape = arrangeIntoShape({
          dataElements: elements,
          shape: shapeStridesMasks.shape,
          stride: shapeStridesMasks.strides,
          masks: shapeStridesMasks.masks,
        })
        setShapeLayout([elementsAsShape, shapeStridesMasks.shape])
        setMemoryLayout(elements)
      } catch (e) {
        console.error(e)
      }
    }
  }, [shapeStridesMasks])
  return (
    <div>
      <ShapeStrideInput
        onConfirmShapeStrides={setShapeStridesMasks}
        validateShapeStrides={validateShapeStrides}
      />
      <MemoryVisualizer dataElements={memoryLayout} />
      <ShapeVisualizer dataElements={shapeLayout[0]} shape={shapeLayout[1]} />
    </div>
  )
}
