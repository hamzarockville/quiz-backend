import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { timeout, catchError } from 'rxjs/operators';
  
  @Injectable()
  export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        timeout(1000000), // Set timeout to 10 seconds
        catchError(err => {
          if (err.name === 'TimeoutError') {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      );
    }
  }
  