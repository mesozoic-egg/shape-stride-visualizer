import { DataElement } from "../model/dataElement"
import { Button, Card, Flex, Space, Title } from "../view/ui"

interface MemoryVisualizerProps {
  dataElements: DataElement[]
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  dataElements,
}) => {
  if (dataElements.length === 0) {
    return null
  }
  return (
    <div>
      <MemoryTitle />
      <Space size={20} />
      <Card maxWidth={800}>
        <Flex justify="flex-start" wrap="wrap" gap="middle">
          {dataElements.map((element) => (
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
