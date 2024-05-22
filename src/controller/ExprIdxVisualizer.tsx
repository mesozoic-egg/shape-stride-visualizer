import { useEffect, useState, useCallback } from "react"
import { Variable, Node } from "../model/variable"
import {
  constructDataElementsForVarVals,
  constructShapeLayoutAsVarVals,
  constructVarValsForShape,
  substituteVarValsShapeLayout,
} from "../utils/constructDataElements"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { Title, Text, NoWrap } from "../view/ui"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { ObjectInputStrip } from "./ObjectsInputStrip"
import { ExpressionInput, EXAMPLES } from "./ExpressionInput"
import { parse, validateExpressionInput } from "../utils/exprParser"
import { validateShapeLayout } from "../utils/validateShapeStrides"
interface VariableInterface {
  id: number
  attributes: {
    key: string
    value: string | number
    disabled?: boolean
  }[]
}

const attributesValidator = {
  name: (s: string | number) => /[a-z]/.test(s.toString()),
  min: (s: string | number) => /^\d+$/.test(s.toString()),
  max: (s: string | number) => /^\d+$/.test(s.toString()),
}
const constructor = (id: number, opt?: { min?: number; max?: number }) => {
  return {
    id,
    attributes: [
      {
        key: "name",
        value: `idx${id}`,
      },
      {
        key: "min",
        value: opt?.min ?? 0,
        disabled: true,
      },
      {
        key: "max",
        value: opt?.max ?? 1,
      },
    ],
  }
}

export const ExprIdxVisualizer = () => {
  const [variables, setVariables] = useState<VariableInterface[]>([])
  const [variableNodes, setVariableNodes] = useState<Variable[]>([])
  const initializer = useCallback(() => {
    return [
      constructor(0, { min: 0, max: 2 }),
      constructor(1, { min: 0, max: 1 }),
    ]
  }, [])
  const [typed, setTyped] = useState("")
  const [expression, setExpression] = useState<Node>()
  const [err, setErr] = useState("")
  const [renderLayoutErr, setRenderLayoutErr] = useState("")
  const [dataElements, setDataElements] = useState<DataElement[]>()
  const [layoutDataObject, setLayoutDataObject] = useState<{
    layout: NestedDataElementArray
    shape: number[]
  }>()
  const resetComputed = useCallback(() => {
    setDataElements([])
    setLayoutDataObject(undefined)
  }, [])
  useEffect(() => {
    if (variables.length) {
      resetComputed()
      const vars = variables.map((v) => {
        const _name = v.attributes.find((a) => a.key === "name")?.value
        const _min = v.attributes.find((a) => a.key === "min")?.value
        const _max = v.attributes.find((a) => a.key === "max")?.value
        if (_name === undefined || _min === undefined || _max === undefined) {
          console.error({ v })
          throw new Error("Invalid variable")
        }
        const name = _name.toString()
        const min = Number(_min)
        const max = Number(_max)
        if (isNaN(min) || isNaN(max)) {
          throw new Error("Invalid min and max value")
        }
        return new Variable(name.toString(), min, max)
      })
      const variableNodes = vars
      const variablesMap = variableNodes.reduce(
        (acc, v) => {
          acc[v.name] = v
          return acc
        },
        {} as Record<string, Variable>,
      )
      if (typed) {
        resetComputed()
        const [valid, _err] = validateExpressionInput({
          expression: typed,
          variables: variablesMap,
        })
        if (!valid) {
          setErr(_err)
          return
        }
        setErr("")
        try {
          const variableMap = variableNodes.reduce(
            (acc, v) => {
              acc[v.name] = v
              return acc
            },
            {} as Record<string, Variable>,
          )
          const _expression = parse({
            expression: typed,
            variables: variableMap,
          })
          const expression = _expression
          const shape = variableNodes
          const shapeAsNum = variableNodes.map((v) => v.max + 1)
          const varValsArray = constructVarValsForShape({
            shape,
          })
          const _dataElements = constructDataElementsForVarVals({
            varValsArray,
            expression,
          })
          const varValsShape = constructShapeLayoutAsVarVals({ shape })
          const dataElementsLayout = substituteVarValsShapeLayout({
            dataElements: _dataElements,
            shapeLayout: varValsShape,
            expression,
          })
          const [valid, errMsg] = validateShapeLayout({
            shape: shapeAsNum,
            dataElements: dataElementsLayout,
          })
          if (valid) {
            setRenderLayoutErr("")
            setDataElements(_dataElements)
            setLayoutDataObject({
              layout: dataElementsLayout,
              shape: shapeAsNum,
            })
            setExpression(_expression)
            setVariableNodes(variableNodes)
          } else {
            setRenderLayoutErr(errMsg)
          }
        } catch (e: unknown) {
          if (e instanceof Error) {
            setErr(e.message)
          }
        }
      }
    }
  }, [variables, resetComputed, typed])

  return (
    <div>
      <Title level={2}>Initialize shape variables</Title>
      <ObjectInputStrip<VariableInterface>
        onConfirm={(_variables) => {
          setVariables(_variables)
        }}
        initializer={initializer}
        initialCount={2}
        constructor={constructor}
        validate={() => true}
        attributeValidators={attributesValidator}
        addButtonRight
      />
      <Title level={2}>Enter your expression</Title>
      <ExpressionInput
        variables={variableNodes}
        onConfirm={(expression) => {
          setTyped(expression)
        }}
        validate={() => [true, ""]}
        placeholder="Type your expression with the variables intiialized above or click on the example button to fill automatically"
        prefilled={EXAMPLES.COMPLEX}
      />
      {err && (
        <div>
          <Text strong type="danger">
            {err}
          </Text>
        </div>
      )}

      {expression && (
        <NoWrap>
          <Text strong>Parsed and rendered (for debug purpose): </Text>
          <Text type="success" strong>
            {expression.render()}
          </Text>
        </NoWrap>
      )}
      {renderLayoutErr && (
        <div>
          <Text strong type="danger">
            {renderLayoutErr}
          </Text>
        </div>
      )}
      {dataElements && <MemoryVisualizer dataElements={dataElements} />}
      {layoutDataObject && layoutDataObject?.layout?.length !== 0 && (
        <ShapeVisualizer
          dataElements={layoutDataObject.layout}
          shape={layoutDataObject.shape}
        />
      )}
    </div>
  )
}
