import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

export const parseUser = (token: string | undefined, secretKey: string) => {
  if (!token) {
    return { status: 401, user: null };
  }

  try {
    const decoded = jsonwebtoken.verify(token, secretKey) as JwtPayload;
    return { status: 200, user: decoded?.user };
  } catch (error) {
    return { status: 403, user: null };
  }
};
