import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

export interface IParseTokenResult {
  isValid: boolean;
  user: { id: number; username: string } | null;
}

export const parseToken = (
  token: string | undefined,
  secretKey: string
): IParseTokenResult => {
  if (!token) {
    return { isValid: false, user: null };
  }

  try {
    const decoded = jsonwebtoken.verify(token, secretKey) as JwtPayload;
    return { isValid: true, user: decoded?.user };
  } catch (error) {
    return { isValid: false, user: null };
  }
};
