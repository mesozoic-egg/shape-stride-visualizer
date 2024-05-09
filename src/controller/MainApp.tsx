import { useEffect, useState } from "react"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { ShapeStrideInput } from "./ShapeStrideInput"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import { constructDataElementsForShape } from "../utils/constructDataElements"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { ShapeStride } from "../model/shape"

interface MainAppProps {
}
export const MainApp: React.FC<MainAppProps> = () => {
  const [shapeStrides, setShapeStrides] = useState<number[][]>([[], []])
  const [memoryLayout, setMemoryLayout] = useState<DataElement[]>([])
  const [shapeLayout, setShapeLayout] = useState<NestedDataElementArray[]>([])
  useEffect(() => {
    if (shapeStrides.length) {
      const [shape, flattened] = constructDataElementsForShape(shapeStrides[0], shapeStrides[1])
      setShapeLayout(shape)
      setMemoryLayout(flattened)
    }
  }, [shapeStrides])
  return <div>
    <ShapeStrideInput onConfirmShapeStrides={setShapeStrides} />
    <MemoryVisualizer dataElements={memoryLayout} />
    <ShapeVisualizer dataElements={shapeLayout} shape={shapeStrides[0]}/>
  </div>
}

