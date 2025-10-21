/// <reference types="vite/client" />

// Declare CSS module types
declare module "*.css?inline" {
  const content: string;
  export default content;
}
