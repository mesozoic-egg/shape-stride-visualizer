import {
  DataElement,
  MemorySlot,
  NestedDataElementArray,
  MaskedDataElement,
} from "../model/dataElement"
import { Variable, Node, VarVals, NumNode } from "../model/variable"

const START = 0
interface ConstructDataElementsArgs {
  shape: number[]
  stride: number[]
}
type DataElements = (DataElement | MemorySlot | MaskedDataElement)[]
export const constructDataElements = ({
  shape,
  stride,
}: ConstructDataElementsArgs) => {
  const elements: DataElement[] = []
  const construct = (shape: number[], stride: number[], address: number) => {
    if (shape.length === 1) {
      for (let i = 0; i < shape[0]; i++) {
        const _address = address + i * stride[0]
        if (!elements[_address]) {
          const node = new DataElement(_address)
          elements[_address] = node
        }
      }
    }
    for (let i = 0; i < shape[0]; i++) {
      construct(shape.slice(1), stride.slice(1), address)
      address += stride[0]
    }
    return elements
  }
  construct(shape, stride, START)
  for (let i = 0; i < elements.length; i++) {
    if (!elements[i]) {
      elements[i] = new MemorySlot(i)
    }
  }
  return elements
}

interface ArangeIntoShapeArgs {
  dataElements: DataElements
  shape: number[]
  stride: number[]
  masks?: [number, number][]
}
export const arrangeIntoShape = ({
  dataElements,
  shape,
  stride,
  masks,
}: ArangeIntoShapeArgs) => {
  const fill = (
    _shape: number[],
    _stride: number[],
    address: number,
    valid: boolean = true,
    _masks?: [number, number][],
  ) => {
    if (_shape.length === 1) {
      const elements: DataElement[] = []
      for (let i = 0; i < _shape[0]; i++) {
        const _address = address + i * _stride[0]
        const elem = dataElements[_address]
        if (!elem) {
          throw new Error(
            "dataElements must contain all the elements in the shape",
          )
        }
        let _valid = valid
        if (_masks) {
          _valid = valid && i >= _masks[0][0] && i <= _masks[0][1]
        }
        if (_valid) {
          elements.push(elem)
        } else {
          elements.push(new MaskedDataElement(_address))
        }
      }
      return elements
    }
    const elements: NestedDataElementArray[] = []
    for (let i = 0; i < _shape[0]; i++) {
      let _childIsValid = true
      if (masks) {
        _childIsValid = i >= masks?.[0]?.[0] && i <= masks?.[0]?.[1]
      }
      elements.push(
        fill(
          _shape.slice(1),
          _stride.slice(1),
          address,
          _childIsValid,
          _masks?.slice?.(1),
        ),
      )
      address += _stride[0]
    }
    return elements
  }
  try {
    return fill(shape, stride, START, true, masks) as NestedDataElementArray
  } catch (e) {
    console.error(e)
    return []
  }
}

interface ConstructVarValsForShapeArgs {
  shape: Variable[]
}
export const constructVarValsForShape = ({
  shape,
}: ConstructVarValsForShapeArgs) => {
  const varValsArray: VarVals[] = []
  let elementIdx = 0
  const constructVarValsArray = (idxs: number[], shapeIdx: number) => {
    if (shapeIdx === shape.length - 1) {
      for (let i = shape[shapeIdx].min; i <= shape[shapeIdx].max; i++) {
        const varVals: VarVals = new Map()
        idxs.forEach((idx, i) => {
          varVals.set(shape[i].name, new NumNode(idx))
        })
        varVals.set(shape[shapeIdx].name, new NumNode(i))
        varValsArray[elementIdx++] = varVals
      }
      return
    }

    for (let i = shape[shapeIdx].min; i <= shape[shapeIdx].max; i++) {
      constructVarValsArray([...idxs, i], shapeIdx + 1)
    }
  }
  constructVarValsArray([], 0)
  return varValsArray
}

