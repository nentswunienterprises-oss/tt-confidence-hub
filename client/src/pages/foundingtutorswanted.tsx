import { Navigate } from "react-router-dom";

function FoundingTutorsWanted() {
  return <Navigate to="/operational/signup?role=tutor" replace />;
}

export default FoundingTutorsWanted;
