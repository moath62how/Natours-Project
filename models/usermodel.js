const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      required: [true, 'Please enter a name'],
      type: String,
    },
    email: {
      required: [true, 'Please enter a email address'],
      type: String,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please enter a valid email address'],
      // match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      required: [true, 'please enter a password'],
      type: String,
      minlength: [8, 'A password must be at least 8 characters'],
      select: false,
    },
    confirmPassword: {
      required: [true, 'please enter the same password'],
      type: String,
      minlength: 8,
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: 'Please enter the same password',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    passwordChangedAt: Date,
    passwordRestToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { strict: false },
);
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordRestToken = function () {
  const restToken = crypto.randomBytes(32).toString('hex');

  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return restToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
