import { DataElement, MemorySlot } from "../model/dataElement"
import {
  arrangeIntoShape,
  constructDataElements,
} from "./constructDataElements"

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
