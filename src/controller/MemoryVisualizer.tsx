import { DataElement } from "../model/dataElement"
import { fillGapInDataElements } from "../utils/constructDataElements"
import { Button, Card, Flex, Space, Text, Title } from "../view/ui"

interface MemoryVisualizerProps {
  dataElements: DataElement[]
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  dataElements,
}) => {
  if (dataElements.length === 0) {
    return null
  }
  const _dataElementsSorted = [...dataElements].sort((a, b) => a.address - b.address)
  const dataElementsNoGaps = fillGapInDataElements(_dataElementsSorted)
  return (
    <div>
      <MemoryTitle />
      <Explanation />
      <Space size={20} />
      <Card maxWidth={800} center>
        <Flex justify="flex-start" wrap="wrap" gap="middle">
          {dataElementsNoGaps.map((element) => (
            <div key={element.address}>
              <Button
                antType={element instanceof DataElement ? "default" : "text"}
                width={80}
              >
                {element.toString()}
              </Button>
            </div>
          ))}
        </Flex>
      </Card>
    </div>
  )
}

const MemoryTitle = () => <Title level={2}>Memory layout</Title>
const Explanation = () => (
  <Text>
    This is the memory layout of the elements. The 0x prefix means the number
    that follows is a memory address. Those with border surrounding it are the
    ones with values/data (those that will be referenced/shown in the shape
    layout). Those without are empty memory location skipped over due to stride
    set up.
  </Text>
)
