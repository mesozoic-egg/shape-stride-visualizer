import { useEffect, useState, useMemo } from "react"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { ShapeStrideInput } from "./ShapeStrideInput"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import {
  arrangeIntoShape,
  constructDataElements,
} from "../utils/constructDataElements"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { Canvas, Link, Space, Title } from "../view/ui"
import {
  checkCompatibleShapeStrides,
  validateShapeStrides,
} from "../utils/validateShapeStrides"
import { ShapeStride } from "../model/shape"

const MainAppControl: React.FC<{}> = () => {
  const [shapeStrides, setShapeStrides] = useState<number[][]>([[], []])
  const [memoryLayout, setMemoryLayout] = useState<DataElement[]>([])
  const [shapeLayout, setShapeLayout] = useState<
    [NestedDataElementArray[], number[]]
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
  const [shapeStrides2, setShapeStrides2] = useState<number[][]>([[], []])
  const [shapeLayout2, setShapeLayout2] = useState<
    [NestedDataElementArray[], number[]]
  >([[], []])
  useEffect(() => {
    if (
      shapeStrides2.length &&
      shapeStrides2[0].length &&
      shapeStrides2[1].length
    ) {
      const elementsAsShape = arrangeIntoShape({
        dataElements: memoryLayout,
        shape: shapeStrides2[0],
        stride: shapeStrides2[1],
      })
      setShapeLayout2([elementsAsShape, shapeStrides2[0]])
    }
  }, [shapeStrides2, memoryLayout])
  const _checkCompatibleShapeStrides = useMemo(() => {
    return checkCompatibleShapeStrides(shapeStrides[0], shapeStrides[1])
  }, [shapeStrides])
  return (
    <div>
      <ShapeStrideInput
        onConfirmShapeStrides={setShapeStrides}
        validateShapeStrides={validateShapeStrides}
      />
      <MemoryVisualizer dataElements={memoryLayout} />
      <ShapeVisualizer dataElements={shapeLayout[0]} shape={shapeLayout[1]} />
      <ShapeStrideInput
        onConfirmShapeStrides={setShapeStrides2}
        validateShapeStrides={_checkCompatibleShapeStrides}
        initialShapeStrides={[
          new ShapeStride(3, 2, 0),
          new ShapeStride(2, 1, 1),
        ]}
      />
      <ShapeVisualizer dataElements={shapeLayout2[0]} shape={shapeLayout2[1]} />
    </div>
  )
}

const AppTitle = () => <Title level={1}>Shape and stride visualizer</Title>
const GithubLink = () => (
  <Link
    href="https://github.com/mesozoic-egg/shape-stride-visualizer"
    target="_blank"
  >
    Github Link
  </Link>
)
interface MainAppProps {}
export const MainApp: React.FC<MainAppProps> = () => {
  return (
    <Canvas maxWidth={1000}>
      <AppTitle />
      <GithubLink />
      <MainAppControl />
      <Space size={100} />
    </Canvas>
  )
}
