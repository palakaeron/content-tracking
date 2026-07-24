import { SignJWT } from 'jose'; import crypto from 'node:crypto'; import { env } from '../config/env.js';
const key=(secret:string)=>new TextEncoder().encode(secret); export const hash=(v:string)=>crypto.createHash('sha256').update(v).digest('hex'); export const opaque=()=>crypto.randomBytes(48).toString('base64url');
export const accessToken=(id:string,role:string)=>new SignJWT({role}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuedAt().setExpirationTime('15m').sign(key(env.JWT_ACCESS_SECRET));
