

// Cek role user (wajib developer)
exports.ensureDeveloper = (req, res, next) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({
      success: false,
      message: 'Only developer can manage portfolio'
    });
  }
  next();
};


// Cek role user (wajib client)
exports.ensureClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Only client can manage projects'
    });
  }
  next();
};
