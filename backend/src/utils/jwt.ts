import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthPayload } from '../types/index.js';

export function generateToken(payload: AuthPayload, expiresIn?: string): string {
    const options: SignOptions = {
        expiresIn: (expiresIn || env.jwtExpiresIn) as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthPayload {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}
