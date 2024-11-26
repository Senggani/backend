const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = {
  hashPassword: async (password) => {
    try {
      const salt = await bcrypt.genSalt(12);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error("Error hashing password");
    }
  },

  comparePassword: async (candidatePassword, hashedPassword) => {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  },

  generateSessionId: () => {
    return crypto.randomBytes(32).toString("hex");
  },

  // For timing attack prevention
  safeCompare: (a, b) => {
    return crypto.timingSafeEqual(
      Buffer.from(a, "utf8"),
      Buffer.from(b, "utf8")
    );
  },

  // Password validation
  validatePassword: (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUppercase) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!hasLowercase) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!hasNumber) {
      errors.push("Password must contain at least one number");
    }
    if (!hasSpecialChar) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Token version management for force logout
  incrementTokenVersion: async (Users, userId) => {
    await Users.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  },
};
