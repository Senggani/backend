const auth = require("../helpers/auth");
const response = require("../helpers/response");
// const User = require("../models/Users");

module.exports = {
  protect: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return response.notAllowed(res, "Access denied. No token provided");
      }

      const token = authHeader.replace("Bearer ", "");
      const decoded = await auth.verifyToken(token);

      if (!decoded) {
        return response.notAllowed(res, "Invalid token");
      }

      const user = await User.findById(decoded.userId)
        .select("-password")
        .populate("assignments.plant")
        .populate("assignments.shop")
        .populate("assignments.line")
        .populate("assignments.station");

      if (!user || !user.isActive) {
        return response.notAllowed(res, "User not found or inactive");
      }

      req.user = {
        ...decoded,
        assignments: user.assignments,
      };
      next();
    } catch (error) {
      return response.error(res, "Authentication error", 401);
    }
  },

  authorize: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return response.notAllowed(res, "Not authorized to access this route");
      }
      next();
    };
  },

  checkAreaAccess: (areaType) => {
    return async (req, res, next) => {
      try {
        const { role, assignments } = req.user;

        // Admin can access everything
        if (role === "admin") {
          return next();
        }

        // Team leader can access their assigned plant and everything under it
        if (role === "team_leader" && assignments.plant) {
          // If accessing a specific plant
          if (areaType === "plant") {
            if (assignments.plant._id.toString() === req.params.areaId) {
              return next();
            }
          }
          // If accessing areas under their plant, allow it
          return next();
        }

        // For team members, check specific area access
        const areaId = req.params.areaId || req.body.areaId;

        if (!areaId) {
          return response.notAllowed(res, "Area ID is required");
        }

        // Check if user has access to the requested area
        if (
          !assignments[areaType] ||
          assignments[areaType]._id.toString() !== areaId
        ) {
          return response.notAllowed(
            res,
            "You do not have access to this area"
          );
        }

        next();
      } catch (error) {
        return response.error(res, "Error checking area access");
      }
    };
  },
};
