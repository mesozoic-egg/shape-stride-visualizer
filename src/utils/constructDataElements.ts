import {
  DataElement,
  MemorySlot,
  NestedDataElementArray,
} from "../model/dataElement"

const START = 0
interface ConstructDataElementsArgs {
  shape: number[]
  stride: number[]
}
type DataElements = (DataElement | MemorySlot)[]
export const constructDataElements = ({
  shape,
  stride,
}: ConstructDataElementsArgs) => {
  const elements: DataElement[] = []
  const construct = (shape: number[], stride: number[], address: number) => {
    if (shape.length === 1) {
      for (let i = 0; i < shape[0]; i++) {
        const _address = address + i * stride[0]
        if (!elements[_address]) {
          elements[_address] = new DataElement(_address)
        }
      }
    }
    for (let i = 0; i < shape[0]; i++) {
      construct(shape.slice(1), stride.slice(1), address)
      address += stride[0]
    }
    return elements
  }
  construct(shape, stride, START)
  for (let i = 0; i < elements.length; i++) {
    if (!elements[i]) {
      elements[i] = new MemorySlot(i)
    }
  }
  return elements
}

interface ArangeIntoShapeArgs {
  dataElements: DataElements
  shape: number[]
  stride: number[]
}
export const arrangeIntoShape = ({
  dataElements,
  shape,
  stride,
}: ArangeIntoShapeArgs) => {
  const fill = (_shape: number[], _stride: number[], address: number) => {
    if (_shape.length === 1) {
      const elements: DataElement[] = []
      for (let i = 0; i < _shape[0]; i++) {
        const elem = dataElements[address + i * _stride[0]]
        if (!elem) {
          throw new Error(
            "dataElements must contain all the elements in the shape",
          )
        }
        elements.push(elem)
      }
      return elements
    }
    const elements: NestedDataElementArray[] = []
    for (let i = 0; i < _shape[0]; i++) {
      elements.push(fill(_shape.slice(1), _stride.slice(1), address))
      address += _stride[0]
    }
    return elements
  }
  try {
    return fill(shape, stride, START)
  } catch (e) {
    console.error(e)
    return []
  }
}
