import joi from 'joi';

export default {
  getSchema: (participantsName) =>
    joi.object({
      to: joi.string().required(),
      text: joi.string().required(),
      type: joi.string().required().valid('message', 'private_message'),
      from: joi
        .string()
        .required()
        .valid(...participantsName),
    }),
};
