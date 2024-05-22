import { NestedDataElementArray } from "../model/dataElement"

class ShapeStrideValidatorError {
  constructor(public message: string) {}
}

export type ShapeStrideValidator = (
  shape: number[],
  stride: number[],
) => undefined | ShapeStrideValidatorError

export const validateShapeStrides: ShapeStrideValidator = (
  shape: number[],
  stride: number[],
) => {
  if (shape.length !== stride.length) {
    return new ShapeStrideValidatorError(
      "Shape and stride must be the same length",
    )
  }
  if (shape.some((dim) => dim <= 0)) {
    return new ShapeStrideValidatorError("Shape must be bigger than zero")
  }
}

type CheckCompatibleShapeStrides = (
  oldShape: number[],
  oldStride: number[],
) => ShapeStrideValidator
export const checkCompatibleShapeStrides: CheckCompatibleShapeStrides =
  (oldShape, oldStride) => (newShape, newStride) => {
    let error = validateShapeStrides(newShape, newStride)
    if (error) {
      return error
    }
    error = validateShapeStrides(oldShape, oldStride)
    if (error) {
      return error
    }

    if (prod(newShape) !== prod(oldShape)) {
      return new ShapeStrideValidatorError(
        "New shape and old shape don not have the same number of elements",
      )
    }
  }

const prod = (val: number[]) => val.reduce((acc, curr) => acc * curr, 1)

interface ShapeLayoutProps {
  shape: number[]
  dataElements: NestedDataElementArray
}
type NestedStringArray = (string | NestedStringArray)[]
export const validateShapeLayout = ({
  shape,
  dataElements,
}: ShapeLayoutProps): [boolean, string] => {
  const recurse = ({
    shape,
    dataElements,
  }: ShapeLayoutProps): NestedStringArray => {
    if (shape.length === 0) {
      throw new Error("Shape must be bigger than zero")
    }
    if (shape.length === 1) {
      return dataElements.map((element, i) => element.toString())
    } else {
      const range = Array.from({ length: shape[0] }, (_, i) => i)
      return range.map((i) => {
        if (dataElements[i] === undefined) {
          throw new Error(`Data element at index ${i} is undefined`)
        }
        return recurse({
          shape: shape.slice(1),
          dataElements: dataElements[i] as NestedDataElementArray,
        })
      })
    }
  }
  try {
    recurse({ shape, dataElements })
    return [true, ""]
  } catch (e: unknown) {
    if (e instanceof Error) {
      return [false, e.message]
    }
    return [false, "unknown error object"]
  }
}
