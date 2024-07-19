import { Button, NoWrap } from "./ui"
import {
  NestedDataElementArray,
  DataElementMaybeMasked,
  MaskedDataElement,
} from "../model/dataElement"

interface ButtonMaybeMaskedProps {
  masked?: boolean
  children: React.ReactNode
}
const ButtonMaybeMasked: React.FC<ButtonMaybeMaskedProps> = ({
  masked,
  children,
}) => {
  return (
    <Button width={80} margin={2} antType={masked ? "dashed" : "primary"}>
      {children}
    </Button>
  )
}
export interface ShapeLayoutProps {
  shape: number[]
  dataElements: NestedDataElementArray
}
export const ShapeLayout: React.FC<ShapeLayoutProps> = ({
  shape,
  dataElements,
}) => {
  if (shape.length === 0) {
    return null
  }
  if (shape.length === 1) {
    return (
      <div>
        <span>[</span>
        <span>
          {(dataElements as DataElementMaybeMasked[]).map((element, i) => {
            return (
              <ButtonMaybeMasked
                key={`data-${i}`}
                masked={element instanceof MaskedDataElement}
              >
                {element.toString()}
              </ButtonMaybeMasked>
            )
          })}
        </span>
        <span>]</span>
      </div>
    )
  } else {
    const range = Array.from({ length: shape[0] }, (_, i) => i)
    return (
      <div>
        <NoWrap>
          <div>
            <span>[</span>
          </div>
          {range.map((i) => {
            if (dataElements[i] === undefined) {
              console.error({ dataElements, shape })
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
        </NoWrap>
      </div>
    )
  }
}
