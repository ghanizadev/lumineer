---
sidebar_position: 4
title: Middlewares
---

Middleware run right before every call done to handler in our services. It is useful when it is need to send data down to the call pipeline.

## Creating a middleware

To create a middleware, you can opt for a function or a class middleware.

### Function middleware

You can define a function middleware as follows:

```typescript title="src/middlewares/my-middleware.middleware.ts"
import { MiddlewareContext } from '@lumineer/core';

export async function MyMiddleware(context: MiddlewareContext): Promise<void> {
  // [...]
}

```

### Class Middleware

In the other hand, you can take advantage of the dependency injection and create a class middleware instead:

```typescript title="src/middlewares/my-middleware.middleware.ts"
import { ClassMiddleware, MiddlewareContext } from '@lumineer/core';

export class MyMiddleware extends ClassMiddleware {
  public async handle(context: MiddlewareContext): Promise<void> {
    // [...]
  }
}

```

## Using middlewares

To use a middleware, we have 3 options:

1. Using the [`@Middleware()`](#) decorator in a method, enabling it for this method only:

    ```typescript
    import { Service, UnaryCall, Middleware } from '@lumineer/core';
    import { MyMiddleware } from '../middlewares/my-middleware.middleware.ts';
    
    @Service()
    class MyService {
      @UnaryCall()
      @Middleware(MyMiddleware)
      private MyRPC() {
        // [...]
      }
    }
    
    ````

2. Using the [`@Middleware()`](#) decorator in a service, enabling the middleware to run in every RPC handle within this service:

    ```typescript
    import { Service, UnaryCall, Middleware } from '@lumineer/core';
    import { MyMiddleware } from '../middlewares/my-middleware.middleware.ts';
    
    @Service()
    @Middleware(MyMiddleware)
    class MyService {
      @UnaryCall()
      private MyRPC() {
        // [...]
      }
    }
    
    ````

3. Or as a global middleware, enabling it in all services and all methods of our application:

    ```typescript
    import { Lumineer } from "@lumineer/core"
    import { MyMiddleware } from './middlewares/my-middleware.middleware.ts';
        
    async function main() {
      const server = Lumineer({/* [...] */});
      
      server.use(MyMiddleware);
      
      await server.run(/* [...] */);
    }
    
    main();
   
    ```
   
## Passing arguments to middlewares

To pass arguments to your middleware you can:

1. Create a high-order function and wrap the implementation or your middleware:

    ```typescript title="src/middlewares/my-middleware.middleware.ts"
    import { MiddlewareContext } from '@lumineer/core';
    
    export async function MyMiddleware(...params: any[]) {
      return (context: MiddlewareContext): Promise<void> => {
        // Parameters will be availabe here
        // [...]
      }
    }
   
    ```

    And in the service:

    ```typescript title="src/aervices/my-service.service.ts"
    import { Service, UnaryCall, Middleware } from "@lumineer/core";
    
    @Service()
    class MyService {
      @UnaryCall()
      @Middleware(MyMiddleware('first-param', 'second-param'))
      private MyRPC() {} 
    }
    
    ```
   
2. Create a class middleware and use the dependency injection:

    ```typescript title="src/middlewares/my-middleware.middleware.ts"
    import { ClassMiddleware, MiddlewareContext } from '@lumineer/core';
    
    export class MyMiddleware extends ClassMiddleware {
      // The database property will be automatically loaded by the dependency injection container
      constructor(
        private readonly database: MyDatabase,
        @Inject('DEPENDENCY_TOKEN') private readonly myCustomDependency: string,
      ) {
        super();
      }
      
      public async handle(context: MiddlewareContext): Promise<void> {
        // [...]
      }
    }
   
    ```
3. Create custom decorators and use the `reflect-metadata` to resolve its values:

    ```typescript title="src/middlewares/my-middleware.middleware.ts"
    import { ClassMiddleware, MiddlewareContext } from '@lumineer/core';
    
    export class MyMiddleware extends ClassMiddleware {
      public async handle(context: MiddlewareContext): Promise<void> {
        const data = Reflect.getMetadata('my-custom-decorator', context.instance);
        // [...]
      }
    }
    
    export const MyDecorator = (...args: any[]) => Reflect.metadata('my-custom-decorator', args);
   
    ```

    And in the service:

    ```typescript title="src/services/my-service.service.ts"
    import { Service, UnaryCall, Middleware } from "@lumineer/core";
    
    @Service()
    @Middleware(MyMiddleware)
    class MyService {
      @UnaryCall()
      @MyDecorator('first-param', 'second-param')
      private MyRPC() {} 
    }
    
    ```
