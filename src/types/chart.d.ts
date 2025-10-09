// Chart.js type declarations
declare global {
  interface Window {
    Chart: {
      new (context: CanvasRenderingContext2D, config: unknown): unknown
    }
  }
}

export {}
