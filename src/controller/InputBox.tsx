import { InputNumber } from "../view/ui"
import { useState, useEffect } from "react"

interface InputBoxProps {
  label: string
  onValueConfirm: (id: number, value: number) => void
  id: number
  prefilled?: string | number
}
export const InputBox: React.FC<InputBoxProps> = ({
  prefilled = "",
  label,
  onValueConfirm,
  id,
}) => {
  const [value, setValue] = useState<unknown>(prefilled)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  useEffect(() => {
    if (value !== undefined && !isNaN(Number(value))) {
      setErrorMsg(undefined)
      onValueConfirm(id, Number(value))
    } else {
      setErrorMsg("Enter an integer")
    }
  }, [id, value, onValueConfirm])
  return (
    <div>
      <label>{label}</label>
      <br />
      <InputNumber
        width={60}
        value={value as any}
        onChange={(e) => setValue(e.target.value)}
      />
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
    </div>
  )
}
