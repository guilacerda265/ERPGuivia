import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/** Valida o corpo da request com um schema Zod (a mesma regra que o front usa). */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Confira os campos.',
        erros: result.error.issues.map((i) => ({
          campo: i.path.join('.'),
          erro: i.message,
        })),
      });
    }
    return result.data;
  }
}
