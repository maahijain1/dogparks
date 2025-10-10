// Chart.js type declarations
declare global {
  interface Window {
    Chart: {
      new (canvas: HTMLCanvasElement, config: unknown): unknown
      getChart: (canvas: HTMLCanvasElement) => unknown
    }
  }
}

export {}
