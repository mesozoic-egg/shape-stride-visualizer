import { Button } from "./ui"
import { NestedDataElementArray } from "../model/dataElement"

interface ShapeLayoutProps {
  shape: number[]
  dataElements: NestedDataElementArray[]
}
export const ShapeLayout: React.FC<ShapeLayoutProps> = ({
  shape,
  dataElements,
}) => {
  if (shape.length === 0 || dataElements.length === 0) {
    return null
  }
  if (shape.length === 1) {
    return (
      <div>
        <span>[</span>
        <span>
          {dataElements.map((element, i) => (
            <Button width={80} margin={2} antType="dashed" key={`data-${i}`}>
              {element.toString()}
            </Button>
          ))}
        </span>
        <span>]</span>
      </div>
    )
  } else {
    const range = Array.from({ length: shape[0] }, (_, i) => i)
    return (
      <div>
        <div>
          <span>[</span>
        </div>
        {range.map((i) => {
          if (dataElements[i] === undefined) {
            throw new Error(`dataElements[${i}] is undefined`)
          }
          return (
            <div key={i} style={{ marginLeft: `2ch` }}>
              <ShapeLayout
                shape={shape.slice(1)}
                dataElements={dataElements[i] as NestedDataElementArray[]}
              />
            </div>
          )
        })}
        <div>
          <span>]</span>
        </div>
      </div>
    )
  }
}
