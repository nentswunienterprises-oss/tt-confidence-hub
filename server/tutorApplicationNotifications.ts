import type { TutorApplication } from "@shared/schema";

type Decision = "approved" | "rejected";

const DEFAULT_APP_URL = "https://territorialtutoring.co.za";
const DEFAULT_FROM_EMAIL = "Territorial Tutoring <noreply@territorialtutoring.co.za>";
const TUTOR_GATEWAY_PATH = "/operational/tutor/gateway";

function getAppUrl() {
  return (
    process.env.APP_URL ||
    process.env.SITE_URL ||
    process.env.BASE_URL ||
    DEFAULT_APP_URL
  ).replace(/\/+$/, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildDecisionCopy(application: TutorApplication, decision: Decision, reason?: string) {
  const firstName = (application.fullName || "Tutor").trim().split(/\s+/)[0] || "Tutor";
  const gatewayUrl = `${getAppUrl()}${TUTOR_GATEWAY_PATH}`;

  if (decision === "approved") {
    return {
      subject: "Your TT tutor application was approved",
      title: "Your application was approved",
      text: [
        `Hi ${firstName},`,
        "",
        "Your Territorial Tutoring tutor application has been approved.",
        "Open the tutor gateway to upload your verification documents and continue onboarding:",
        gatewayUrl,
        "",
        "If you were not on the app when approval happened, this email is your off-app notification.",
        "",
        "Territorial Tutoring",
      ].join("\n"),
      html: [
        `<p>Hi ${escapeHtml(firstName)},</p>`,
        "<p>Your Territorial Tutoring tutor application has been approved.</p>",
        "<p>Open the tutor gateway to upload your verification documents and continue onboarding.</p>",
        `<p><a href="${gatewayUrl}">Open tutor gateway</a></p>`,
        "<p>If you were not on the app when approval happened, this email is your off-app notification.</p>",
        "<p>Territorial Tutoring</p>",
      ].join(""),
    };
  }

  const rejectionDetail = reason?.trim()
    ? `Reason provided: ${reason.trim()}`
    : "No rejection reason was included.";

  return {
    subject: "Update on your TT tutor application",
    title: "Your application was not accepted",
    text: [
      `Hi ${firstName},`,
      "",
      "Your Territorial Tutoring tutor application was reviewed and was not accepted at this stage.",
      rejectionDetail,
      "",
      "You can open the tutor gateway for the latest status:",
      gatewayUrl,
      "",
      "Territorial Tutoring",
    ].join("\n"),
    html: [
      `<p>Hi ${escapeHtml(firstName)},</p>`,
      "<p>Your Territorial Tutoring tutor application was reviewed and was not accepted at this stage.</p>",
      `<p>${escapeHtml(rejectionDetail)}</p>`,
      `<p><a href="${gatewayUrl}">Open tutor gateway</a></p>`,
      "<p>Territorial Tutoring</p>",
    ].join(""),
  };
}

export function getTutorGatewayLink() {
  return TUTOR_GATEWAY_PATH;
}

export async function sendTutorApplicationDecisionEmail(
  application: TutorApplication,
  decision: Decision,
  reason?: string,
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[tutor-application-email] RESEND_API_KEY is not configured. Skipping email send.");
    return { delivered: false, skipped: true as const };
  }

  if (!application.email) {
    console.warn("[tutor-application-email] Application email is missing. Skipping email send.", {
      applicationId: application.id,
      userId: application.userId,
    });
    return { delivered: false, skipped: true as const };
  }

  const copy = buildDecisionCopy(application, decision, reason);
  const payload = {
    from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || DEFAULT_FROM_EMAIL,
    to: [application.email],
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${errorBody}`);
  }

  return { delivered: true as const, skipped: false as const };
}
