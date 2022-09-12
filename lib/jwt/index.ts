import jwt from "jsonwebtoken";

export function createToken(authId) {
  const token = jwt.sign({ authId }, process.env.JWT_KEY);
  return token;
}

export function decode(token) {
  try {
    const validate = jwt.verify(token, process.env.JWT_KEY);
    return validate;
  } catch (error) {
    console.error({ error });
  }
}
