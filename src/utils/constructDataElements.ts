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
