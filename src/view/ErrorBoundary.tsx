import React from "react"
import { Text } from "./ui"

interface ErrorBoundaryProps {
  children: React.ReactNode
  hasError: boolean
  setHasError: (arg: boolean) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  errMsg?: string
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errMsg: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.setHasError(true)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.hasError && !this.props.hasError) {
      this.setState({ hasError: false, errMsg: undefined })
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Text>Something went wrong: {this.state.errMsg}</Text>
    }

    return this.props.children
  }
}
