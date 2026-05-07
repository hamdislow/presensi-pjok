function requireRoles(...roles) {
  return (req, res, next) => {
    const role = req.user.user_metadata?.role;
    if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

function enforceRombel(req, res, next) {
  const role = req.user.user_metadata?.role;
  const userRombel = String(req.user.user_metadata?.rombel_id || '');
  const target = String(req.body.rombel_id || req.query.rombel_id || req.params.rombel_id || '');
  if (role === 'admin' || !target || userRombel === target) return next();
  return res.status(403).json({ message: 'Rombel access denied' });
}

module.exports = { requireRoles, enforceRombel };
