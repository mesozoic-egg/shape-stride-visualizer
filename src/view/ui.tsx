import {
  Flex as FlexAnt,
  Button as ButtonAnt,
  Card as CardAnt,
  InputNumber as InputNumberAnt,
  Typography,
  Input as InputAnt,
} from "antd"
import React from "react"

const { Title: TitleAnt, Text: TextAnt, Link: LinkAnt } = Typography

interface WithChildren {
  children?: React.ReactNode
}

interface FlexProps extends WithChildren {
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
  align?: "flex-start" | "center" | "flex-end"
  wrap?: "wrap" | "nowrap"
  gap?: "small" | "middle" | "large" | number
}
export const Flex: React.FC<FlexProps> = ({
  justify = "center",
  align = "center",
  wrap = "nowrap",
  gap,
  children,
}) => {
  return (
    <FlexAnt justify={justify} align={align} wrap={wrap} gap={gap}>
      {children}
    </FlexAnt>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  antType: "primary" | "default" | "dashed" | "text" | "link"
  margin?: number
  width?: number
}
export const Button: React.FC<ButtonProps> = ({
  children,
  type,
  antType,
  margin,
  width,
  ...props
}) => {
  return (
    <ButtonAnt
      type={antType}
      htmlType={type}
      style={{ margin: margin, width: width }}
      {...props}
    >
      {children}
    </ButtonAnt>
  )
}

interface CardProps extends WithChildren {
  width?: number
  maxWidth?: number
  margin?: number
  center?: boolean
  overflow?: string
}
export const Card: React.FC<CardProps> = ({
  children,
  maxWidth,
  margin,
  center,
  width,
  overflow = "scroll",
}) => {
  return (
    <CardAnt
      style={{
        width: width,
        maxWidth: maxWidth,
        margin: center ? "0 auto" : margin,
        overflow,
      }}
    >
      {children}
    </CardAnt>
  )
}

type eventWithTargetValue = {
  target: {
    value: unknown
  }
}
interface InputNumberProps {
  width?: number
  value: any
  onChange?: (event: eventWithTargetValue) => void
  disabled?: boolean
}
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  width,
  disabled,
}) => {
  return (
    <InputNumberAnt
      style={{
        width: width,
      }}
      value={value}
      onChange={(value) => {
        onChange?.({ target: { value } })
      }}
      disabled={disabled}
    />
  )
}

interface TitleProps extends WithChildren {
  level: 1 | 2 | 3 | 4 | 5 | undefined
}
export const Title: React.FC<TitleProps> = ({ level, children }) => {
  return <TitleAnt level={level}>{children}</TitleAnt>
}

interface TextProps extends WithChildren {
  type?: "secondary" | "success" | "warning" | "danger"
  strong?: boolean
  italic?: boolean
}
export const Text: React.FC<TextProps> = ({
  type,
  children,
  strong,
  italic,
}) => {
  return (
    <TextAnt type={type} strong={strong} italic={italic}>
      {children}
    </TextAnt>
  )
}

interface SpaceProps extends WithChildren {
  size: number
  direction?: "vertical" | "horizontal"
}
export const Space: React.FC<SpaceProps> = ({
  size,
  direction = "vertical",
  children,
}) => {
  return (
    <div
      style={{
        margin: direction === "horizontal" ? `0 ${size}px` : `${size}px 0`,
      }}
    >
      {children}
    </div>
  )
}

interface CanvasProps extends WithChildren {
  maxWidth?: number
  maxHeight?: number
  padding?: string
}
export const Canvas: React.FC<CanvasProps> = ({
  maxWidth,
  maxHeight,
  padding = "10px 10px",
  children,
}) => {
  return (
    <div
      style={{
        maxWidth: window.innerWidth > 768 ? maxWidth : "100%",
        maxHeight: maxHeight,
        margin: "0 auto",
        padding: padding,
      }}
    >
      {children}
    </div>
  )
}

interface CarouselProps extends WithChildren {
  maxWidth?: number
}
export const Carousel: React.FC<CarouselProps> = ({ maxWidth, children }) => {
  return (
    <div style={{ maxWidth: maxWidth, overflow: "scroll" }}>{children}</div>
  )
}

interface LinkProps extends WithChildren {
  href: string
  target?: string
}
export const Link: React.FC<LinkProps> = ({ href, target, children }) => {
  return (
    <LinkAnt href={href} target={target}>
      {children}
    </LinkAnt>
  )
}

interface TextAlignProps extends WithChildren {
  align?: "start" | "end" | "center"
}
export const TextAlign: React.FC<TextAlignProps> = ({ align, children }) => {
  return <div style={{ textAlign: align }}>{children}</div>
}

export const NoWrap: React.FC<WithChildren> = ({ children }) => {
  return <div style={{ whiteSpace: "nowrap" }}>{children}</div>
}

interface InputProps {
  value: string
  onChange: (value: { target: { value: string } }) => void
  size?: "large" | "middle" | "small"
  placeholder?: string
  prefix?: React.ReactNode
  allowClear?: boolean
  maxWidth?: number
  width?: number
}
export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  size,
  placeholder,
  prefix,
  allowClear,
  maxWidth,
  width,
}) => {
  return (
    <InputAnt
      allowClear={allowClear}
      prefix={prefix}
      value={value}
      onChange={(e) => onChange(e)}
      size={size}
      placeholder={placeholder}
      style={{
        maxWidth: maxWidth,
        width: width,
      }}
    />
  )
}
