// Temporary declaration shims to quiet the TypeScript checker in the dev container.
// These are small, local shims — for full types use @types/* packages and proper tsconfig.

declare const require: any;
declare const process: any;

declare module 'express' {
  const exp: any;
  export = exp;
}

declare module 'body-parser' {
  const bp: any;
  export = bp;
}

declare module 'cors' {
  const c: any;
  export = c;
}

declare module '@prisma/client' {
  export class PrismaClient {
    constructor();
    [key: string]: any;
  }
}
