export type NestedDataElementArray = DataElement | NestedDataElementArray[]
export class MemorySlot {
  constructor(
    public address: number
  ) {}

  toString() {
    return `0x${this.address}`
  }

  toJSON() {
    return this.toString()
  }
}

export class DataElement extends MemorySlot {
}