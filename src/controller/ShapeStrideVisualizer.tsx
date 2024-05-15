import { useEffect, useState } from "react"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { ShapeStrideInput } from "./ShapeStrideInput"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import {
  arrangeIntoShape,
  constructDataElements,
} from "../utils/constructDataElements"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { validateShapeStrides } from "../utils/validateShapeStrides"

export const ShapeStrideVisualizer: React.FC<{}> = () => {
  const [shapeStrides, setShapeStrides] = useState<number[][]>([[], []])
  const [memoryLayout, setMemoryLayout] = useState<DataElement[]>([])
  const [shapeLayout, setShapeLayout] = useState<
    [NestedDataElementArray, number[]]
  >([[], []])
  useEffect(() => {
    if (
      shapeStrides.length &&
      shapeStrides[0].length &&
      shapeStrides[1].length
    ) {
      const elements = constructDataElements({
        shape: shapeStrides[0],
        stride: shapeStrides[1],
      })
      const elementsAsShape = arrangeIntoShape({
        dataElements: elements,
        shape: shapeStrides[0],
        stride: shapeStrides[1],
      })
      setShapeLayout([elementsAsShape, shapeStrides[0]])
      setMemoryLayout(elements)
    }
  }, [shapeStrides])
  return (
    <div>
      <ShapeStrideInput
        onConfirmShapeStrides={setShapeStrides}
        validateShapeStrides={validateShapeStrides}
      />
      <MemoryVisualizer dataElements={memoryLayout} />
      <ShapeVisualizer dataElements={shapeLayout[0]} shape={shapeLayout[1]} />
    </div>
  )
}
