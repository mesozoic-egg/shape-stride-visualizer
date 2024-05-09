import { useEffect, useState, useCallback } from 'react';
import { ShapeStride } from '../model/shape';
import { Button, Card, Flex, InputNumber } from '../view';

interface ShapeStrideInputProps {
  onConfirmShapeStrides: (shapeStrides: number[][]) => void;
}
export const ShapeStrideInput: React.FC<ShapeStrideInputProps> = ({ onConfirmShapeStrides }) => {
  const [count, setCount] = useState<number>(3);
  const [shapeStrides, setShapeStrides] = useState<ShapeStride[]>([
    new ShapeStride(2, 9, 0), 
    new ShapeStride(3, 3, 1),
    new ShapeStride(3, 1, 2)
  ]);
  const setShape = useCallback((id: number, shape: number) => {
    setShapeStrides(_shapeStrides => _shapeStrides.map(s => s.id === id ? { ...s, shape } : s))
  }, [])
  const setStride = useCallback((id: number, stride: number) => {
    setShapeStrides(_shapeStrides => _shapeStrides.map(s => s.id === id ? { ...s, stride } : s))
  }, [])
  const addShapeStride = () => {
    const shapeStride = new ShapeStride(0, 0, count);
    setShapeStrides([...shapeStrides, shapeStride]);
    setCount(_count => _count + 1)
  }
  const removeShapeStride = (shapeStride: ShapeStride) => {
    setShapeStrides(_shapeStrides => _shapeStrides.filter(s => s !== shapeStride));
  }

  const shape = JSON.stringify(shapeStrides.map(shapeStride => shapeStride.shape))
  const stride = JSON.stringify(shapeStrides.map(shapeStride => shapeStride.stride))
  useEffect(() => {
    if (shape.length > 0) {
      console.log({shape, stride})
      onConfirmShapeStrides([JSON.parse(shape), JSON.parse(stride)]);
    }
  }, [onConfirmShapeStrides, shape, stride]);

  return <div>
    <div>
      <Flex justify='flex-start'>
      {shapeStrides.map(shapeStride => <div key={shapeStride.id}>
        <Card maxWidth={150} margin={10}>
        <InputBox label="Shape" id={shapeStride.id} onValueConfirm={setShape} prefilled={shapeStride.shape}/>
        <InputBox label="Stride" id={shapeStride.id} onValueConfirm={setStride} prefilled={shapeStride.stride} />
        <Button antType='dashed' onClick={() => removeShapeStride(shapeStride)}>Remove</Button>
        </Card>
      </div>)}
      <Button antType='primary' onClick={() => addShapeStride()}>Add</Button>
      </Flex>
    </div>

  </div>
}

interface InputBoxProps {
  label: string;
  onValueConfirm: (id: number, value: number) => void;
  id: number;
  prefilled?: string | number;
}
const InputBox: React.FC<InputBoxProps> = ({ prefilled='', label, onValueConfirm, id }) => {
  const [value, setValue] = useState<string | number>(prefilled);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  useEffect(() => {
    if (value !== undefined && !isNaN(Number(value))) {
      setErrorMsg(undefined);
      onValueConfirm(id, Number(value));
    } else {
      setErrorMsg('Enter an integer')
    }
  }, [id, value, onValueConfirm]);
  return <div>
    <label>{label}</label>
    <InputNumber value={value as any} onChange={(e) => setValue(e.target.value)} />
    {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
  </div>
}
