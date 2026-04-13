import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type SyncGoogleMeetEventInput = {
  scheduledSessionId: string;
  summary: string;
  description?: string | null;
  startIso: string;
  endIso: string;
  timezone: string;
  attendees?: Array<{ email?: string | null; displayName?: string | null }>;
  existingEventId?: string | null;
  tutorEmail?: string | null;
};

type ReconcileMeetArtifactsInput = {
  googleMeetSpaceName?: string | null;
  googleMeetCode?: string | null;
};

type SyncGoogleMeetEventResult =
  | {
      provider: "google_calendar";
      googleCalendarId: string;
      googleEventId: string | null;
      googleMeetUrl: string | null;
      googleConferenceId: string | null;
      googleMeetSpaceName: string | null;
      googleMeetCode: string | null;
      hostAccountId: string | null;
      autoRecordingEnabled: boolean;
      autoTranscriptionEnabled: boolean;
      attendanceReportEnabled: boolean;
      tutorCohostStatus: "configured" | "failed" | "skipped";
      meetConfigError: string | null;
      tutorCohostError: string | null;
    }
  | {
      provider: "disabled";
      reason: string;
    }
  | {
      provider: "error";
      reason: string;
    };

type ReconcileMeetArtifactsResult =
  | {
      provider: "google_meet_artifacts";
      recordingFileId: string | null;
      recordingDetectedAt: string | null;
      transcriptFileId: string | null;
      transcriptDetectedAt: string | null;
      artifactSyncAt: string;
    }
  | {
      provider: "disabled";
      reason: string;
    }
  | {
      provider: "error";
      reason: string;
    };

type GoogleCredentialShape = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  refresh_token: string;
  calendar_id: string;
};

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/meetings.space.settings",
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly",
];

function safeReadJson(filePath: string) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function loadGoogleCredentials(): GoogleCredentialShape | null {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || null;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || null;
  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
    process.env.GOOGLE_REDIRECT_URI ||
    "urn:ietf:wg:oauth:2.0:oob";
  const refreshToken =
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || null;
  const calendarId =
    process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_MEET_CALENDAR_ID || "primary";

  if (clientId && clientSecret && refreshToken) {
    return {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      refresh_token: refreshToken,
      calendar_id: calendarId,
    };
  }

  const credentialsPath = resolve(
    process.cwd(),
    "client_secret_175952709987-on8a0u7o2j80oj40i2irufg78au227ut.apps.googleusercontent.com.json"
  );
  const tokenPath = resolve(process.cwd(), "google-calendar-token.json");
  const credentialJson = safeReadJson(credentialsPath);
  const tokenJson = safeReadJson(tokenPath);

  const installedCreds = credentialJson?.installed || credentialJson?.web || null;
  const tokenRefresh = tokenJson?.refresh_token || null;

  if (
    installedCreds?.client_id &&
    installedCreds?.client_secret &&
    Array.isArray(installedCreds?.redirect_uris) &&
    installedCreds.redirect_uris.length > 0 &&
    tokenRefresh
  ) {
    return {
      client_id: installedCreds.client_id,
      client_secret: installedCreds.client_secret,
      redirect_uri: installedCreds.redirect_uris[0],
      refresh_token: tokenRefresh,
      calendar_id: calendarId,
    };
  }

  return null;
}

export function isGoogleMeetIntegrationAvailable() {
  return !!loadGoogleCredentials();
}

async function getGoogleAuthClient() {
  const creds = loadGoogleCredentials();
  if (!creds) {
    return { creds: null, auth: null as any };
  }

  const { google } = await import("googleapis");
  const auth = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uri
  );
  auth.setCredentials({
    refresh_token: creds.refresh_token,
    scope: GOOGLE_SCOPES.join(" "),
  });

  return { creds, auth };
}

async function getGoogleAccessToken(auth: any) {
  const tokenResponse = await auth.getAccessToken();
  const accessToken =
    typeof tokenResponse === "string"
      ? tokenResponse
      : tokenResponse?.token || null;
  if (!accessToken) {
    throw new Error("Failed to obtain Google access token.");
  }
  return accessToken;
}

