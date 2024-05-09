export class Shape {
  constructor(public shapes: number[]) {}
}

export class Stride {
  constructor(public strides: number[]) {}
}

export class ShapeStride {
  constructor(
    public shape: number,
    public stride: number,
    public id: number,
  ) {}

  toString() {
    return `[Shape: ${this.shape}, Stride: ${this.stride}]`
  }
}
