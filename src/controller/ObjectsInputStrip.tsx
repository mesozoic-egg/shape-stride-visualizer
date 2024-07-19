import { useEffect, useState, useCallback } from "react"
import { Button, Card, Flex, Space, Text, TextAlign } from "../view/ui"
import { DeleteOutlined, PlusOutlined } from "../view/icons"
import { InputBox, AttributeValidator } from "./InputBoxGeneric"

interface Attribute {
  key: string
  value: string | number
  disabled?: boolean
  type: string
}
interface GenericObjectInterface {
  id: number
  attributes: Attribute[]
}

export type AttributesValidators = Record<string, AttributeValidator>

interface ObjectInputStripProps<
  ObjectInterface extends GenericObjectInterface,
> {
  onConfirm: (objects: ObjectInterface[]) => void
  validate: (objs: ObjectInterface[]) => boolean
  attributeValidators: AttributesValidators
  initializer: () => ObjectInterface[]
  constructor: (id: number) => ObjectInterface
  initialCount: number
  addButtonLeft?: boolean
  addButtonRight?: boolean
}

export const ObjectInputStrip = <
  ObjectInterface extends GenericObjectInterface,
>({
  onConfirm,
  validate,
  initializer,
  constructor,
  attributeValidators,
  initialCount,
  addButtonLeft,
  addButtonRight,
}: ObjectInputStripProps<ObjectInterface>): React.ReactElement => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  const [count, setCount] = useState<number>(initialCount)
  const [objects, setObjects] = useState<ObjectInterface[]>(initializer())
  const setObjectValue = useCallback(
    (id: number, key: string) => (value: string | number) => {
      setObjects((_objects) => {
        const _object = _objects.find((o) => o.id === id)
        if (!_object) {
          throw new Error(`Object with id ${id} not found`)
        }
        const attr = _object.attributes.find((attr) => attr.key === key)
        if (!attr) {
          throw new Error(`Attribute with key ${key} not found`)
        }
        if (attr.value === value) {
          return _objects
        }
        return _objects.map((o) => {
          return o.id === id
            ? {
                ...o,
                attributes: o.attributes.map((attr) =>
                  attr.key === key ? { ...attr, value } : attr,
                ),
              }
            : o
        })
      })
    },
    [],
  )
  const addObjects = (position: "start" | "end") => {
    const _object = constructor(count)
    setObjects((_objects) => {
      if (position === "end") {
        return [..._objects, _object]
      } else if (position === "start") {
        return [_object, ..._objects]
      }
      throw new Error("Invalid position keyword specified")
    })
    setCount((_count) => _count + 1)
  }
  const removeObject = (object: ObjectInterface) => {
    setObjects((_objects) => _objects.filter((o) => o !== object))
  }

  useEffect(() => {
    if (validate(objects)) {
      onConfirm(objects)
    }
  }, [onConfirm, objects, validate])
  return (
    <div>
      <Flex justify="flex-start" wrap="wrap">
        {addButtonLeft && (
          <Button antType="primary" onClick={() => addObjects("start")}>
            <PlusOutlined />
          </Button>
        )}
        {objects.map((_object, i) => (
          <div key={_object.id}>
            <TextAlign align="center">
              <Card width={120} margin={10}>
                <label>Index: {i}</label>
                {_object.attributes.map((attr) => {
                  const validator = attributeValidators[attr.key]
                  if (!validator) {
                    console.error("Attributes validators:", attributeValidators)
                    throw new Error(`No validator for attribute ${attr.key}`)
                  }
                  return (
                    <InputBox
                      label={attr.key}
                      id={_object.id}
                      key={attr.key}
                      onValueConfirm={setObjectValue(_object.id, attr.key)}
                      prefilled={attr.value}
                      validator={validator}
                      disabled={attr.disabled}
                      type={attr.type}
                    />
                  )
                })}
                <Space size={10} />
                <Button
                  title="Delete ShapeStride"
                  aria-label={`Delete ShapeStride at index ${i}`}
                  antType="dashed"
                  onClick={() => removeObject(_object)}
                >
                  <DeleteOutlined />
                </Button>
              </Card>
            </TextAlign>
          </div>
        ))}
        {addButtonRight && (
          <Button antType="primary" onClick={() => addObjects("end")}>
            <PlusOutlined />
          </Button>
        )}
      </Flex>
      {errorMsg && <Text type="danger">Error: {errorMsg}</Text>}
    </div>
  )
}
