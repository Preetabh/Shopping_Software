const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
};

const otpRequestSchema = {
  body: z.object({
    phone: z.string().min(10, 'Valid phone number required')
  })
};

const otpVerifySchema = {
  body: z.object({
    phone: z.string().min(10, 'Valid phone number required'),
    otp: z.string().min(4, 'Valid OTP required')
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema
};
