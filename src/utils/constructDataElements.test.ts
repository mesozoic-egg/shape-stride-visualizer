import {
  DataElement,
  MemorySlot,
  MaskedDataElement,
} from "../model/dataElement"
import { Variable, NumNode, Node } from "../model/variable"
import {
  arrangeIntoShape,
  constructDataElements,
  constructDataElementsForVarVals,
  constructShapeLayoutAsVarVals,
  constructVarValsForShape,
  substituteVarValsShapeLayout,
} from "./constructDataElements"

describe("constructDataElements", () => {
  it("should construct a flat array of DataElements for regular dimension & stride", () => {
    const args = { shape: [2, 3], stride: [1, 3] }
    const elements = constructDataElements(args)
    expect(elements.length).toBe(8)
    expect(elements).toStrictEqual([
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
    expect(elements).toStrictEqual([
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
    expect(arrangedElements).toStrictEqual([
      [new DataElement(0), new DataElement(1), new DataElement(2)],
      [new DataElement(3), new DataElement(4), new DataElement(5)],
    ])
    arrangedElements = arrangeIntoShape({
      dataElements,
      shape: [3, 2],
      stride: [2, 1],
    })
    expect(arrangedElements).toStrictEqual([
      [new DataElement(0), new DataElement(1)],
      [new DataElement(2), new DataElement(3)],
      [new DataElement(4), new DataElement(5)],
    ])
  })

  it("should handle masks", () => {
    const dataElements = [
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
      new MemorySlot(3),
      new DataElement(4),
      new DataElement(5),
      new DataElement(6),
      new MemorySlot(7),
      new DataElement(8),
      new DataElement(9),
      new DataElement(10),
      new MemorySlot(11),
      new DataElement(12),
      new DataElement(13),
      new DataElement(14),
    ]
    const expected = [
      [
        new MaskedDataElement(0),
        new DataElement(4),
        new DataElement(8),
        new MaskedDataElement(12),
      ],
      [
        new MaskedDataElement(1),
        new DataElement(5),
        new DataElement(9),
        new MaskedDataElement(13),
      ],
      [
        new MaskedDataElement(2),
        new MaskedDataElement(6),
        new MaskedDataElement(10),
        new MaskedDataElement(14),
      ],
    ]
    const result = arrangeIntoShape({
      dataElements,
      shape: [3, 4],
      stride: [1, 4],
      masks: [
        [0, 1],
        [1, 2],
      ],
    })
    expect(result).toStrictEqual(expected)
  })

  it("Should handle single dimension masks", () => {
    const dataElements = [
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
    ]
    const result = arrangeIntoShape({
      dataElements,
      shape: [3],
      stride: [1],
      masks: [[0, 1]],
    })
    const expected = [
      new DataElement(0),
      new DataElement(1),
      new MaskedDataElement(2),
    ]
    expect(result).toStrictEqual(expected)
  })

  it("should handle masks when stride is not 1", () => {
    const dataElements = [
      new DataElement(0),
      new MemorySlot(1),
      new MemorySlot(2),
      new DataElement(3),
      new MemorySlot(4),
      new MemorySlot(5),
      new DataElement(6),
      new MemorySlot(7),
      new MemorySlot(8),
      new DataElement(9),
    ]
    const expected = [
      [new DataElement(0), new DataElement(3), new MaskedDataElement(6)],
      [new DataElement(3), new DataElement(6), new MaskedDataElement(9)],
    ]
    const result = arrangeIntoShape({
      dataElements,
      shape: [2, 3],
      stride: [3, 3],
      masks: [
        [0, 1],
        [0, 1],
      ],
    })
    expect(result).toStrictEqual(expected)
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
    expect(arranged).toStrictEqual([
      [
        [new DataElement(0), new DataElement(1), new DataElement(2)],
        [new DataElement(3), new DataElement(4), new DataElement(5)],
      ],
    ])
  })
})

describe("construct var vals for shape", () => {
  test.each([
    [
      [new Variable("idx0", 0, 2), new Variable("idx1", 0, 1)],
      [
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(1)],
        ]),
        new Map([
          ["idx0", new NumNode(1)],
          ["idx1", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(1)],
          ["idx1", new NumNode(1)],
        ]),
        new Map([
          ["idx0", new NumNode(2)],
          ["idx1", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(2)],
          ["idx1", new NumNode(1)],
        ]),
      ],
    ],
    [
      [
        new Variable("idx0", 0, 0),
        new Variable("idx1", 0, 0),
        new Variable("idx2", 0, 3),
        new Variable("idx3", 0, 1),
      ],
      [
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(0)],
          ["idx3", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(0)],
          ["idx3", new NumNode(1)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(1)],
          ["idx3", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(1)],
          ["idx3", new NumNode(1)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(2)],
          ["idx3", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(2)],
          ["idx3", new NumNode(1)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(3)],
          ["idx3", new NumNode(0)],
        ]),
        new Map([
          ["idx0", new NumNode(0)],
          ["idx1", new NumNode(0)],
          ["idx2", new NumNode(3)],
          ["idx3", new NumNode(1)],
        ]),
      ],
    ],
  ])("test %s", (shape, expected) => {
    const varValsArray = constructVarValsForShape({ shape })
    expect(varValsArray).toStrictEqual(expected)
  })
})

