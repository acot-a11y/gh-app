import type { ErrorInfo } from 'react';
import { Component } from 'react';

export type Props = {
  view: React.ComponentType<{ message: string | null }>;
};

export type State = {
  hasError: boolean;
  message: string | null;
};

export class ErrorBoundary extends Component<Props, State> {
  public state = {
    hasError: false,
    message: null,
  };

  public static getDerivedStateFromError(e: any) {
    return {
      hasError: true,
      message: e instanceof Error ? e.message : null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  public render() {
    const { view: View } = this.props;
    const { hasError, message } = this.state;
    if (hasError) {
      return <View message={message} />;
    }

    return this.props.children;
  }
}
