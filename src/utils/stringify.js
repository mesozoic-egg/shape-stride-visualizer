const renderNestedDataElement = (data, shape, indent=0) => {
  const indentation = ' '.repeat(indent);
  let result = ''
  result += indentation
  if (shape.length === 1) {
    result += '['
  } else {
    result += '[\n'
  }
  for (let i = 0; i < shape[0]; i++) {
    if (shape.length === 1) {
      result += ` ${data[i]}`
    } else {
      const childData = renderNestedDataElement(data[i], shape.slice(1), indent + 2)
      result += `${childData}\n`
    }
  }
  if (shape.length === 1) {
    result += ' ]'
  } else {
    result += `${indentation}]\n`
  }
  return result
}

const data = [
  [
    [1,2,3],
    [4,5,6],
  ],
  [
    [7,8,9],
    [10,11,12],
  ],
]
const shape = [2, 2, 3]
console.log(renderNestedDataElement(data, shape))

