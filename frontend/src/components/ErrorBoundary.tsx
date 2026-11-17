import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            We encountered an unexpected error while loading this page.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
                            >
                                Go to Homepage
                            </button>
                        </div>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-6 text-left p-3 bg-red-50 rounded-lg text-xs text-red-700 overflow-auto max-h-32">
                                {this.state.error.message}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
