import { NestedDataElementArray } from "../model/dataElement"
import { Card, TextAlign, Title } from "../view/ui"
import { ShapeLayout } from "../view/ShapeLayout"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "../view/ErrorBoundary"

interface ShapeVisualizerProps {
  dataElements: NestedDataElementArray
  shape: number[]
}

export const ShapeVisualizer: React.FC<ShapeVisualizerProps> = ({
  dataElements,
  shape,
}) => {
  const [hasError, setHasError] = useState(false)
  // useEffect(() => {
  //   setHasError(false)
  // }, [dataElements, shape])
  return (
    <div>
      <ShapeVisualizerTitle />
      <Card maxWidth={1800}>
        <TextAlign>
          <ErrorBoundary hasError={hasError} setHasError={setHasError}>
            <ShapeLayout dataElements={dataElements} shape={shape} />
          </ErrorBoundary>
        </TextAlign>
      </Card>
    </div>
  )
}

const ShapeVisualizerTitle = () => <Title level={2}>Shape layout</Title>
