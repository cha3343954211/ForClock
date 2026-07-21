import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    retryKey: number;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the entire app.
 *
 * 重试时通过递增 retryKey 强制 children remount，避免错误状态残留导致死循环。
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, retryKey: 0 };
    }

    public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = (): void => {
        // 递增 retryKey → Fragment key 变化 → 子树整体 remount
        this.setState(prev => ({ hasError: false, error: null, retryKey: prev.retryKey + 1 }));
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-8">
                    <div className="max-w-md text-center space-y-6">
                        <div className="text-6xl">⚠️</div>
                        <h1 className="text-2xl font-bold">Something went wrong</h1>
                        <p className="text-gray-400 text-sm">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        // 用 retryKey 作为 Fragment key，重试时强制整个子树 remount
        return (
            <React.Fragment key={this.state.retryKey}>
                {this.props.children}
            </React.Fragment>
        );
    }
}
