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
