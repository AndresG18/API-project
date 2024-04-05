// backend/utils/validation.js
const { validationResult, check } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) { 
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.message = "Bad request.";
    next(err);
  }
  next();
};
const validateGroup = [
  // Validate name
  check('name')
    .isLength({ max: 60 })
    .withMessage('Name must be 60 characters or less'),
  // Validate about
  check('about')
    .isLength({ min: 50 })
    .withMessage('About must be 50 characters or more'),
  // Validate type
  check('type')
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  // Validate private
  check('private')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  // Validate city
  check('city')
    .notEmpty()
    .withMessage('City is required'),
  // Validate state
  check('state')
    .notEmpty()
    .withMessage('State is required'),
    handleValidationErrors
];

const validateVenue = [
  // Validate address
  check('address')
    .notEmpty()
    .withMessage('Street address is required'),
  // Validate city
  check('city')
    .notEmpty()
    .withMessage('City is required'),
  // Validate state
  check('state')
    .notEmpty()
    .withMessage('State is required'),
  // Validate latitude
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be within -90 and 90'),
  // Validate longitude
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be within -180 and 180'),
    handleValidationErrors
];

const validateEvent = [
  check('name')
  .isLength({ min: 5 }).
  withMessage('Name must be at least 5 characters'),
  check('type')
  .isIn(['Online', 'In person'])
  .withMessage('Type must be Online or In person'),
  check('capacity')
  .isInt()
  .withMessage('Capacity must be an integer'),
  check('price')
  .isFloat({ min: 0 })
  .optional({ nullable: true })
  .isNumeric().withMessage('Price is invalid'),
  check('description')
  .notEmpty()
  .withMessage('Description is required'),
  check('startDate')
  .isAfter().withMessage('Start date must be in the future'),
  check('endDate')
  .custom((value, { req }) => {
      if (!req.body.startDate) {
          throw new Error('Start date is required');
      }
      if (!req.body.endDate) {
        throw new Error('End date is required');
    }
      if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
      }
      return true;
  }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateEvent
};