declare namespace NodeJS {
  export interface ProcessEnv extends Dict<string> {
    NODE_ENV?: string;
    PORT: string;
    HOST: string;
    DATABASE_URI: string;
    TEST_DATABASE_URI: string;
    BOT_TOKEN: string;
    BOT_URI?: string;
    WEBHOOK_PATH: string;
    ORIGIN: string;
  }
}
