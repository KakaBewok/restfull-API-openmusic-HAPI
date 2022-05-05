const InvariantError = require('../../exceptions/InvariantError');
const { CoverSchema } = require('./schema');

const CoverValidator = {
  validateCoverHeaders: (headers) => {
    const validationResult = CoverSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CoverValidator;
