import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../setup/secrets';
import { randomBytes } from 'crypto';

const generateJWTToken = (userId: number, email: string, claim: 'admin' | 'user', sessionId?: string | null) => {
    const data = {
        id: userId,
        email: email,
        claim,
        sessionId
    }

    return new Promise<string>((resolve, reject) => {
        sign(data, JWT_SECRET!, {
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

const generateRefreshToken = (size: number) => {
    return new Promise<string>((resolve, reject) => {
        randomBytes(size, (err, buf) => {
            if (err) {
                reject(err);
            }
            resolve(buf.toString('hex'));
        });
    });
}


const decodeToken = (token: string) => {
    if (!token) {
        throw new Error('Missing token');
    }
    return new Promise<JwtPayload>((resolve, reject) => {
        verify(token, JWT_SECRET!, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded as JwtPayload);
        });
    });
}

export {
    generateJWTToken,
    generateRefreshToken,
    decodeToken,
}