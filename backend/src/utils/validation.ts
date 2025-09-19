import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  userType: Joi.string().valid('user', 'provider', 'admin').required().messages({
    'any.only': 'Tipo de usuário deve ser: user, provider ou admin',
    'any.required': 'Tipo de usuário é obrigatório'
  })
});

export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  phone: Joi.string().pattern(/^\d{10,11}$/).required().messages({
    'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos',
    'any.required': 'Telefone é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

export const registerProviderSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  phone: Joi.string().pattern(/^\d{10,11}$/).required().messages({
    'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos',
    'any.required': 'Telefone é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  cnh: Joi.string().length(11).pattern(/^\d+$/).required().messages({
    'string.length': 'CNH deve ter exatamente 11 dígitos',
    'string.pattern.base': 'CNH deve conter apenas números',
    'any.required': 'CNH é obrigatória'
  })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token é obrigatório'
  })
});