
import { DataElement, NestedDataElementArray } from '../model/dataElement';
import { Button, Card, Flex, TextAlign } from '../view';

interface ShapeVisualizerProps {
  dataElements: NestedDataElementArray[];
  shape: number[]
}

const indent = 2

export const ShapeVisualizer: React.FC<ShapeVisualizerProps> = ({ dataElements, shape }) => {
  const renderData = (data: NestedDataElementArray[], shape: number[]) => {
    if (data.length === 0) {
      return null
    }
    const indentation = ' '.repeat(indent);
    let elements = [];
    if (shape.length === 1) {
      elements.push(<span key="opening-bracket">[</span>);
    } else {
      elements.push(<div key="opening-bracket">[</div>);
    }

    for (let i = 0; i < shape[0]; i++) {
      if (shape.length === 1) {
        elements.push(<Button width={80} margin={2} antType='dashed' key={`data-${i}`}>{data[i].toString()}</Button>);
      } else {
        const childData = renderData(data[i] as NestedDataElementArray[], shape.slice(1));
        elements.push(
          <div key={`nested-${i}`} style={{ marginLeft: `${indent}ch` }}>
            {childData}
          </div>
        );
      }
    }

    if (shape.length === 1) {
      elements.push(<span key="closing-bracket"> ]</span>);
    } else {
      elements.push(<div key="closing-bracket">{indentation}]</div>);
    }

    return elements;
  };
  return <div>
    <Card maxWidth={600} margin={10}>
      <TextAlign>
        {renderData(dataElements, shape)}
      </TextAlign>
    </Card>
  </div>
}

