import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate when the argument being transformed is the request body
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: 'Request payload validation failed',
          errors: formattedErrors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
