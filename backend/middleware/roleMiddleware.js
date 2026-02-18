const allowRole = (role) => {
  return (req, res, next) => {
    // If route requires 'student', both students and freelancers can access
    if (role === 'student' && (req.user.role === 'student' || req.user.role === 'freelancer')) {
      return next();
    }

    // If route requires 'freelancer', only freelancers can access
    if (role === 'freelancer' && req.user.role === 'freelancer') {
      return next();
    }

    return res.status(403).json({ message: "Access denied" });
  };
};

module.exports = allowRole;
