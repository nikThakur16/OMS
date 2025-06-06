const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  personalDetails: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['Admin', 'Employee', 'HR', 'Manager'],
      default: 'Employee',
      required: true,
    },
    

    department: {
      type: String,
      enum: [
        'Sales', 'Marketing', 'ReactJS', 'NodeJS', 'Python', 'Java',
        'ReactNative', 'Laravel', 'Other', 'Frontend', 'Backend', 'Fullstack',
      ],
      default: 'Other',
      required: true,
    },
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId, // This field will store a MongoDB ObjectId
    required: true,                     // Every user must have an organizationId
    ref: 'Organization'                 // This tells Mongoose that the ID references a document in the 'organizations' collection
  }, 

  addressDetails: {
    streetAddress1: { type: String, required: true, trim: true },
    streetAddress2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },

  contactDetails: {
    email: { type: String, required: true, lowercase: true, trim: true },
    primaryPhoneNumber: { type: String, required: true, trim: true },
    alternatePhoneNumber: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
  },

  bankDetails: {
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    branchName: { type: String, trim: true },
  },

  password: { type: String, required: true, minlength: 6 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Define unique index on email explicitly after schema definition
userSchema.index({ 'contactDetails.email': 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
