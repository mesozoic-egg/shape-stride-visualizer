import { DataElement, MemorySlot } from "../model/dataElement"
import {
  constructDataElementsForShape,
  fillGapInDataElements,
  fillMultiDimensionalArray,
} from "./constructDataElements"

describe("fillMultiDimensionalArray", () => {
  it("returns an empty array for empty shape and stride", () => {
    expect(fillMultiDimensionalArray([], [])).toEqual([])
  })

  it("creates a flat array for single dimension", () => {
    expect(fillMultiDimensionalArray([3], [1], 0)).toEqual([
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
    ])
  })

  it("creates a nested array for multiple dimensions", () => {
    expect(fillMultiDimensionalArray([2, 2], [2, 1], 0)).toEqual([
      [new DataElement(0), new DataElement(1)],
      [new DataElement(2), new DataElement(3)],
    ])
  })
})

describe("constructDataElementsForShape", () => {
  it("returns correct structure for valid input", () => {
    const [shape, flattened] = constructDataElementsForShape([2, 2], [0, 1])
    console.log(JSON.stringify(shape))
    expect(shape).toEqual([
      [new DataElement(0), new DataElement(1)],
      [new DataElement(0), new DataElement(1)],
    ])
    expect(flattened).toEqual([new DataElement(0), new DataElement(1)])
  })
})

describe("fillGapInDataElements", () => {
  it("should handle an empty array", () => {
    const elements: DataElement[] = []
    const result = fillGapInDataElements(elements)
    expect(result).toEqual([])
  })

  it("should handle an array with no gaps", () => {
    const elements = [
      new DataElement(1),
      new DataElement(2),
      new DataElement(3),
    ]
    const result = fillGapInDataElements(elements)
    expect(result).toEqual(elements)
  })

  it("should insert MemorySlots in gaps between DataElements", () => {
    const elements = [new DataElement(1), new DataElement(4)]
    const result = fillGapInDataElements(elements)
    expect(result).toEqual([
      new DataElement(1),
      new MemorySlot(2),
      new MemorySlot(3),
      new DataElement(4),
    ])
  })

  it("should handle multiple gaps correctly", () => {
    const elements = [
      new DataElement(1),
      new DataElement(5),
      new DataElement(10),
    ]
    const result = fillGapInDataElements(elements)
    expect(result).toEqual([
      new DataElement(1),
      new MemorySlot(2),
      new MemorySlot(3),
      new MemorySlot(4),
      new DataElement(5),
      new MemorySlot(6),
      new MemorySlot(7),
      new MemorySlot(8),
      new MemorySlot(9),
      new DataElement(10),
    ])
  })
})
