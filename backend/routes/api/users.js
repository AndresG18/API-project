const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { ValidationError } = require('sequelize');

const validateSignup = [
  check('email').isEmail().withMessage('Invalid email'),
  check('username')
  .notEmpty()
  .withMessage("Username is required",)
  .isLength({ min: 4 })
  .withMessage("Username is required",),
  check('firstName')
  .isString().
  withMessage("First Name is required")
  .isLength({ min: 2 })
  .withMessage("First Name is required"),
  check('lastName')
  .isString()
  .withMessage("Last Name is required")
  .isLength({ min: 2 })
  .withMessage("Last Name is required"),
  handleValidationErrors
];

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { firstName, lastName, email, password, username } = req.body;

    const checkingEmail = await User.findAll({
      where: {
        email: email
      }
    })

    if (checkingEmail.length > 0) return res.status(500).json({
      "message": "User already exists",
      "errors": {
        "email": "User with that email already exists"
      }
    });

    const checkingUsername = await User.findAll({
      where: {
        username: username
      }
    })

    if (checkingUsername.length > 0) return res.status(500).json({
      "message": "User already exists",
      "errors": {
        "username": "User with that username already exists"
      }
    });

    const hashedPassword = bcrypt.hashSync(password);

    const user = await User.create({ firstName, lastName, email, username, hashedPassword });

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

module.exports = router;