describe("constructDataElementsForVarVals", () => {
  it("simple case", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const shape = [idx0, idx1]
    const stride = [2, 1]
    let expression: Node = new NumNode(0)
    for (let i = 0; i < shape.length; i++) {
      expression = expression.add(shape[i].mul(new NumNode(stride[i])))
    }
    const varValsArray = [
      new Map([
        [idx0.name, new NumNode(0)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(0)],
        [idx1.name, new NumNode(1)],
      ]),
      new Map([
        [idx0.name, new NumNode(1)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(1)],
        [idx1.name, new NumNode(1)],
      ]),
      new Map([
        [idx0.name, new NumNode(2)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(2)],
        [idx1.name, new NumNode(1)],
      ]),
    ]
    const dataElements = constructDataElementsForVarVals({
      varValsArray,
      expression,
    })
    expect(dataElements).toStrictEqual([
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
      new DataElement(3),
      new DataElement(4),
      new DataElement(5),
    ])
  })

  it("((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const shape = [idx0, idx1]

    const varValsArray = [
      new Map([
        [idx0.name, new NumNode(0)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(0)],
        [idx1.name, new NumNode(1)],
      ]),
      new Map([
        [idx0.name, new NumNode(1)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(1)],
        [idx1.name, new NumNode(1)],
      ]),
      new Map([
        [idx0.name, new NumNode(2)],
        [idx1.name, new NumNode(0)],
      ]),
      new Map([
        [idx0.name, new NumNode(2)],
        [idx1.name, new NumNode(1)],
      ]),
    ]

    // ((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))"
    const expression = idx0
      .mul(new NumNode(2))
      .mod(new NumNode(3))
      .add(idx1)
      .mod(new NumNode(3))
      .mul(new NumNode(3))
      .add(
        idx0
          .mul(new NumNode(2))
          .add(idx1)
          .floordiv(new NumNode(3))
          .mul(new NumNode(3)),
      )
    const dataElements = constructDataElementsForVarVals({
      varValsArray,
      expression,
    })
    const expected = [
      new DataElement(0),
      new MemorySlot(1),
      new MemorySlot(2),
      new DataElement(3),
      new MemorySlot(4),
      new MemorySlot(5),
      new DataElement(6),
      new MemorySlot(7),
      new MemorySlot(8),
      new DataElement(9),
    ]
    expect(dataElements).toStrictEqual(expected)
  })
})

