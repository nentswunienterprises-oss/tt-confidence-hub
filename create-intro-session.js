// create-intro-session.js
// Usage: Call createIntroSessionEvent with session details

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, 'google-calendar-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_175952709987-on8a0u7o2j80oj40i2irufg78au227ut.apps.googleusercontent.com.json');

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

export async function createIntroSessionEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  parentEmail,
  tutorEmail,
}) {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: 'Africa/Johannesburg', // Adjust as needed
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Africa/Johannesburg',
    },
    attendees: [
      { email: parentEmail },
      { email: tutorEmail },
    ],
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(2, 15),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data;
}

// Example usage:
// (async () => {
//   const event = await createIntroSessionEvent({
//     summary: 'Intro Tutoring Session',
//     description: 'First session for parent and tutor.',
//     startDateTime: '2026-03-09T15:00:00+02:00',
//     endDateTime: '2026-03-09T16:00:00+02:00',
//     parentEmail: 'parent@example.com',
//     tutorEmail: 'tutor@example.com',
//   });
//   console.log('Event created:', event);
// })();
