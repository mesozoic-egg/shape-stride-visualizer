import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ShapeLayout } from "./ShapeLayout"
import { DataElement, NestedDataElementArray } from "../model/dataElement"

describe("ShapeLayout Component", () => {
  it("renders buttons for each data element when shape length is 1", () => {
    const dataElements = [
      [
        [new DataElement(0), new DataElement(1), new DataElement(2)],
        [new DataElement(3), new DataElement(4), new DataElement(5)],
      ],
      [
        [new DataElement(6), new DataElement(7), new DataElement(8)],
        [new DataElement(9), new DataElement(10), new DataElement(11)],
      ],
    ]
    const { debug } = render(
      <ShapeLayout
        shape={[2, 2, 3]}
        dataElements={dataElements as NestedDataElementArray[]}
      />,
    )
  })
})
