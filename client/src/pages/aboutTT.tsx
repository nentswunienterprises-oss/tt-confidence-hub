import { Navigate, useLocation } from "react-router-dom";

export default function LegacyAboutRedirect() {
  const location = useLocation();

  return <Navigate to={`/about${location.search}`} replace />;
}
