import {
  DataElement,
  MemorySlot,
  NestedDataElementArray,
} from "../model/dataElement"

export const constructDataElementsForShape = (
  shape: number[],
  stride: number[],
) => {
  const depth = shape.length
  if (depth === 0) {
    return [[], []]
  }
  const elementsAsShape = fillMultiDimensionalArray(shape, stride)
  const elementsAsFlat = dedupDataElements(
    elementsAsShape.flat(depth as 1) as DataElement[],
  ) as DataElement[]
  const result: [NestedDataElementArray[], DataElement[]] = [
    elementsAsShape,
    elementsAsFlat,
  ]
  return result
}

const dedupDataElements = (elements: DataElement[]) => {
  const uniqueAddress = new Set()
  const uniqueElements = []
  for (const element of elements) {
    if (!uniqueAddress.has(element.address)) {
      uniqueAddress.add(element.address)
      uniqueElements.push(element)
    }
  }
  return uniqueElements
}

export const fillMultiDimensionalArray = (
  shape: number[],
  stride: number[],
  start = 0,
) => {
  if (shape.length === 0) {
    return [] // Base case: no more dimensions to process
  }

  const currentDimensionSize = shape[0]
  const restDimensions = shape.slice(1)
  const currentStride = stride[0]
  const restStrides = stride.slice(1)

  let result: NestedDataElementArray[] = []
  let currentStart = start

  for (let i = 0; i < currentDimensionSize; i++) {
    if (restDimensions.length === 0) {
      const element = new DataElement(currentStart)
      result.push(element)
      currentStart += currentStride
    } else {
      // Recursively fill the next dimension
      result.push(
        fillMultiDimensionalArray(restDimensions, restStrides, currentStart),
      )
      currentStart += currentStride
    }
  }

  return result
}

export const fillGapInDataElements = (elements: DataElement[]) => {
  let lastElementAddress = 0
  const result: (DataElement | MemorySlot)[] = []
  elements.forEach((element, i) => {
    if (i === 0) {
      lastElementAddress = element.address
      result.push(element)
      return
    }
    let gap = element.address - lastElementAddress
    while (gap > 1) {
      result.push(new MemorySlot(++lastElementAddress))
      gap--
    }
    result.push(element)
    lastElementAddress = element.address
  })
  return result
}

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
