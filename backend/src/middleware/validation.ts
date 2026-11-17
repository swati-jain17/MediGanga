import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const data = schema.parse(req[part]);
            req[part] = data; // Replace with validated/transformed data
            next();
        } catch (error) {
            next(error);
        }
    };
}

// Combined validation for multiple parts
export function validateMultiple(schemas: Partial<Record<RequestPart, ZodSchema>>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            for (const [part, schema] of Object.entries(schemas) as [RequestPart, ZodSchema][]) {
                if (schema) {
                    const data = schema.parse(req[part]);
                    req[part] = data;
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}
