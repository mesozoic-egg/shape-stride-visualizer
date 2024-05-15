import { useEffect, useState, useCallback } from "react"
import { Variable, NumNode, Node } from "../model/variable"
import {
  constructDataElementsForVarVals,
  constructShapeLayoutAsVarVals,
  constructVarValsForShape,
  substituteVarValsShapeLayout,
} from "../utils/constructDataElements"
import { DataElement, NestedDataElementArray } from "../model/dataElement"
import { MemoryVisualizer } from "./MemoryVisualizer"
import { Title, Text, NoWrap, Button, Space, Flex } from "../view/ui"
import { ShapeVisualizer } from "./ShapeVisualizer"
import { ObjectInputStrip } from "./ObjectsInputStrip"
import { ExpressionInput } from "./ExpressionInput"
import { parse, validateExpressionInput } from "../utils/exprParser"

interface VariableInterface {
  id: number
  attributes: {
    key: string
    value: string | number
  }[]
}

const attributesValidator = {
  name: (s: string | number) => /[a-z]/.test(s.toString()),
  min: (s: string | number) => /^\d+$/.test(s.toString()),
  max: (s: string | number) => /^\d+$/.test(s.toString()),
}
const constructor = (id: number) => {
  return {
    id,
    attributes: [
      {
        key: "name",
        value: `idx${id}`,
      },
      {
        key: "min",
        value: 0,
      },
      {
        key: "max",
        value: 1,
      },
    ],
  }
}

export const ExprIdxVisualizer = () => {
  const [variables, setVariables] = useState<VariableInterface[]>([])
  const [variableNodes, setVariableNodes] = useState<Variable[]>([])
  const [variablesMap, setVariableMap] = useState<Record<string, Variable>>({})
  const initializer = useCallback(() => {
    return [constructor(0), constructor(1)]
  }, [])
  useEffect(() => {
    if (variables.length) {
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
      setLayout([])
      setDataElements([])
      setVariableNodes(vars)
      setShape(vars.map((v) => v.max + 1))
      setVariableMap(
        vars.reduce(
          (acc, v) => {
            acc[v.name] = v
            return acc
          },
          {} as Record<string, Variable>,
        ),
      )
    }
  }, [variables])
  const [typed, setTyped] = useState("")
  const [expression, setExpression] = useState<Node>()
  const [err, setErr] = useState("")
  useEffect(() => {
    if (typed) {
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
        const _expression = parse({ expression: typed, variables: variableMap })
        setExpression(_expression)
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message)
        }
      }
    }
  }, [typed, variableNodes, variablesMap])

  const [dataElements, setDataElements] = useState<DataElement[]>()
  const [layout, setLayout] = useState<NestedDataElementArray>([])
  const [shape, setShape] = useState<number[]>([])
  useEffect(() => {
    if (expression) {
      const shape = variableNodes
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
      setDataElements(_dataElements)
      setLayout(dataElementsLayout)
    }
  }, [expression, variableNodes])
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
      {dataElements && <MemoryVisualizer dataElements={dataElements} />}
      {layout.length !== 0 && (
        <ShapeVisualizer dataElements={layout} shape={shape} />
      )}
    </div>
  )
}
