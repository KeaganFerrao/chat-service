import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../setup/secrets';
import { AuthService } from '../interfaces/auth';
import { IncomingHttpHeaders } from 'http';

export class JwtAuthService implements AuthService {
    extractToken(headers: IncomingHttpHeaders): string | undefined {
        const bearerToken = headers?.authorization;
        const token = bearerToken?.split(' ')?.[1];

        return token;
    }

    verifyToken(token: string): Promise<{
        valid: boolean,
        payload?: Record<string, any>
    }> {
        console.log(token)
        console.log(JWT_SECRET);
        return new Promise((resolve, reject) => {
            verify(token, JWT_SECRET!, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    valid: true,
                    payload: decoded as JwtPayload
                });
            });
        });
    }

    generateToken(payload: Record<string, any>): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            sign(payload, JWT_SECRET!, {
                expiresIn: '1d'
            }, (err, token) => {
                if (err) {
                    reject(err);
                }
                if (token) {
                    resolve(token);
                }
                reject('Token generation failed');
            });
        });
    }

}