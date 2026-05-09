import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    console.error("Frontend Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-lg">
            <h1 className="text-2xl font-bold text-red-400 mb-3">
              Something went wrong
            </h1>

            <p className="text-slate-300 mb-4">
              Gatecep hit a frontend error. Refresh the page or return to the dashboard.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-600 hover:bg-cyan-500 rounded-xl px-5 py-3 font-bold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}