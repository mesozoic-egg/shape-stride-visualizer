import { useEffect, useState } from "react"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { ShapeStrideInput } from "./ShapeStrideInput"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import { constructDataElementsForShape } from "../utils/constructDataElements"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { Canvas, Link, Space, Title } from "../view/ui"
import { validateShapeStrides } from "../utils/validateShapeStrides"

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
      const [shape, flattened] = constructDataElementsForShape(
        shapeStrides[0],
        shapeStrides[1],
      )
      setShapeLayout([shape, shapeStrides[0]])
      setMemoryLayout(flattened)
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
