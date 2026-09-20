import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from '../i18n/LocaleContext'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** 内部展示组件：单独拆出来才能用 useTranslation（class 组件本身不行）。 */
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const t = useTranslation()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <h1 className="type-headline text-on-surface">{t.errorBoundary.title}</h1>
      <p className="type-body max-w-sm text-on-surface-variant">{t.errorBoundary.description}</p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary"
      >
        {t.errorBoundary.reload}
      </button>
      {import.meta.env.DEV && error && (
        <pre className="type-caption mt-4 max-w-full overflow-auto rounded bg-surface-container p-3 text-left text-error">
          {error.message}
        </pre>
      )
      }
    </div>
  )
}

/**
 * 捕获渲染期错误（如某版式渲染器抛错、旧浏览器缺 canvas API），
 * 避免整个 React 树卸载后用户只看到白屏。提供重载出口。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('HueFrame 渲染出错:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}
