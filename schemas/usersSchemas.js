import Joi from "joi";

export const createUser = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter"),
  token: Joi.string().default(null),
});

export const loginUser = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  token: Joi.string().default(null),
});
