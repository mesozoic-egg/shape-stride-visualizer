export type NestedDataElementArray = (
  | DataElementMaybeMasked
  | NestedDataElementArray
)[]
export class MemorySlot {
  constructor(public address: number) {}

  toString() {
    return `0x${this.address.toString(16)}`
  }

  toJSON() {
    return this.toString()
  }
}

export class DataElement extends MemorySlot {}
export class MaskedDataElement extends MemorySlot {}
export type DataElementMaybeMasked = DataElement | MaskedDataElement
