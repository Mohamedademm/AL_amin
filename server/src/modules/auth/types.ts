import { RoleName } from '../../generated/prisma';

// Payload accepted when a new client account self-registers.
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Credentials accepted by the login endpoint.
export interface LoginInput {
  email: string;
  password: string;
}

// Shape of the JWT payload embedded in every access token.
export interface JwtPayload {
  id: string;
  email: string;
  role: RoleName;
}
