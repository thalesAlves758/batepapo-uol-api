import joi from 'joi';

export default {
  getSchema: () =>
    joi.object({
      name: joi.string().required(),
    }),
};
