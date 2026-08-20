// ============================================================
// Response Envelope Interceptor
// ============================================================
// Wraps all successful API responses in a consistent envelope:
//   { data: <response>, meta: { timestamp } }
// Error responses are handled by GlobalExceptionFilter instead.
// See: Doc 06 §3
// ============================================================
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
