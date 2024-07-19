import { ShapeLayoutProps } from "../view/ShapeLayout"
import { NestedDataElementArray } from "../model/dataElement"

// This should closely mimic ShapeLayout for easier testing
export const shapelayoutTerminalOutput = ({
  shape,
  dataElements,
}: ShapeLayoutProps) => {
  if (shape.length === 0) {
    return ""
  }
  if (shape.length === 1) {
    let output = "["
    const elements = dataElements.map(
      (element) => `  ${element.toString().padEnd(4, " ")}`,
    )
    output += elements.join("")
    output += "  ]"
    return output
  } else {
    const range = Array.from({ length: shape[0] }, (_, i) => i)
    let output = "\n[\n"
    const _outputs = range
      .map((i) => {
        if (dataElements[i] === undefined) {
          throw new Error(`dataElements is undefined`)
        }
        return shapelayoutTerminalOutput({
          shape: shape.slice(1),
          dataElements: dataElements[i] as NestedDataElementArray,
        })
      })
      .map((item) => `  ${item}`)
    output += _outputs.join("\n")
    output += "\n]\n"
    return output
  }
}
