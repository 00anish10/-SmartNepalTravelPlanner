import { Component, ErrorInfo, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg">
          <div className="card-gradient rounded-2xl p-10 max-w-md mx-4 text-center border border-white/10">
            <div className="text-5xl mb-4">🏔️</div>
            <h2 className="text-xl font-bold text-snow mb-2">Something went wrong</h2>
            <p className="text-stone text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <Link
              to="/"
              className="btn-primary px-6 py-3 rounded-xl inline-block"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Back to Home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
