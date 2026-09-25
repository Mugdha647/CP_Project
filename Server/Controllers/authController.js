const User = require("../models/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const signup = async (req, res) => {

  try {
    const {
      username,
      email,
      password
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields"
      });
    }


    // Check password length

    if (password.length < 8) {

      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });

    }


    // Check existing email

    const existingEmail = await User.findOne({
      email
    });

    if (existingEmail) {

      return res.status(400).json({
        message: "Email is already registered"
      });

    }


    // Check existing username

    const existingUsername = await User.findOne({
      username
    });

    if (existingUsername) {

      return res.status(400).json({
        message: "Username is already taken"
      });

    }


    // Hash password

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    // Create user

    const user = await User.create({

      username,

      email,

      password: hashedPassword,

      role: "user"

    });


    // Response

    res.status(201).json({

      message: "Account created successfully",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

const login = async (req, res) => {

  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });

    }

    const user = await User.findOne({
      email
    });


    if (!user) {

      return res.status(401).json({
        message: "Invalid email or password"
      });

    }


    // Compare password

    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordCorrect) {

      return res.status(401).json({
        message: "Invalid email or password"
      });

    }


    // Create JWT

    const token = jwt.sign(

      {
        userId: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );


    // Send response

    res.json({

      message: "Login successful",

      token,

      user: {

        id: user._id,

        username: user.username,

        email: user.email,

        role: user.role

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


module.exports = {
  signup,
  login
};