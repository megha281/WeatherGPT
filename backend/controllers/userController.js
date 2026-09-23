const SavedLocation = require('../models/SavedLocation');
const ApiError = require('../utils/ApiError');

/** GET /api/user/profile */
async function getProfile(req, res) {
  res.json({ success: true, user: req.user.toPublicJSON() });
}

/** PUT /api/user/profile */
async function updateProfile(req, res, next) {
  try {
    const { name, preferredLanguage, defaultLocation } = req.body;
    if (name !== undefined) req.user.name = String(name).trim();
    if (preferredLanguage !== undefined) req.user.preferredLanguage = preferredLanguage;
    if (defaultLocation !== undefined) req.user.defaultLocation = defaultLocation || {};
    await req.user.save();
    res.json({ success: true, message: 'Profile updated.', user: req.user.toPublicJSON() });
  } catch (err) { next(err); }
}

/** PUT /api/user/preferences */
async function updatePreferences(req, res, next) {
  try {
    const { temperatureUnit, windUnit, notifications, alertMinimumSeverity, preferredLanguage, defaultLocation } = req.body;
    const prefs = req.user.preferences || {};

    if (temperatureUnit) prefs.temperatureUnit = temperatureUnit;
    if (windUnit) prefs.windUnit = windUnit;
    if (alertMinimumSeverity) prefs.alertMinimumSeverity = alertMinimumSeverity;
    if (notifications) {
      prefs.notifications = {
        email: notifications.email ?? prefs.notifications?.email ?? false,
        severeWeatherOnly: notifications.severeWeatherOnly ?? prefs.notifications?.severeWeatherOnly ?? true,
      };
    }
    req.user.preferences = prefs;
    if (preferredLanguage) req.user.preferredLanguage = preferredLanguage;
    if (defaultLocation) req.user.defaultLocation = defaultLocation;

    await req.user.save();
    res.json({ success: true, message: 'Settings saved.', user: req.user.toPublicJSON() });
  } catch (err) { next(err); }
}

/** GET /api/user/locations */
async function listLocations(req, res, next) {
  try {
    const locations = await SavedLocation.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      count: locations.length,
      locations: locations.map((l) => ({ ...l, id: String(l._id) })),
    });
  } catch (err) { next(err); }
}

/** POST /api/user/locations */
async function addLocation(req, res, next) {
  try {
    const { name, city, state, country, latitude, longitude } = req.body;
    if (!name) throw ApiError.badRequest('Give this location a name, such as Home or College');
    if (latitude === undefined || longitude === undefined) throw ApiError.badRequest('Pick a place from the search results first');

    const count = await SavedLocation.countDocuments({ user: req.user._id });
    if (count >= 25) throw ApiError.badRequest('You have reached 25 saved locations. Delete one to add another.');

    const existing = await SavedLocation.findOne({
      user: req.user._id,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    if (existing) throw ApiError.conflict('That place is already saved');

    const location = await SavedLocation.create({
      user: req.user._id,
      name,
      city: city || name,
      state: state || '',
      country: country || '',
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    res.status(201).json({ success: true, message: 'Location saved.', location: { ...location.toObject(), id: String(location._id) } });
  } catch (err) { next(err); }
}

/** DELETE /api/user/locations/:id */
async function deleteLocation(req, res, next) {
  try {
    const deleted = await SavedLocation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) throw ApiError.notFound('That saved location no longer exists');
    res.json({ success: true, message: 'Location removed.' });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, updatePreferences, listLocations, addLocation, deleteLocation };
