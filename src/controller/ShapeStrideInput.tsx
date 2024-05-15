import { useEffect, useState, useCallback } from "react"
import { ShapeStride } from "../model/shape"
import { Button, Card, Flex, Space, Text, TextAlign, Title } from "../view/ui"
import { ShapeStrideValidator } from "../utils/validateShapeStrides"
import { DeleteOutlined, PlusOutlined } from "../view/icons"
import { InputBox } from "./InputBox"

interface ShapeStrideInputProps {
  onConfirmShapeStrides: (shapeStrides: number[][]) => void
  validateShapeStrides?: ShapeStrideValidator
  initialShapeStrides?: ShapeStride[]
}
export const ShapeStrideInput: React.FC<ShapeStrideInputProps> = ({
  onConfirmShapeStrides,
  validateShapeStrides = () => undefined,
  initialShapeStrides = [new ShapeStride(2, 3, 0), new ShapeStride(3, 3, 1)],
}) => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  const [count, setCount] = useState<number>(3)
  const [shapeStrides, setShapeStrides] =
    useState<ShapeStride[]>(initialShapeStrides)
  const setShape = useCallback((id: number, shape: number) => {
    setShapeStrides((_shapeStrides) =>
      _shapeStrides.map((s) => (s.id === id ? { ...s, shape } : s)),
    )
  }, [])
  const setStride = useCallback((id: number, stride: number) => {
    setShapeStrides((_shapeStrides) =>
      _shapeStrides.map((s) => (s.id === id ? { ...s, stride } : s)),
    )
  }, [])
  const addShapeStrideTo = (position: "start" | "end") => {
    const shapeStride = new ShapeStride(1, position === "end" ? 1 : 0, count)
    setShapeStrides(
      position === "start"
        ? [shapeStride, ...shapeStrides]
        : [...shapeStrides, shapeStride],
    )
    setCount((_count) => _count + 1)
  }
  const removeShapeStride = (shapeStride: ShapeStride) => {
    setShapeStrides((_shapeStrides) =>
      _shapeStrides.filter((s) => s !== shapeStride),
    )
  }

  const shape = JSON.stringify(
    shapeStrides.map((shapeStride) => shapeStride.shape),
  )
  const stride = JSON.stringify(
    shapeStrides.map((shapeStride) => shapeStride.stride),
  )
  useEffect(() => {
    if (shape.length > 0) {
      const _shape = JSON.parse(shape)
      const _stride = JSON.parse(stride)
      const error = validateShapeStrides(_shape, _stride)
      if (error) {
        setErrorMsg(error.message)
      } else {
        setErrorMsg(undefined)
        onConfirmShapeStrides([_shape, _stride])
      }
    }
  }, [onConfirmShapeStrides, shape, stride, validateShapeStrides])

  return (
    <div>
      <InputAreaTitle />
      <Explanation />
      <Flex justify="flex-start" wrap="wrap">
        <Button antType="primary" onClick={() => addShapeStrideTo("start")}>
          <PlusOutlined />
        </Button>
        {shapeStrides.map((shapeStride, i) => (
          <div key={shapeStride.id}>
            <TextAlign align="center">
              <Card width={120} margin={10}>
                <label>Index: {i}</label>
                <InputBox
                  label="Shape"
                  id={shapeStride.id}
                  onValueConfirm={setShape}
                  prefilled={shapeStride.shape}
                />
                <InputBox
                  label="Stride"
                  id={shapeStride.id}
                  onValueConfirm={setStride}
                  prefilled={shapeStride.stride}
                />
                <Space size={10} />
                <Button
                  title="Delete ShapeStride"
                  aria-label={`Delete ShapeStride at index ${i}`}
                  antType="dashed"
                  onClick={() => removeShapeStride(shapeStride)}
                >
                  <DeleteOutlined />
                </Button>
              </Card>
            </TextAlign>
          </div>
        ))}
        <Button antType="primary" onClick={() => addShapeStrideTo("end")}>
          <PlusOutlined />
        </Button>
      </Flex>
      {errorMsg && <Text type="danger">Error: {errorMsg}</Text>}
    </div>
  )
}

const InputAreaTitle = () => <Title level={2}>Input</Title>
const Explanation = () => (
  <Text>
    Enter the shape and stride for each shape stride. The shape is the number of
    sides in the shape, and the stride is the number of spaces to move to the
    next shape stride. Leftmost shape/stride is zeroth, and rightmost is the
    last shape stride. Index is zero based.
  </Text>
)
