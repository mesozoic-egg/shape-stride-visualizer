class ShapeStrideValidatorError {
  constructor(public message: string) {}
}

export type ShapeStrideValidator = (shape: number[], stride: number[]) => undefined | ShapeStrideValidatorError

export const validateShapeStrides: ShapeStrideValidator = (shape: number[], stride: number[]) => {
  if (shape.length !== stride.length) {
    return new ShapeStrideValidatorError('Shape and stride must be the same length')
  }
  if (shape.some((dim) => dim <= 0)) {
    return new ShapeStrideValidatorError('Shape must be bigger than zero')
  }
}

interface CheckCompatibleArgs {
  newShape: number[]
  newStride: number[]
  oldShape: number[]
  oldStride: number[]
}
export const checkCompatibleShapeStrides = ({ newShape, newStride, oldShape, oldStride }: CheckCompatibleArgs) => {
  let error = validateShapeStrides(newShape, newStride)
  if (error) {
    return error
  }
  error = validateShapeStrides(oldShape, oldStride)
  if (error) {
    return error
  }

  return null
}

