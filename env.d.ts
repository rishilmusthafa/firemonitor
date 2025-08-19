declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CESIUM_ACCESS_TOKEN: string;
    }
  }
}

export {}; 