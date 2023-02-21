import Joi from "joi";

const signUpBodyValidation = (body) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(body);
};

export { signUpBodyValidation };
