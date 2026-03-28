#!/usr/bin/env bash
# Check if the /api/tutor/student/:studentId/intro-session-details route is live
# Usage: ./check_intro_session_route.sh <API_BASE_URL> <STUDENT_ID> <JWT_TOKEN>

API_BASE_URL="$1"
STUDENT_ID="$2"
JWT_TOKEN="$3"

if [ -z "$API_BASE_URL" ] || [ -z "$STUDENT_ID" ] || [ -z "$JWT_TOKEN" ]; then
  echo "Usage: $0 <API_BASE_URL> <STUDENT_ID> <JWT_TOKEN>"
  exit 1
fi

URL="$API_BASE_URL/api/tutor/student/$STUDENT_ID/intro-session-details"
echo "Checking: $URL"

curl -i -X GET "$URL" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Accept: application/json"
