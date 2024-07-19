import { useEffect, useState, useCallback } from "react"
import { ShapeStride } from "../model/shape"
import { Text, Title } from "../view/ui"
import { ShapeStrideValidator } from "../utils/validateShapeStrides"
import { ObjectInputStrip } from "./ObjectsInputStrip"
export interface ShapeStrideMasks {
  shape: number[]
  strides: number[]
  masks?: [number, number][]
}
interface ShapeStrideInputProps {
  onConfirmShapeStrides: (shapeStrides: ShapeStrideMasks) => void
  validateShapeStrides?: ShapeStrideValidator
  initialShapeStrides?: ShapeStride[]
}

interface ShapeStridesInterface {
  id: number
  attributes: {
    key: string
    value: number | string
    type: string
  }[]
}

const attributesValidator: Record<
  string,
  (value: string | number) => [boolean, string]
> = {
  shape: (s: string | number) =>
    /^\d+$/.test(s.toString())
      ? [true, ""]
      : [false, "Enter a value of type number or string"],
  stride: (s: string | number) =>
    /^\d+$/.test(s.toString())
      ? [true, ""]
      : [false, "Enter a value of type number or string"],
  mask: (s: string | number) =>
    /^\d+,\d+$/.test(s.toString())
      ? [true, ""]
      : [false, "Enter comma delimited value without space"],
}

const constructor = (
  id: number,
  opt?: {
    shape: number
    stride: number
    mask?: number
  },
) => {
  return {
    id,
    attributes: [
      {
        key: "shape",
        value: opt?.shape ?? 1,
        type: "number",
      },
      {
        key: "stride",
        value: opt?.stride ?? 1,
        type: "number",
      },
      {
        key: "mask",
        value: opt?.mask ?? "0,0",
        type: "string",
      },
    ],
  }
}

const parseMask = (mask?: string): [number, number] | undefined => {
  if (!mask) return undefined
  const [start, end] = mask.split(",")
  return [parseInt(start), parseInt(end)]
}
const parseMasks = (masks: string): [number, number][] => {
  return masks
    .split("::")
    .map(parseMask)
    .filter((mask): mask is [number, number] => mask !== undefined)
}

export const ShapeStrideInput: React.FC<ShapeStrideInputProps> = ({
  onConfirmShapeStrides,
  validateShapeStrides = () => undefined,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  const [shapeStrides, setShapeStrides] = useState<ShapeStridesInterface[]>([])
  const initializer = useCallback(() => {
    return [
      constructor(0, { shape: 2, stride: 3 }),
      constructor(1, { shape: 3, stride: 3 }),
    ]
  }, [])

  const shape = JSON.stringify(
    shapeStrides.map(
      (shapeStride) =>
        shapeStride.attributes.find((attr) => attr.key === "shape")?.value,
    ),
  )
  const stride = JSON.stringify(
    shapeStrides.map(
      (shapeStride) =>
        shapeStride.attributes.find((attr) => attr.key === "stride")?.value,
    ),
  )
  const masks = shapeStrides
    .map(
      (shapeStride) =>
        shapeStride.attributes.find((attr) => attr.key === "mask")?.value,
    )
    .join("::")
  useEffect(() => {
    if (shape.length > 0) {
      const _shape = JSON.parse(shape)
      const _stride = JSON.parse(stride)
      const _mask = parseMasks(masks)
      const error = validateShapeStrides(_shape, _stride, _mask)
      if (error) {
        setErrorMsg(error.message)
      } else {
        setErrorMsg(undefined)
        onConfirmShapeStrides({
          shape: _shape,
          strides: _stride,
          masks: _mask,
        })
      }
    }
  }, [onConfirmShapeStrides, shape, stride, validateShapeStrides, masks])

  return (
    <div>
      <InputAreaTitle />
      <Explanation />
      <ObjectInputStrip<ShapeStridesInterface>
        onConfirm={(_shapeStrides) => {
          setShapeStrides(_shapeStrides)
        }}
        initializer={initializer}
        initialCount={2}
        constructor={constructor}
        validate={() => true}
        attributeValidators={attributesValidator}
        addButtonRight
        addButtonLeft
      />
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