interface ConstructDataElementsForVarValsArgs {
  varValsArray: VarVals[]
  expression: Node
}
export const constructDataElementsForVarVals = ({
  varValsArray,
  expression,
}: ConstructDataElementsForVarValsArgs) => {
  const dataElements: DataElements = []
  varValsArray.forEach((varVals, i) => {
    const varValSubbed = expression.substitute(varVals)
    if (!(varValSubbed instanceof NumNode)) {
      throw new Error("Expression not evaluated to NumNode")
    }
    const address = varValSubbed.value
    dataElements[address] = new DataElement(address)
  })
  for (let i = 0; i < dataElements.length; i++) {
    if (!dataElements[i]) {
      dataElements[i] = new MemorySlot(i)
    }
  }
  return dataElements
}

interface ConstructExpressionArgs {
  shape: Variable[]
  stride: number[]
}
export const constructExpression = ({
  shape,
  stride,
}: ConstructExpressionArgs) => {
  let expression: Node = new NumNode(0)
  for (let i = 0; i < shape.length; i++) {
    expression = expression.add(shape[i].mul(new NumNode(stride[i])))
  }
  return expression
}

export type NestedVarVals = (VarVals | NestedVarVals)[]
interface ConstructShapeLayoutAsVarValsArgs {
  shape: Variable[]
}
export const constructShapeLayoutAsVarVals = ({
  shape,
}: ConstructShapeLayoutAsVarValsArgs) => {
  const constructVarValsArray = (idxs: number[], shapeIdx: number) => {
    const _varValsArray: NestedVarVals = []
    if (shapeIdx === shape.length - 1) {
      for (let i = shape[shapeIdx].min; i <= shape[shapeIdx].max; i++) {
        const varVals: VarVals = new Map()
        idxs.forEach((idx, i) => {
          varVals.set(shape[i].name, new NumNode(idx))
        })
        varVals.set(shape[shapeIdx].name, new NumNode(i))
        _varValsArray[i] = varVals
      }
      return _varValsArray
    }
    for (let i = shape[shapeIdx].min; i <= shape[shapeIdx].max; i++) {
      const nested = constructVarValsArray([...idxs, i], shapeIdx + 1)
      _varValsArray.push(nested)
    }
    return _varValsArray
  }
  const varValsArray = constructVarValsArray([], 0)
  return varValsArray
}

interface SubstituteVarValsShapeLayoutArgs {
  dataElements: DataElement[]
  shapeLayout: NestedVarVals
  expression: Node
  validExpression?: Node
}
export const substituteVarValsShapeLayout = ({
  dataElements,
  shapeLayout,
  expression,
  validExpression,
}: SubstituteVarValsShapeLayoutArgs) => {
  const fill = (
    _layout: (NestedVarVals | VarVals)[],
    _expression: Node,
  ): NestedDataElementArray | DataElement => {
    const filled: NestedDataElementArray = []
    if (_layout?.length) {
      for (const nested of _layout) {
        const _filled = fill(nested as NestedVarVals, _expression)
        filled.push(_filled)
      }
      return filled
    }
    if (!(_layout instanceof Map)) {
      throw new Error("Last dimension of shapelayout isn't consisted of Maps")
    }
    const varVals = _layout as VarVals
    const varValsSubbed = _expression.substitute(varVals)
    if (!(varValsSubbed instanceof NumNode)) {
      throw new Error("Expression not evaluated to NumNode")
    }
    const address = varValsSubbed.value
    const element = dataElements[address]
    if (!element) {
      throw new Error(
        `Data elements array did not contain corresponding element at address ${address}`,
      )
    }
    if (validExpression) {
      const valid = validExpression.substitute(varVals)
      if (!(valid instanceof NumNode)) {
        throw new Error("Valid expression not evaluated to NumNode")
      }
      if (valid.value === 0) {
        return new MaskedDataElement(address)
      }
    }
    return element
  }
  return fill(shapeLayout, expression) as NestedDataElementArray
}