async function googleJsonRequest<T>(auth: any, url: string, init?: RequestInit): Promise<T> {
  const accessToken = await getGoogleAccessToken(auth);
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(payload || `Google API request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

function parseMeetCodeFromUrl(url?: string | null) {
  const match = String(url || "").match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
  return match?.[1] || null;
}

async function resolveMeetSpace(auth: any, meetCode?: string | null) {
  if (!meetCode) return null;
  const encodedCode = encodeURIComponent(meetCode);
  const space = await googleJsonRequest<any>(auth, `https://meet.googleapis.com/v2/spaces/${encodedCode}`);
  return space || null;
}

async function configureMeetSpace(auth: any, spaceName?: string | null) {
  if (!spaceName) {
    return {
      autoRecordingEnabled: false,
      autoTranscriptionEnabled: false,
      attendanceReportEnabled: false,
      meetConfigError: "Meet space could not be resolved from the generated Meet link.",
    };
  }

  try {
    const patched = await googleJsonRequest<any>(
      auth,
      `https://meet.googleapis.com/v2/${spaceName}?updateMask=config.artifactConfig.recordingConfig.autoRecordingGeneration,config.artifactConfig.transcriptionConfig.autoTranscriptionGeneration,config.moderation`,
      {
        method: "PATCH",
        body: JSON.stringify({
          config: {
            moderation: "ON",
            artifactConfig: {
              recordingConfig: {
                autoRecordingGeneration: "ON",
              },
              transcriptionConfig: {
                autoTranscriptionGeneration: "ON",
              },
            },
          },
        }),
      }
    );

    const config = patched?.config || {};
    return {
      autoRecordingEnabled: String(config?.artifactConfig?.recordingConfig?.autoRecordingGeneration || "").toUpperCase() === "ON",
      autoTranscriptionEnabled: String(config?.artifactConfig?.transcriptionConfig?.autoTranscriptionGeneration || "").toUpperCase() === "ON",
      attendanceReportEnabled: String(config?.attendanceReportGenerationType || "").toUpperCase() === "GENERATE_REPORT",
      meetConfigError: null,
    };
  } catch (error: any) {
    return {
      autoRecordingEnabled: false,
      autoTranscriptionEnabled: false,
      attendanceReportEnabled: false,
      meetConfigError: error?.message || "Failed to configure Meet auto-artifacts.",
    };
  }
}

async function ensureTutorCohost(auth: any, spaceName?: string | null, tutorEmail?: string | null) {
  if (!spaceName || !tutorEmail) {
    return {
      tutorCohostStatus: "skipped" as const,
      tutorCohostError: tutorEmail ? "Meet space not available for co-host configuration." : "Tutor email not available for co-host configuration.",
    };
  }

  try {
    await googleJsonRequest<any>(auth, `https://meet.googleapis.com/v2beta/${spaceName}/members`, {
      method: "POST",
      body: JSON.stringify({
        email: tutorEmail,
        role: "COHOST",
      }),
    });
    return {
      tutorCohostStatus: "configured" as const,
      tutorCohostError: null,
    };
  } catch (error: any) {
    return {
      tutorCohostStatus: "skipped" as const,
      tutorCohostError: error?.message || "Tutor co-host configuration is unavailable for this Google Meet tenant.",
    };
  }
}

async function listConferenceRecords(auth: any, spaceName?: string | null) {
  if (!spaceName) return [];
  const filter = encodeURIComponent(`space.name="${spaceName}"`);
  const response = await googleJsonRequest<any>(
    auth,
    `https://meet.googleapis.com/v2/conferenceRecords?filter=${filter}&pageSize=10`
  );
  return Array.isArray(response?.conferenceRecords) ? response.conferenceRecords : [];
}

async function listRecordings(auth: any, conferenceRecordName: string) {
  const response = await googleJsonRequest<any>(
    auth,
    `https://meet.googleapis.com/v2/${conferenceRecordName}/recordings?pageSize=10`
  );
  return Array.isArray(response?.recordings) ? response.recordings : [];
}

async function listTranscripts(auth: any, conferenceRecordName: string) {
  const response = await googleJsonRequest<any>(
    auth,
    `https://meet.googleapis.com/v2/${conferenceRecordName}/transcripts?pageSize=10`
  );
  return Array.isArray(response?.transcripts) ? response.transcripts : [];
}

export async function syncGoogleMeetEvent(
  input: SyncGoogleMeetEventInput
): Promise<SyncGoogleMeetEventResult> {
  const { creds, auth } = await getGoogleAuthClient();
  if (!creds || !auth) {
    return {
      provider: "disabled",
      reason:
        "Google Calendar credentials are not configured. Session scheduling will continue without a Meet link.",
    };
  }

  try {
    const { google } = await import("googleapis");
    const calendar = google.calendar({ version: "v3", auth });
    const attendees = (input.attendees || [])
      .filter((entry): entry is { email: string; displayName?: string | null } => !!entry?.email)
      .map((entry) => ({
        email: entry.email,
        displayName: entry.displayName || undefined,
      }));

    const requestBody: any = {
      summary: input.summary,
      description: input.description || undefined,
      start: {
        dateTime: input.startIso,
        timeZone: input.timezone,
      },
      end: {
        dateTime: input.endIso,
        timeZone: input.timezone,
      },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: `tt-${input.scheduledSessionId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      extendedProperties: {
        private: {
          scheduledSessionId: input.scheduledSessionId,
          meetingOwner: "TT",
          complianceMode: "recording-and-transcript",
        },
      },
    };

    const response = input.existingEventId
      ? await calendar.events.patch({
          calendarId: creds.calendar_id,
          eventId: input.existingEventId,
          requestBody,
          conferenceDataVersion: 1,
          sendUpdates: attendees.length > 0 ? "all" : "none",
        })
      : await calendar.events.insert({
          calendarId: creds.calendar_id,
          requestBody,
          conferenceDataVersion: 1,
          sendUpdates: attendees.length > 0 ? "all" : "none",
        });

    const event = response.data;
    const videoEntryPoint = (event.conferenceData?.entryPoints || []).find(
      (entry) => entry.entryPointType === "video"
    );
    const googleMeetUrl = videoEntryPoint?.uri || event.hangoutLink || null;
    const googleMeetCode = parseMeetCodeFromUrl(googleMeetUrl);
    const space = await resolveMeetSpace(auth, googleMeetCode);
    const spaceName = space?.name || null;
    const meetConfig = await configureMeetSpace(auth, spaceName);
    const cohostConfig = await ensureTutorCohost(auth, spaceName, input.tutorEmail || null);

    return {
      provider: "google_calendar",
      googleCalendarId: creds.calendar_id,
      googleEventId: event.id || input.existingEventId || null,
      googleMeetUrl,
      googleConferenceId: event.conferenceData?.conferenceId || null,
      googleMeetSpaceName: spaceName,
      googleMeetCode,
      hostAccountId: process.env.GOOGLE_MEET_HOST_ACCOUNT_ID || creds.calendar_id || "primary",
      autoRecordingEnabled: meetConfig.autoRecordingEnabled,
      autoTranscriptionEnabled: meetConfig.autoTranscriptionEnabled,
      attendanceReportEnabled: meetConfig.attendanceReportEnabled,
      tutorCohostStatus: cohostConfig.tutorCohostStatus,
      meetConfigError: meetConfig.meetConfigError,
      tutorCohostError: cohostConfig.tutorCohostError,
    };
  } catch (error: any) {
    console.error("Google Meet sync failed:", error);
    return {
      provider: "error",
      reason:
        error?.message ||
        "Google Calendar request failed while creating or updating the Meet event.",
    };
  }
}

export async function reconcileGoogleMeetArtifacts(
  input: ReconcileMeetArtifactsInput
): Promise<ReconcileMeetArtifactsResult> {
  const { auth } = await getGoogleAuthClient();
  if (!auth) {
    return {
      provider: "disabled",
      reason: "Google Meet credentials are not configured.",
    };
  }

  try {
    const spaceName =
      input.googleMeetSpaceName ||
      (input.googleMeetCode ? `spaces/${input.googleMeetCode}` : null);

    if (!spaceName) {
      return {
        provider: "error",
        reason: "Meet space is not known for this session.",
      };
    }

    const conferenceRecords = await listConferenceRecords(auth, spaceName);
    if (conferenceRecords.length === 0) {
      return {
        provider: "google_meet_artifacts",
        recordingFileId: null,
        recordingDetectedAt: null,
        transcriptFileId: null,
        transcriptDetectedAt: null,
        artifactSyncAt: new Date().toISOString(),
      };
    }

    const mostRecentConference = conferenceRecords[0];
    const conferenceRecordName = mostRecentConference?.name;
    if (!conferenceRecordName) {
      return {
        provider: "error",
        reason: "Conference record name is missing from Google Meet.",
      };
    }

    const [recordings, transcripts] = await Promise.all([
      listRecordings(auth, conferenceRecordName),
      listTranscripts(auth, conferenceRecordName),
    ]);

    const latestRecording = recordings[0] || null;
    const latestTranscript = transcripts[0] || null;

    return {
      provider: "google_meet_artifacts",
      recordingFileId:
        latestRecording?.driveDestination?.file ||
        latestRecording?.driveDestination?.exportUri ||
        null,
      recordingDetectedAt: latestRecording?.endTime || latestRecording?.startTime || null,
      transcriptFileId:
        latestTranscript?.docsDestination?.document ||
        latestTranscript?.docsDestination?.exportUri ||
        null,
      transcriptDetectedAt: latestTranscript?.endTime || latestTranscript?.startTime || null,
      artifactSyncAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Google Meet artifact reconciliation failed:", error);
    return {
      provider: "error",
      reason:
        error?.message ||
        "Google Meet artifact reconciliation failed.",
    };
  }
}
