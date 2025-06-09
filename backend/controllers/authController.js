const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Import bcrypt for password comparison
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token generation

// Allowed enums (must match Mongoose schema and frontend options)
const allowedRoles = ["Admin", "Employee", "HR", "Manager"];
const allowedDepartments = [
  "Sales",
  "Marketing",
  "ReactJS",
  "NodeJS",
  "Python",
  "Java",
  "ReactNative",
  "Laravel",
  "Other",
  "Frontend",
  "Backend",
  "Fullstack",
];
const DEFAULT_ORGANIZATION_ID = "684131f3c7a84ecf95f105b7";

// !!! IMPORTANT: Use a strong, secret key stored in environment variables !!!
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key"; // Replace with a strong secret!

// Validation middleware
const validateRegistration = [
  // Personal Details
  body("personalDetails.firstName")
    .trim()
    .notEmpty()
    .withMessage("First Name is required"),
  body("personalDetails.lastName")
    .trim()
    .notEmpty()
    .withMessage("Last Name is required"),
  body("personalDetails.role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(allowedRoles)
    .withMessage(`Role must be one of: ${allowedRoles.join(", ")}`),
  body("personalDetails.department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isIn(allowedDepartments)
    .withMessage(`Department must be one of: ${allowedDepartments.join(", ")}`),

  // Password (top-level in schema, but comes in personalDetails from frontend Formik)
  body("personalDetails.password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("personalDetails.confirmPassword")
    .custom((value, { req }) => value === req.body.personalDetails.password)
    .withMessage("Passwords must match"),

  // Address Details
  body("addressDetails.streetAddress1")
    .trim()
    .notEmpty()
    .withMessage("Street Address is required"),
  body("addressDetails.city").trim().notEmpty().withMessage("City is required"),
  body("addressDetails.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("addressDetails.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip Code is required"),
  body("addressDetails.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),

  // Contact Details
  body("contactDetails.email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("contactDetails.primaryPhoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Primary Phone Number is required")
    .matches(/^[0-9]+$/)
    .withMessage("Primary Phone Number must be a number"),
  body("contactDetails.alternatePhoneNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]*$/)
    .withMessage("Alternate Phone Number must be a number"),
  body("contactDetails.linkedinUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid LinkedIn URL"),
  body("contactDetails.websiteUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid Website URL"),
  body("contactDetails.githubUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid GitHub URL"),

  // Bank Details
  body("bankDetails.accountHolderName")
    .trim()
    .notEmpty()
    .withMessage("Account Holder Name is required"),
  body("bankDetails.accountNumber")
    .trim()
    .notEmpty()
    .withMessage("Account Number is required"),
  body("bankDetails.ifscCode")
    .trim()
    .notEmpty()
    .withMessage("IFSC Code is required"),
  body("bankDetails.bankName")
    .trim()
    .notEmpty()
    .withMessage("Bank Name is required"),
  body("bankDetails.branchName").trim().optional({ checkFalsy: true }),
];

// Controller function
const register = [
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure the nested data and the password from req.body
    const { personalDetails, addressDetails, contactDetails, bankDetails } =
      req.body;
    // Get password separately as it's a top-level field in the backend schema
    const password = personalDetails.password;

    try {
      // Check for existing user using the email in contactDetails
      const existingUser = await User.findOne({
        "contactDetails.email": contactDetails.email,
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Create new user document
      const user = new User({
        personalDetails,
        addressDetails,
        contactDetails,
        bankDetails,
        password,
        organizationId: new mongoose.Types.ObjectId(DEFAULT_ORGANIZATION_ID),
      });

      // Save the user to the database
      await user.save();

      // Respond with success message and relevant user data
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          organizationId: user.organizationId,
          personalDetails: {
            firstName: user.personalDetails.firstName,
            lastName: user.personalDetails.lastName,
            role: user.personalDetails.role,
            department: user.personalDetails.department,
          },
          addressDetails: user.addressDetails,
          contactDetails: {
            email: user.contactDetails.email,
            primaryPhoneNumber: user.contactDetails.primaryPhoneNumber,
          },
          bankDetails: {
            accountHolderName: user.bankDetails.accountHolderName,
            bankName: user.bankDetails.bankName,
          },
        },
      });
    } catch (err) {
      console.error("Registration failed during save:", err);
      if (err.errors) {
        console.error("Validation Errors:", err.errors);
      }
      res.status(500).json({ error: "Server error during registration" });
    }
  },
];

// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Find all users and select the fields you want to return
    const users = await User.find(
      {},
      "_id personalDetails contactDetails.email"
    );

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller function for user login
const login = async (req, res) => {
  // Basic validation (you could add more using express-validator)
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please enter both email and password" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ "contactDetails.email": email });

    // Check if user exists
    if (!user) {
      // Use a generic error message for security
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // Check if passwords match
    if (!isMatch) {
      // Use a generic error message for security
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // const role = await User.findById(user._id).select("personalDetails.role");
    // // Check if the user is an Admin
    // if (role.personalDetails.role !== "Admin") {
    //   return res
    //     .status(403)
    //     .json({ error: "Access denied. Only Admins can login." });
    // }

    // User is authenticated! Generate a JWT token.
    const payload = {
      user: {
        id: user._id,
        role: user.personalDetails.role,
        organizationId: user.organizationId,
      },
    };

    jwt.sign(
      payload,
      jwtSecret, // Use your secret key
      { expiresIn: "1h" }, // Token expiration time (adjust as needed)
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {
          httpOnly: true, // ✅ Not accessible to JavaScript
          secure: process.env.NODE_ENV === "prodution", // ✅ Only over HTTPS in prod
          sameSite: "strict", // ✅ Prevents CSRF
          maxAge: 60 * 60 * 1000, // ✅ 1 hour in milliseconds
          path: "/", // ✅ Makes cookie available throughout the app
        });
        // Send success response with the token and user details INCLUDING organizationId

        res.json({
          message: "Login successful",
          token,
          user: {
            id: user._id,
            firstName: user.personalDetails.firstName,
            lastName: user.personalDetails.lastName,
            role: user.personalDetails.role,
            department: user.personalDetails.department,
            email: user.contactDetails.email,
            organizationId: user.organizationId,
            // Add other safe user details you want on the frontend immediately
          },
        });
      }
    );
  } catch (err) {
    console.error("Server error during login:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

module.exports = { register, getAllUsers, login };
