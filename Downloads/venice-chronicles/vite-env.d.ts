/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_VENICE_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
