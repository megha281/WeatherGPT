#!/usr/bin/env node
/**
 * Optional helper: stores a couple of WeatherGPT-labelled alerts in MongoDB so
 * the Alerts page has stored records to show during a demo.
 *
 *   npm run seed:alerts
 *
 * These are clearly labelled as WeatherGPT assessments derived from the live
 * Open-Meteo forecast for the given place - they are not official warnings and
 * no weather values are invented.
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const Alert = require('../models/Alert');
const geocodingService = require('../services/geocodingService');
const alertService = require('../services/alertService');

const PLACES = process.argv.slice(2).length ? process.argv.slice(2) : ['Bellary', 'Bengaluru'];

(async () => {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB.');

  for (const place of PLACES) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const location = await geocodingService.resolveLocation(place);
      // eslint-disable-next-line no-await-in-loop
      const { generated } = await alertService.getGeneratedAlerts(location.latitude, location.longitude, location);

      if (!generated.length) {
        console.log(`${place}: no risks above LOW in the current forecast, nothing stored.`);
        continue;
      }

      for (const alert of generated) {
        // eslint-disable-next-line no-await-in-loop
        await Alert.findOneAndUpdate(
          { type: alert.type, 'location.latitude': location.latitude, validFrom: alert.validFrom },
          {
            location: alert.location,
            type: alert.type,
            severity: alert.severity,
            description: alert.description,
            advisory: alert.advisory,
            sourceType: 'weathergpt',
            source: 'WeatherGPT Risk Assessment',
            validFrom: alert.validFrom,
            validUntil: alert.validUntil,
          },
          { upsert: true }
        );
      }
      console.log(`${place}: stored ${generated.length} assessment(s).`);
    } catch (err) {
      console.error(`${place}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
})();
