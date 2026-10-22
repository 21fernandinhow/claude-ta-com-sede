export type Dia = { data: string; ml: number }

declare module 'claude-code' {
  interface PluginState {
    'claude-ta-com-sede': { hoje: Dia | null; isHidden: boolean }
  }
}