describe("constructShapeLayoutAsVarVals", () => {
  it("simple case", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const expression = idx0.mul(new NumNode(2)).add(idx1.mul(new NumNode(1)))
    const varValsArray = [
      [
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
    ]
    const dataElements = [
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
      new DataElement(3),
      new DataElement(4),
      new DataElement(5),
    ]
    const layout = substituteVarValsShapeLayout({
      dataElements: dataElements,
      shapeLayout: varValsArray,
      expression: expression,
    })
    expect(layout).toStrictEqual([
      [new DataElement(0), new DataElement(1)],
      [new DataElement(2), new DataElement(3)],
      [new DataElement(4), new DataElement(5)],
    ])
  })

  it("((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const varValsArray = [
      [
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
    ]
    const dataElements = [
      new DataElement(0),
      new MemorySlot(1),
      new MemorySlot(2),
      new DataElement(3),
      new MemorySlot(4),
      new MemorySlot(5),
      new DataElement(6),
      new MemorySlot(7),
      new MemorySlot(8),
      new DataElement(9),
    ]
    // ((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))"
    const expression = idx0
      .mul(new NumNode(2))
      .mod(new NumNode(3))
      .add(idx1)
      .mod(new NumNode(3))
      .mul(new NumNode(3))
      .add(
        idx0
          .mul(new NumNode(2))
          .add(idx1)
          .floordiv(new NumNode(3))
          .mul(new NumNode(3)),
      )
    const layout = substituteVarValsShapeLayout({
      dataElements: dataElements,
      shapeLayout: varValsArray,
      expression: expression,
    })
    expect(layout).toStrictEqual([
      [new DataElement(0), new DataElement(3)],
      [new DataElement(6), new DataElement(3)],
      [new DataElement(6), new DataElement(9)],
    ])
  })

  it("simple case with valid", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const expression = idx0.mul(new NumNode(2)).add(idx1.mul(new NumNode(1)))
    const varValsArray = [
      [
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
    ]
    const dataElements = [
      new DataElement(0),
      new DataElement(1),
      new DataElement(2),
      new DataElement(3),
      new DataElement(4),
      new DataElement(5),
    ]
    const validExpression = idx0.lt(new NumNode(2)).and(idx1.lt(new NumNode(1)))
    const layout = substituteVarValsShapeLayout({
      dataElements: dataElements,
      shapeLayout: varValsArray,
      expression: expression,
      validExpression,
    })
    expect(layout).toStrictEqual([
      [new DataElement(0), new MaskedDataElement(1)],
      [new DataElement(2), new MaskedDataElement(3)],
      [new MaskedDataElement(4), new MaskedDataElement(5)],
    ])
  })

  it("((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3)) with valid", () => {
    const idx0 = new Variable("idx0", 0, 2)
    const idx1 = new Variable("idx1", 0, 1)
    const varValsArray = [
      [
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(0)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(1)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
      [
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(0)],
        ]),
        new Map([
          [idx0.name, new NumNode(2)],
          [idx1.name, new NumNode(1)],
        ]),
      ],
    ]
    const dataElements = [
      new DataElement(0),
      new MemorySlot(1),
      new MemorySlot(2),
      new DataElement(3),
      new MemorySlot(4),
      new MemorySlot(5),
      new DataElement(6),
      new MemorySlot(7),
      new MemorySlot(8),
      new DataElement(9),
    ]
    // ((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))"
    const expression = idx0
      .mul(new NumNode(2))
      .mod(new NumNode(3))
      .add(idx1)
      .mod(new NumNode(3))
      .mul(new NumNode(3))
      .add(
        idx0
          .mul(new NumNode(2))
          .add(idx1)
          .floordiv(new NumNode(3))
          .mul(new NumNode(3)),
      )

    const validExpression = idx0.lt(new NumNode(2)).and(idx1.lt(new NumNode(1)))

    const layout = substituteVarValsShapeLayout({
      dataElements: dataElements,
      shapeLayout: varValsArray,
      expression: expression,
      validExpression,
    })

    expect(layout).toStrictEqual([
      [new DataElement(0), new MaskedDataElement(3)],
      [new DataElement(6), new MaskedDataElement(3)],
      [new MaskedDataElement(6), new MaskedDataElement(9)],
    ])
  })
})
