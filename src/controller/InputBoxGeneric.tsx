import { InputNumber } from "../view/ui"
import { useState, useEffect } from "react"

interface InputBoxProps {
  label: string
  onValueConfirm: (value: string | number) => void
  id: number
  prefilled?: string | number
  validator: (value: string | number) => boolean
  disabled?: boolean
}
export const InputBox: React.FC<InputBoxProps> = ({
  prefilled = "",
  label,
  onValueConfirm,
  id,
  validator,
  disabled,
}) => {
  const [value, setValue] = useState<string | number>(prefilled)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  useEffect(() => {
    if (value !== undefined && validator(value)) {
      setErrorMsg(undefined)
      onValueConfirm(value)
    } else {
      setErrorMsg("Enter an integer")
    }
  }, [id, value, onValueConfirm, validator])
  return (
    <div>
      <label>{label}</label>
      <br />
      <InputNumber
        width={60}
        value={value as any}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        disabled={disabled}
      />
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
    </div>
  )
}
