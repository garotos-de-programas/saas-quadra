import jwt from 'jsonwebtoken';

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.AUTH_SECRET!, {
    expiresIn: '1d',
  });
};

export default generateToken; 