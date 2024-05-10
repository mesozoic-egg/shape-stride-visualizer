import { NestedDataElementArray } from "../model/dataElement"
import { Card, TextAlign, Title } from "../view/ui"
import { ShapeLayout } from "../view/ShapeLayout"

interface ShapeVisualizerProps {
  dataElements: NestedDataElementArray[]
  shape: number[]
}

export const ShapeVisualizer: React.FC<ShapeVisualizerProps> = ({
  dataElements,
  shape,
}) => {
  return (
    <div>
      <ShapeVisualizerTitle />
      <Card maxWidth={1800} margin={10} center>
        <TextAlign>
          <ShapeLayout dataElements={dataElements} shape={shape} />
        </TextAlign>
      </Card>
    </div>
  )
}

const ShapeVisualizerTitle = () => <Title level={2}>Shape layout</Title>
