import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Short label for logs, e.g. "3D stage". */
  readonly name: string
  readonly fallback: (retry: () => void) => ReactNode
  readonly children: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
}

/**
 * Keeps one failing area (a 404 on the model, no WebGL, a broken AR viewer) from
 * unmounting the whole store: the configurator panel and cart keep working.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}] crashed`, error, info.componentStack)
  }

  private readonly retry = () => this.setState({ hasError: false })

  render() {
    return this.state.hasError ? this.props.fallback(this.retry) : this.props.children
  }
}
