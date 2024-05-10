import { DataElement, MemorySlot } from "../model/dataElement"
import {
  arrangeIntoShape,
  constructDataElements,
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

describe("constructDataElements", () => {
  it("should construct a flat array of DataElements for regular dimension & stride", () => {
    const args = { shape: [2, 3], stride: [1, 3] }
    const elements = constructDataElements(args)
    expect(elements.length).toBe(8)
    expect(elements).toEqual([
      new DataElement(0),
      new DataElement(1),
      new MemorySlot(2),
      new DataElement(3),
      new DataElement(4),
      new MemorySlot(5),
      new DataElement(6),
      new DataElement(7),
    ])
  })

  it("should handle stride of zero for a nested array of DataElements for multiple dimensions", () => {
    const args = { shape: [2, 3], stride: [3, 0] }
    const elements = constructDataElements(args)
    expect(elements.length).toBe(4)
    expect(elements).toEqual([
      new DataElement(0),
      new MemorySlot(1),
      new MemorySlot(2),
      new DataElement(3),
    ])
  })
})

describe("arangeIntoShape function", () => {
  it("should correctly arrange data elements into a specified shape and stride", () => {
    const dataElements = [
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
      new DataElement(3),
      new DataElement(4),
      new DataElement(5),
    ]
    let arrangedElements = arrangeIntoShape({
      dataElements,
      shape: [2, 3],
      stride: [3, 1],
    })
    expect(arrangedElements).toEqual([
      [new DataElement(0), new DataElement(1), new DataElement(2)],
      [new DataElement(3), new DataElement(4), new DataElement(5)],
    ])
    arrangedElements = arrangeIntoShape({
      dataElements,
      shape: [3, 2],
      stride: [2, 1],
    })
    expect(arrangedElements).toEqual([
      [new DataElement(0), new DataElement(1)],
      [new DataElement(2), new DataElement(3)],
      [new DataElement(4), new DataElement(5)],
    ])
  })
})

describe("construct elements and arrange", () => {
  it("should handle more than 2 dimensions", () => {
    const args = { shape: [1, 2, 3], stride: [0, 3, 1] }
    const elements = constructDataElements(args)
    const arranged = arrangeIntoShape({
      dataElements: elements,
      shape: args.shape,
      stride: args.stride,
    })
    expect(arranged).toEqual([
      [
        [new DataElement(0), new DataElement(1), new DataElement(2)],
        [new DataElement(3), new DataElement(4), new DataElement(5)],
      ],
    ])
  })
})
