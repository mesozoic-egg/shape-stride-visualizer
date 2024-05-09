import { useEffect, useState, useCallback } from "react"
import { ShapeStride } from "../model/shape"
import {
  Button,
  Card,
  Flex,
  InputNumber,
  Text,
  Title,
} from "../view/ui"

interface ShapeStrideInputProps {
  onConfirmShapeStrides: (shapeStrides: number[][]) => void
}
export const ShapeStrideInput: React.FC<ShapeStrideInputProps> = ({
  onConfirmShapeStrides,
}) => {
  const [count, setCount] = useState<number>(3)
  const [shapeStrides, setShapeStrides] = useState<ShapeStride[]>([
    new ShapeStride(2, 9, 0),
    new ShapeStride(3, 3, 1),
    new ShapeStride(3, 1, 2),
  ])
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
      console.log({ shape, stride })
      onConfirmShapeStrides([JSON.parse(shape), JSON.parse(stride)])
    }
  }, [onConfirmShapeStrides, shape, stride])

  return (
    <div>
      <InputAreaTitle />
      <Explanation />
      <Flex justify="center" wrap="wrap">
        <Button antType="primary" onClick={() => addShapeStrideTo("start")}>
          Add
        </Button>
        {shapeStrides.map((shapeStride, i) => (
          <div key={shapeStride.id}>
            <Card width={150} margin={10}>
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
              <Button
                antType="dashed"
                onClick={() => removeShapeStride(shapeStride)}
              >
                Remove
              </Button>
            </Card>
          </div>
        ))}
        <Button antType="primary" onClick={() => addShapeStrideTo("end")}>
          Add
        </Button>
      </Flex>
    </div>
  )
}

interface InputBoxProps {
  label: string
  onValueConfirm: (id: number, value: number) => void
  id: number
  prefilled?: string | number
}
const InputBox: React.FC<InputBoxProps> = ({
  prefilled = "",
  label,
  onValueConfirm,
  id,
}) => {
  const [value, setValue] = useState<string | number>(prefilled)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  useEffect(() => {
    if (value !== undefined && !isNaN(Number(value))) {
      setErrorMsg(undefined)
      onValueConfirm(id, Number(value))
    } else {
      setErrorMsg("Enter an integer")
    }
  }, [id, value, onValueConfirm])
  return (
    <div>
      <label>{label}</label>
      <InputNumber
        width={50}
        value={value as any}
        onChange={(e) => setValue(e.target.value)}
      />
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
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
