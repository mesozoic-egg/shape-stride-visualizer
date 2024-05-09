
import { DataElement, NestedDataElementArray } from '../model/dataElement';
import { Button, Card, Flex, TextAlign } from '../view';
import { ShapeLayout } from './ShapeVisualizer2';

interface ShapeVisualizerProps {
  dataElements: NestedDataElementArray[];
  shape: number[]
}

export const ShapeVisualizer: React.FC<ShapeVisualizerProps> = ({ dataElements, shape }) => {
  return <div>
    <Card maxWidth={600} margin={10}>
      <TextAlign>
        <ShapeLayout dataElements={dataElements} shape={shape} />
      </TextAlign>
    </Card>
  </div>
}

