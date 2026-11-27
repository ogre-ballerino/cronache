declare module 'virtual:cronache/config' {
  const config: import('./config.mjs').ResolvedCampaignConfig;
  export default config;
}

declare module 'virtual:cronache/styles' {}

declare module 'virtual:cronache/paths' {
  export const contentDir: string;
  export const publicDir: string;
  export const sheetTemplate: string;
  export const coreDir: string;
}

declare module 'virtual:cronache/card' {
  const style: ReturnType<typeof import('./lib/card-style.mjs').cardStyle>;
  export default style;
}
