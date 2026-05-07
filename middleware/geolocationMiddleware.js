const { haversineDistance } = require('../utils/distanceCalculator');

function validateGeo(req, res, next) {
  const { lat_target, long_target, latitude, longitude, radius_meter = 500 } = req.geoPayload;
  const distance = haversineDistance(Number(latitude), Number(longitude), Number(lat_target), Number(long_target));
  req.geoDistance = distance;
  if (distance > Number(radius_meter)) return res.status(400).json({ message: `Outside radius (${Math.round(distance)}m)` });
  next();
}

module.exports = { validateGeo };
