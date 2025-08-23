import Joi from "joi";

export const SignupSchema = {
  body: Joi.object({
    firstName: Joi.string().required().trim().min(6).messages({
      "string.base": "First name must be a string",
      "string.min": "First name should be at least 6 characters",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().trim().min(4).messages({
      "string.base": "Last name must be a string",
      "string.min": "Last name should be at least 4 characters",
      "any.required": "Last name is required",
    }),
    email: Joi.string()
      .email({
        tlds: ["com", "org", "net"],
      })
      .required()
      .trim()
      .lowercase()
      .messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
      }),
    password: Joi.string()
      .min(6)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .required()
      .messages({
        "string.min": "Password should be at least 6 characters",
        "any.required": "Password is required",
      }),
    phone: Joi.string().max(11).required().messages({
      "any.required": "phone is required",
    }),
    role: Joi.string().valid("user", "Admin").default("user"),
    gender: Joi.string().valid("male", "female"),
    age: Joi.number().required().min(18).max(100).messages({
      "number.base": "Age must be a number",
      "number.min": "Age must be at least 18",
      "number.max": "Age must be less than or equal to 100",
      "any.required": "Age is required",
    }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: ["com", "org", "net"],
      })
      .trim()
      .lowercase(),
    password: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .min(6),
  }),
};
export const updateSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(6).messages({
      "string.base": "First name must be a string",
      "string.min": "First name should be at least 6 characters",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().trim().min(4).messages({
      "string.base": "Last name must be a string",
      "string.min": "Last name should be at least 4 characters",
      "any.required": "Last name is required",
    }),
    email: Joi.string().email().trim().lowercase().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(6)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .messages({
        "string.min": "Password should be at least 6 characters",
        "any.required": "Password is required",
      }),
    phone: Joi.string().max(11).messages({
      "any.required": "phone is required",
    }),
  }),
};

export const updatePassSchema = {
  body: Joi.object({
    oldPassword: Joi.string()
      .min(6)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .messages({
        "string.min": "Password should be at least 6 characters",
        "any.required": "Password is required",
      }),
    newPassword: Joi.string()
      .min(6)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .messages({
        "string.min": "Password should be at least 6 characters",
        "any.required": "Password is required",
      }),
  }),
};
export const resetPassSchema = {
  body: Joi.object({
    newPassword: Joi.string()
      .min(6)
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/
      )
      .messages({
        "string.min": "Password should be at least 6 characters",
        "any.required": "Password is required",
      }),
    OTP: Joi.string().alphanum().length(6).required(),
  }),
};

export const resendOTPSchema={
  Query:Joi.object({
    email:Joi.string().email().required().trim().lowercase()
  })
}