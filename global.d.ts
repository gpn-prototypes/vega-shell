declare namespace NodeJS {
  interface Global {
    System?: import('./src/testing').SystemJS;
  }
}
