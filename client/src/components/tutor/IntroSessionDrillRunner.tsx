import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

type PhaseLabel = "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability";
type DrillMode = "diagnosis" | "training";
type ObservationField = { key: string; label: string; options: string[] };
type DrillSetConfig = { setName: string; reps: number; observationBlock: ObservationField[] };

const DIAGNOSIS_SETS_BY_PHASE: Record<PhaseLabel, DrillSetConfig[]> = {
  Clarity: [
    {
      setName: "Recognition Probe",
      reps: 3,
      observationBlock: [
        { key: "vocabulary", label: "Vocabulary", options: ["cannot name", "partial", "clear"] },
        { key: "method", label: "Type + Method Recognition", options: ["wrong", "hesitant", "correct"] },
        { key: "reason", label: "Step Awareness", options: ["none", "partial", "clear"] },
        { key: "immediateApply", label: "Response Behavior", options: ["avoids", "unsure", "engages"] },
      ],
    },
    {
      setName: "Light Apply Probe",
      reps: 3,
      observationBlock: [
        { key: "vocabulary", label: "Vocabulary Usage", options: ["incorrect", "partial", "correct"] },
        { key: "method", label: "Step Execution", options: ["random", "partial", "structured"] },
        { key: "reason", label: "Reason Awareness", options: ["none", "weak", "present"] },
        { key: "immediateApply", label: "Start Behavior", options: ["cannot start", "delayed", "starts"] },
      ],
    },
  ],
  "Structured Execution": [
    {
      setName: "Start + Structure",
      reps: 3,
      observationBlock: [
        { key: "startBehavior", label: "Start Behavior", options: ["avoids", "delayed", "immediate"] },
        { key: "stepExecution", label: "Step Execution", options: ["random / guessing", "partial steps", "full structure"] },
        { key: "repeatability", label: "Step Order", options: ["incorrect", "minor errors", "correct"] },
        { key: "independence", label: "Dependence", options: ["waits for help", "asks after trying", "independent"] },
      ],
    },
    {
      setName: "Repeatability",
      reps: 3,
      observationBlock: [
        { key: "repeatability", label: "Consistency", options: ["breaks each time", "inconsistent", "stable"] },
        { key: "stepExecution", label: "Step Recall", options: ["forgets", "partial", "full"] },
        { key: "independence", label: "Error Pattern", options: ["guessing", "careless", "structured"] },
        { key: "startBehavior", label: "Completion", options: ["cannot finish", "partial", "complete"] },
      ],
    },
  ],
  "Controlled Discomfort": [
    {
      setName: "First Contact",
      reps: 3,
      observationBlock: [
        { key: "initialResponse", label: "Initial Response", options: ["freeze", "hesitate", "attempt"] },
        { key: "firstStepControl", label: "First Step", options: ["none", "prompted", "independent"] },
        { key: "discomfortTolerance", label: "Emotional State", options: ["panic", "tension", "controlled"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["asks immediately", "asks later", "no rescue"] },
      ],
    },
    {
      setName: "Pressure Hold",
      reps: 3,
      observationBlock: [
        { key: "discomfortTolerance", label: "Persistence", options: ["gives up", "short attempt", "stays engaged"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["asks immediately", "asks later", "no rescue"] },
        { key: "firstStepControl", label: "Structure Retention", options: ["breaks", "partial", "maintained"] },
        { key: "initialResponse", label: "Recovery", options: ["collapses", "partial", "recovers"] },
      ],
    },
  ],
  "Time Pressure Stability": [
    {
      setName: "Light Timer",
      reps: 3,
      observationBlock: [
        { key: "startUnderTime", label: "Start", options: ["freeze", "delayed", "immediate"] },
        { key: "structureUnderTime", label: "Structure", options: ["breaks", "partial", "maintained"] },
        { key: "paceControl", label: "Pace", options: ["panic", "rushed", "controlled"] },
        { key: "completionIntegrity", label: "Completion", options: ["fails", "partial", "complete"] },
      ],
    },
    {
      setName: "Consistency",
      reps: 3,
      observationBlock: [
        { key: "completionIntegrity", label: "Consistency", options: ["collapses", "inconsistent", "stable"] },
        { key: "startUnderTime", label: "Behavior", options: ["panic", "tension", "composed"] },
        { key: "structureUnderTime", label: "Structure", options: ["breaks", "partial", "maintained"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
      ],
    },
  ],
};

const TRAINING_SETS_BY_PHASE: Record<PhaseLabel, DrillSetConfig[]> = {
  Clarity: [
    {
      setName: "Modeling",
      reps: 3,
      observationBlock: [
        { key: "vocabulary", label: "Vocabulary", options: ["cannot name", "partial", "clear"] },
        { key: "method", label: "Method", options: ["cannot state steps", "partial", "clear"] },
        { key: "reason", label: "Reason", options: ["no idea", "vague", "clear"] },
        { key: "immediateApply", label: "Immediate Apply / Response", options: ["cannot repeat / avoids", "partial", "independent"] },
      ],
    },
    {
      setName: "Identification",
      reps: 3,
      observationBlock: [
        { key: "vocabulary", label: "Vocabulary", options: ["cannot name", "partial", "clear"] },
        { key: "method", label: "Method", options: ["cannot state steps", "partial", "clear"] },
        { key: "reason", label: "Reason", options: ["no idea", "vague", "clear"] },
        { key: "immediateApply", label: "Immediate Apply / Response", options: ["cannot repeat / avoids", "partial", "independent"] },
      ],
    },
    {
      setName: "Light Apply",
      reps: 3,
      observationBlock: [
        { key: "vocabulary", label: "Vocabulary", options: ["cannot name", "partial", "clear"] },
        { key: "method", label: "Method", options: ["cannot state steps", "partial", "clear"] },
        { key: "reason", label: "Reason", options: ["no idea", "vague", "clear"] },
        { key: "immediateApply", label: "Immediate Apply / Response", options: ["cannot repeat / avoids", "partial", "independent"] },
      ],
    },
  ],
  "Structured Execution": [
    {
      setName: "Forced Structure",
      reps: 3,
      observationBlock: [
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
        { key: "stepExecution", label: "Step Discipline", options: ["skips", "partial", "full"] },
        { key: "repeatability", label: "Correction Response", options: ["resists", "accepts", "adjusts"] },
        { key: "independence", label: "Independence", options: ["needs help", "light support", "independent"] },
      ],
    },
    {
      setName: "Independent Execution",
      reps: 3,
      observationBlock: [
        { key: "independence", label: "Independence", options: ["needs help", "light support", "independent"] },
        { key: "repeatability", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "stepExecution", label: "Error Handling", options: ["guesses", "partial correction", "structured correction"] },
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
      ],
    },
    {
      setName: "Variation Control",
      reps: 3,
      observationBlock: [
        { key: "stepExecution", label: "Transfer", options: ["cannot adapt", "partial", "adapts"] },
        { key: "repeatability", label: "Step Retention", options: ["lost", "partial", "stable"] },
        { key: "independence", label: "Completion", options: ["fails", "partial", "complete"] },
        { key: "startBehavior", label: "Start", options: ["delayed", "hesitant", "immediate"] },
      ],
    },
  ],
  "Controlled Discomfort": [
    {
      setName: "Controlled Entry",
      reps: 3,
      observationBlock: [
        { key: "initialResponse", label: "Start Control", options: ["freeze", "hesitant", "controlled"] },
        { key: "firstStepControl", label: "First-Step Accuracy", options: ["wrong", "partial", "correct"] },
        { key: "discomfortTolerance", label: "Stability", options: ["breaks", "unstable", "stable"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["frequent", "occasional", "none"] },
      ],
    },
    {
      setName: "No Rescue",
      reps: 3,
      observationBlock: [
        { key: "rescueDependence", label: "Independence", options: ["dependent", "partial", "independent"] },
        { key: "discomfortTolerance", label: "Stability", options: ["breaks", "unstable", "stable"] },
        { key: "initialResponse", label: "Recovery", options: ["collapses", "partial", "recovers"] },
        { key: "firstStepControl", label: "First-Step Control", options: ["none", "prompted", "independent"] },
      ],
    },
    {
      setName: "Repeat Exposure",
      reps: 3,
      observationBlock: [
        { key: "discomfortTolerance", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "initialResponse", label: "Recovery", options: ["collapses", "partial", "recovers"] },
        { key: "rescueDependence", label: "Rescue Behavior", options: ["frequent", "occasional", "none"] },
        { key: "firstStepControl", label: "First-Step Control", options: ["none", "prompted", "independent"] },
      ],
    },
  ],
  "Time Pressure Stability": [
    {
      setName: "Structure Under Timer",
      reps: 3,
      observationBlock: [
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
        { key: "structureUnderTime", label: "Structure", options: ["lost", "partial", "maintained"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "completionIntegrity", label: "Completion", options: ["fails", "partial", "complete"] },
      ],
    },
    {
      setName: "Repeated Timed Execution",
      reps: 3,
      observationBlock: [
        { key: "completionIntegrity", label: "Consistency", options: ["breaks", "inconsistent", "stable"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "structureUnderTime", label: "Structure", options: ["lost", "partial", "maintained"] },
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
      ],
    },
    {
      setName: "Full Constraint",
      reps: 3,
      observationBlock: [
        { key: "completionIntegrity", label: "Completion", options: ["fails", "partial", "complete"] },
        { key: "structureUnderTime", label: "Integrity", options: ["collapses", "unstable", "stable"] },
        { key: "paceControl", label: "Pace", options: ["rushed", "uneven", "controlled"] },
        { key: "startUnderTime", label: "Start", options: ["panic", "hesitant", "controlled"] },
      ],
    },
  ],
};

function normalizePhase(value: string | null): PhaseLabel {
  const v = String(value || "").toLowerCase();
  if (v.includes("clarity")) return "Clarity";
  if (v.includes("structured")) return "Structured Execution";
  if (v.includes("discomfort")) return "Controlled Discomfort";
  if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
  return "Clarity";
}

function buildDrillStructure(mode: DrillMode, phase: PhaseLabel) {
  return mode === "training" ? TRAINING_SETS_BY_PHASE[phase] : DIAGNOSIS_SETS_BY_PHASE[phase];
}

export default function IntroSessionDrillRunner() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSet, setCurrentSet] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [observations, setObservations] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [scoring, setScoring] = useState<any[] | null>(null);

  const drillMode: DrillMode = searchParams.get("mode") === "training" ? "training" : "diagnosis";
  const phase = normalizePhase(searchParams.get("phase"));
  const drillStructure = useMemo(() => buildDrillStructure(drillMode, phase), [drillMode, phase]);
  const previousStability = String(searchParams.get("stability") || "").trim() || null;

  const introTopic = useMemo(() => {
    const raw = searchParams.get("topic") || "";
    return String(raw).trim();
  }, [searchParams]);

  const hasIntroTopic = !!introTopic;

  const set = drillStructure[currentSet];
  const isFirstRep = currentRep === 0;
  const isFirstSet = currentSet === 0;
  const isLastRep = currentRep === set.reps - 1;
  const isLastSet = currentSet === drillStructure.length - 1;

  const handleExitToPod = () => {
    navigate("/tutor/pod");
  };

  const handleBackStep = () => {
    if (submitting || submitSuccess) return;
    if (!isFirstRep) {
      setCurrentRep((r) => r - 1);
      return;
    }
    if (!isFirstSet) {
      const previousSetIndex = currentSet - 1;
      const previousSet = drillStructure[previousSetIndex];
      setCurrentSet(previousSetIndex);
      setCurrentRep(previousSet.reps - 1);
    }
  };

  const handleObservation = (field: string, value: string) => {
    setSubmitError(null);
    setObservations((prev: any) => ({
      ...prev,
      [`set${currentSet}_rep${currentRep}_${field}`]: value,
    }));
  };

  const getMissingFieldsForRep = (setIndex: number, repIndex: number) => {
    const repSet = drillStructure[setIndex];
    return repSet.observationBlock.filter(
      (field) => !String(observations[`set${setIndex}_rep${repIndex}_${field.key}`] || "").trim()
    );
  };

  const getFirstMissingRep = () => {
    for (let setIndex = 0; setIndex < drillStructure.length; setIndex++) {
      const repSet = drillStructure[setIndex];
      for (let repIndex = 0; repIndex < repSet.reps; repIndex++) {
        const missing = getMissingFieldsForRep(setIndex, repIndex);
        if (missing.length > 0) {
          return { setIndex, repIndex, label: missing[0].label };
        }
      }
    }
    return null;
  };

  const handleNext = async () => {
    if (!hasIntroTopic) {
      setSubmitError("Diagnostic topic is required. Please return and set Add Diagnostic Topic first.");
      return;
    }

    const missingCurrent = getMissingFieldsForRep(currentSet, currentRep);
    if (missingCurrent.length > 0) {
      setSubmitError(`Complete all observation toggles before continuing. Missing: ${missingCurrent.map((field) => field.label).join(", ")}.`);
      return;
    }

    if (!isLastRep) {
      setCurrentRep((r) => r + 1);
    } else if (!isLastSet) {
      setCurrentSet((s) => s + 1);
      setCurrentRep(0);
    } else {
      // Submit observations to backend for scoring
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      setScoring(null);
      try {
        const firstMissing = getFirstMissingRep();
        if (firstMissing) {
          setCurrentSet(firstMissing.setIndex);
          setCurrentRep(firstMissing.repIndex);
          setSubmitError(
            `Set ${firstMissing.setIndex + 1}, Rep ${firstMissing.repIndex + 1} is incomplete. Missing: ${firstMissing.label}.`
          );
          setSubmitting(false);
          return;
        }

        const payload = {
          studentId,
          introTopic,
          trainingTopic: introTopic,
          phase,
          previousStability,
          drillType: drillMode,
          drill: drillStructure.map((set, setIdx) => ({
            setName: set.setName,
            reps: set.reps,
            observations: Array.from({ length: set.reps }).map((_, repIdx) => {
              const obs: Record<string, string> = {};
              set.observationBlock.forEach((block) => {
                obs[block.key] = observations[`set${setIdx}_rep${repIdx}_${block.key}`] || "";
              });
              return obs;
            }),
          })),
        };
        const endpoint = drillMode === "training"
          ? "/api/tutor/training-session-drill"
          : "/api/tutor/intro-session-drill";
        const res = await axios.post(endpoint, payload);
        setSubmitSuccess(true);
        setScoring(res.data?.scoring || null);
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message || "Submission failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="px-3 py-2 rounded border bg-background"
          onClick={handleExitToPod}
        >
          Exit to Pod
        </button>
      </div>
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-900">
          Drill submitted successfully! Observations have been sent for automated scoring.
        </div>
      )}
      {scoring && scoring.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">System Scoring Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 border">Set</th>
                  <th className="px-2 py-1 border">Rep</th>
                  <th className="px-2 py-1 border">Score</th>
                  <th className="px-2 py-1 border">Phase</th>
                  <th className="px-2 py-1 border">Stability</th>
                  <th className="px-2 py-1 border">Next Action</th>
                  <th className="px-2 py-1 border">Constraint</th>
                </tr>
              </thead>
              <tbody>
                {scoring.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="px-2 py-1 border">{row.set}</td>
                    <td className="px-2 py-1 border">{row.rep}</td>
                    <td className="px-2 py-1 border">{row.sessionScore}</td>
                    <td className="px-2 py-1 border">{row.phase}</td>
                    <td className="px-2 py-1 border">{row.stability}</td>
                    <td className="px-2 py-1 border">{row.nextAction}</td>
                    <td className="px-2 py-1 border">{row.constraint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Show summary of last scoring result */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="font-semibold mb-1">System Interpretation:</div>
            <div>
              <strong>Phase:</strong> {scoring[scoring.length - 1]?.phase} &nbsp;|
              <strong> Stability:</strong> {scoring[scoring.length - 1]?.stability} &nbsp;|
              <strong> Next Action:</strong> {scoring[scoring.length - 1]?.nextAction}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              <strong>Constraint:</strong> {scoring[scoring.length - 1]?.constraint}
            </div>
          </div>
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-900">
          {submitError}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2">
        {drillMode === "training"
          ? `Training Drill - ${phase}`
          : `Intro Session - ${phase} Diagnostic Drill`}
      </h2>
      <p className="mb-2 text-sm">
        <span className="font-semibold">Diagnostic Topic:</span>{" "}
        {hasIntroTopic ? introTopic : "Not set"}
      </p>
      {!hasIntroTopic && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
          No diagnostic topic was provided. Go back to the student card and use Add Diagnostic Topic before opening the intro session.
        </div>
      )}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="font-semibold mb-1">Instructions:</p>
        <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
          <li>
            {drillMode === "training"
              ? "This drill is for system-driven training progression. Follow the structure exactly."
              : "This drill is for system-driven diagnostics. Follow the structure exactly."}
          </li>
          <li><strong>Before you begin:</strong> Prepare <span className="font-semibold">3 distinct problems</span> for each set (e.g., Recognition Probe, Light Apply Probe). You will need one unique problem per rep, per set. Do not repeat problems within a set.</li>
          <li>For each set and rep, present the prepared problem, observe the student, and select the option that best matches their behavior for each field.</li>
          <li>You cannot skip steps or edit outside the drill structure. Complete each observation in order.</li>
          <li>
            {drillMode === "training"
              ? "When finished, observations are scored and the topic state map updates automatically."
              : "When finished, observations are submitted for automated scoring and proposal linkage."}
          </li>
        </ul>
      </div>
      <p className="mb-4 text-muted-foreground">Student ID: {studentId}</p>
      <div className="mb-4">
        <span className="font-semibold">Set:</span> {set.setName} ({currentSet + 1} of {drillStructure.length})<br />
        <span className="font-semibold">Rep:</span> {currentRep + 1} of {set.reps}
      </div>
      <form className="space-y-4">
        {set.observationBlock.map((obs) => (
          <div key={obs.key}>
            <label className="block font-medium mb-1">{obs.label}</label>
            <div className="flex gap-2">
              {obs.options.map((option: string) => (
                <button
                  type="button"
                  key={option}
                  className={`px-3 py-1 rounded border ${observations[`set${currentSet}_rep${currentRep}_${obs.key}`] === option ? "bg-primary text-white" : "bg-muted"}`}
                  onClick={() => handleObservation(obs.key, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </form>
      <div className="mt-6 flex justify-end">
        {!submitSuccess && (
          <button
            type="button"
            className="mr-2 px-4 py-2 rounded border bg-background disabled:opacity-60"
            onClick={handleBackStep}
            disabled={submitting || (isFirstSet && isFirstRep)}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60"
          onClick={handleNext}
          disabled={submitting || submitSuccess || !hasIntroTopic}
        >
          {submitting
            ? "Submitting..."
            : isLastSet && isLastRep
            ? "Submit Drill"
            : "Next"}
        </button>
      </div>
      {submitSuccess && (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded border bg-background"
            onClick={handleExitToPod}
          >
            Back to Pod
          </button>
          {drillMode === "diagnosis" && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary text-white"
              onClick={handleExitToPod}
            >
              Continue to Proposal
            </button>
          )}
        </div>
      )}
    </div>
  );
}
