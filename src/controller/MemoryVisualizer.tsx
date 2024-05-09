import { DataElement } from "../model/dataElement"
import { fillGapInDataElements } from "../utils/constructDataElements"
import { Button, Flex } from "../view"

interface MemoryVisualizerProps {
  dataElements: DataElement[]
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  dataElements,
}) => {
  if (dataElements.length === 0) {
    return null
  }
  const dataElementsNoGaps = fillGapInDataElements(dataElements)
  return (
    <div>
      <Flex justify="flex-start" wrap="wrap">
        {dataElementsNoGaps.map((element) => (
          <div key={element.address}>
            <Button
              antType={element instanceof DataElement ? "default" : "text"}
            >
              {element.toString()}
            </Button>
          </div>
        ))}
      </Flex>
    </div>
  )
}
