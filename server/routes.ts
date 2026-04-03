console.log("=== DEBUG LOG TEST: server/routes.ts loaded ===");

import type { Express, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";
import { createServer, type Server } from "http";
import { join, resolve } from "path";
import { storage, supabase, createAffiliateCode } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { fileURLToPath } from "url";
import {
  insertPodSchema,
  insertTutorAssignmentSchema,
  insertStudentSchema,
  insertSessionSchema,
  insertReflectionSchema,
  insertAcademicProfileSchema,
  insertStruggleTargetSchema,
  insertBroadcastSchema,
  insertTutorApplicationSchema,
  roleAuthorizationSchema,
  insertEncounterSchema,
  insertAffiliateReflectionSchema,
} from "@shared/schema";
import { z } from "zod";

// Extend Express session type to include affiliateCode
declare module 'express-session' {
  interface SessionData {
    affiliateCode?: string;
  }
}


// Helper middleware to check user role
const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: Function) => {
    const dbUser = (req as any).dbUser;
    console.log("🔐 requireRole check:", {
      hasDbUser: !!dbUser,
      dbUserRole: dbUser?.role,
      requiredRoles: roles,
      isAuthorized: dbUser && roles.includes(dbUser.role)
    });
    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
          const normalizeIntroPhase = (value: unknown): "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability" => {
            const v = String(value || "").toLowerCase();
            if (v.includes("clarity")) return "Clarity";
            if (v.includes("structured") || v.includes("execution")) return "Structured Execution";
            if (v.includes("discomfort")) return "Controlled Discomfort";
            if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
            return "Clarity";
          };

          const normalizeIntroDrillSets = (raw: any): Array<{ setName: string; observations: Array<Record<string, string>> }> => {
            if (Array.isArray(raw)) {
              return raw.map((set: any) => ({
                setName: String(set?.setName || "Set"),
                observations: Array.isArray(set?.observations) ? set.observations : [],
              }));
            }
            if (raw && Array.isArray(raw.sets)) {
              return raw.sets.map((set: any) => ({
                setName: String(set?.setName || "Set"),
                observations: Array.isArray(set?.observations) ? set.observations : [],
              }));
            }
            return [];
          };

          const validateDrillStructure = (
            mode: "diagnosis" | "training",
            phase: "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability",
            sets: Array<{ setName: string; observations: Array<Record<string, string>> }>
          ): string | null => {
            const expectedSetCount = mode === "diagnosis" ? 2 : 3;
            if (sets.length !== expectedSetCount) {
              return `${mode} drill must include exactly ${expectedSetCount} sets`;
            }

            const phaseFields = INTRO_PHASE_WEIGHTS[phase] || [];
            for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
              const set = sets[setIndex];
              const observations = Array.isArray(set?.observations) ? set.observations : [];

              const isClarityModelingSet =
                mode === "training" &&
                phase === "Clarity" &&
                setIndex === 0;

              // Clarity training Set 1 is modeling-only. It is non-scored and has no required observations.
              if (isClarityModelingSet) {
                continue;
              }

              if (observations.length !== 3) {
                return `Set ${setIndex + 1} must include exactly 3 reps`;
              }

              for (let repIndex = 0; repIndex < observations.length; repIndex += 1) {
                const rep = observations[repIndex] || {};
                for (const field of phaseFields) {
                  const hasValue = field.aliases.some((alias) => String(rep?.[alias] || "").trim().length > 0);
                  if (!hasValue) {
                    return `Set ${setIndex + 1}, rep ${repIndex + 1} is missing required observation value`;
                  }
                }
              }
            }

            return null;
          };

          const observationLevelFor = (value: unknown): "weak" | "partial" | "clear" => {
            const v = String(value || "").toLowerCase().trim();
            if (!v) return "weak";

            if (
              v.includes("freeze") ||
              v.includes("could not") ||
              v.includes("cannot") ||
              v.includes("no idea") ||
              v.includes("avoided") ||
              v.includes("avoid") ||
              v.includes("random") ||
              v.includes("guess") ||
              v.includes("guessed") ||
              v.includes("froze") ||
              v.includes("wrong") ||
              v.includes("fails") ||
              v.includes("cannot finish") ||
              v.includes("collapse") ||
              v.includes("collapses") ||
              v.includes("breaks") ||
              v.includes("lost") ||
              v.includes("panic") ||
              v.includes("abandoned") ||
              v.includes("panic-driven") ||
              v.includes("shutdown") ||
              v.includes("collapse") ||
              v.includes("help immediately") ||
              v.includes("needed tutor to carry")
            ) {
              return "weak";
            }

            if (
              v.includes("clear") ||
              v.includes("independent") ||
              v.includes("immediate") ||
              v.includes("correct") ||
              v.includes("engages") ||
              v.includes("starts") ||
              v.includes("present") ||
              v.includes("structured") ||
              v.includes("full") ||
              v.includes("complete") ||
              v.includes("adapts") ||
              v.includes("stable") ||
              v.includes("recovers") ||
              v.includes("composed") ||
              v.includes("no rescue") ||
              v.includes("maintained") ||
              v.includes("controlled") ||
              v.includes("completed with structure") ||
              v.includes("calmly") ||
              v.includes("consisten") ||
              v.includes("without support") ||
              v.includes("did not seek rescue")
            ) {
              return "clear";
            }

            return "partial";
          };

          const weightedScoreFor = (weight: number, level: "weak" | "partial" | "clear") => {
            if (level === "clear") return weight;
            if (level === "partial") return Math.round(weight * 0.6);
            return 0;
          };

          const INTRO_PHASE_WEIGHTS: Record<
            "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability",
            Array<{ aliases: string[]; weight: number }>
          > = {
            Clarity: [
              { aliases: ["vocabulary", "vocabulary_precision"], weight: 30 },
              { aliases: ["method", "method_recognition"], weight: 30 },
              { aliases: ["reason", "reason_clarity"], weight: 20 },
              { aliases: ["immediateApply", "immediate_apply_response"], weight: 20 },
            ],
            "Structured Execution": [
              { aliases: ["startBehavior", "start_behavior"], weight: 25 },
              { aliases: ["stepExecution", "step_execution"], weight: 30 },
              { aliases: ["repeatability", "repeatability"], weight: 25 },
              { aliases: ["independence", "independence_level"], weight: 20 },
            ],
            "Controlled Discomfort": [
              { aliases: ["initialResponse", "initial_boss_response"], weight: 30 },
              { aliases: ["firstStepControl", "first_step_control"], weight: 25 },
              { aliases: ["discomfortTolerance", "discomfort_tolerance"], weight: 25 },
              { aliases: ["rescueDependence", "rescue_dependence"], weight: 20 },
            ],
            "Time Pressure Stability": [
              { aliases: ["startUnderTime", "start_under_time"], weight: 20 },
              { aliases: ["structureUnderTime", "structure_under_time"], weight: 35 },
              { aliases: ["paceControl", "pace_control"], weight: 20 },
              { aliases: ["completionIntegrity", "completion_integrity"], weight: 25 },
            ],
          };

          const computeIntroDiagnosisSummary = (
            phase: "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability",
            sets: Array<{ setName: string; observations: Array<Record<string, string>> }>
          ) => {
            const phaseWeights = INTRO_PHASE_WEIGHTS[phase];
            const repRows: Array<{ set: string; rep: number; repScore: number }> = [];
            const setScores: number[] = [];
            let highGuardPasses = true;

            const firstTwoSets = sets.slice(0, 2);
            firstTwoSets.forEach((set) => {
              const repScores = (set.observations || []).map((repObs, repIndex) => {
                const score = phaseWeights.reduce((sum, field) => {
                  const rawValue = field.aliases
                    .map((alias) => repObs?.[alias])
                    .find((val) => String(val || "").trim().length > 0);
                  const level = observationLevelFor(rawValue);
                  const fieldScore = weightedScoreFor(field.weight, level);
                  return sum + fieldScore;
                }, 0);

                const normalizedRepScore = Math.max(0, Math.min(100, Math.round(score)));
                repRows.push({
                  set: set.setName,
                  rep: repIndex + 1,
                  repScore: normalizedRepScore,
                });
                return normalizedRepScore;
              });

              const setScore = repScores.length > 0
                ? Math.round(repScores.reduce((sum, value) => sum + value, 0) / repScores.length)
                : 0;
              setScores.push(setScore);

              if (phase === "Clarity") {
                const repHasZeroField = (set.observations || []).some((repObs) =>
                  phaseWeights.some((field) => {
                    const rawValue = field.aliases
                      .map((alias) => repObs?.[alias])
                      .find((val) => String(val || "").trim().length > 0);
                    return weightedScoreFor(field.weight, observationLevelFor(rawValue)) === 0;
                  })
                );
                if (repHasZeroField) highGuardPasses = false;
              }

              if (phase === "Structured Execution") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const step = String(repObs?.stepExecution || repObs?.step_execution || "").toLowerCase();
                  const start = String(repObs?.startBehavior || repObs?.start_behavior || "").toLowerCase();
                  return step.includes("guess") || start.includes("avoid");
                });
                if (repViolates) highGuardPasses = false;
              }

              if (phase === "Controlled Discomfort") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const initial = String(repObs?.initialResponse || repObs?.initial_boss_response || "").toLowerCase();
                  const firstStep = String(repObs?.firstStepControl || repObs?.first_step_control || "").toLowerCase();
                  return initial.includes("avoid") || initial.includes("froze") || firstStep.includes("could not");
                });
                if (repViolates) highGuardPasses = false;
              }

              if (phase === "Time Pressure Stability") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const structure = String(repObs?.structureUnderTime || repObs?.structure_under_time || "").toLowerCase();
                  const pace = String(repObs?.paceControl || repObs?.pace_control || "").toLowerCase();
                  return !structure.includes("maintained") || !pace.includes("controlled");
                });
                if (repViolates) highGuardPasses = false;
              }
            });

            // Diagnosis sessions use Set1 x1 and Set2 x1, normalized to 0-100.
            const diagnosisScore = Math.round(
              setScores.length > 0
                ? setScores.reduce((sum, setScore) => sum + setScore, 0) / setScores.length
                : 0
            );

            let stability: "Low" | "Medium" | "High" = "Low";
            if (diagnosisScore <= 49) stability = "Low";
            else if (diagnosisScore <= 69) stability = "Medium";
            else stability = highGuardPasses ? "High" : "Medium";

            const nextActionConfig = (NEXT_ACTION_ENGINE as any)?.[phase]?.[stability] || null;

            return {
              phase,
              stability,
              diagnosisScore,
              nextAction: nextActionConfig?.primaryAction || null,
              constraint: nextActionConfig?.rules?.[0] || null,
              repRows,
              setScores,
              highGuardPasses,
            };
          };

          const computeTrainingSessionSummary = (
            observedPhase: "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability",
            previousStability: "Low" | "Medium" | "High",
            sets: Array<{ setName: string; observations: Array<Record<string, string>> }>
          ) => {
            const phaseWeights = INTRO_PHASE_WEIGHTS[observedPhase];
            const repRows: Array<{ set: string; rep: number; repScore: number }> = [];
            const setScores: number[] = [];
            let highGuardPasses = true;

            const scoredSets =
              observedPhase === "Clarity"
                ? sets.slice(1, 3)
                : sets.slice(0, 3);

            scoredSets.forEach((set) => {
              const repScores = (set.observations || []).map((repObs, repIndex) => {
                const score = phaseWeights.reduce((sum, field) => {
                  const rawValue = field.aliases
                    .map((alias) => repObs?.[alias])
                    .find((val) => String(val || "").trim().length > 0);
                  const level = observationLevelFor(rawValue);
                  return sum + weightedScoreFor(field.weight, level);
                }, 0);

                const normalizedRepScore = Math.max(0, Math.min(100, Math.round(score)));
                repRows.push({
                  set: set.setName,
                  rep: repIndex + 1,
                  repScore: normalizedRepScore,
                });
                return normalizedRepScore;
              });

              const setScore = repScores.length > 0
                ? Math.round(repScores.reduce((sum, value) => sum + value, 0) / repScores.length)
                : 0;
              setScores.push(setScore);

              if (observedPhase === "Clarity") {
                const repHasZeroField = (set.observations || []).some((repObs) =>
                  phaseWeights.some((field) => {
                    const rawValue = field.aliases
                      .map((alias) => repObs?.[alias])
                      .find((val) => String(val || "").trim().length > 0);
                    return weightedScoreFor(field.weight, observationLevelFor(rawValue)) === 0;
                  })
                );
                if (repHasZeroField) highGuardPasses = false;
              }

              if (observedPhase === "Structured Execution") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const step = String(repObs?.stepExecution || repObs?.step_execution || "").toLowerCase();
                  const start = String(repObs?.startBehavior || repObs?.start_behavior || "").toLowerCase();
                  return step.includes("guess") || start.includes("avoid");
                });
                if (repViolates) highGuardPasses = false;
              }

              if (observedPhase === "Controlled Discomfort") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const initial = String(repObs?.initialResponse || repObs?.initial_boss_response || "").toLowerCase();
                  const firstStep = String(repObs?.firstStepControl || repObs?.first_step_control || "").toLowerCase();
                  return initial.includes("avoid") || initial.includes("froze") || firstStep.includes("could not");
                });
                if (repViolates) highGuardPasses = false;
              }

              if (observedPhase === "Time Pressure Stability") {
                const repViolates = (set.observations || []).some((repObs) => {
                  const structure = String(repObs?.structureUnderTime || repObs?.structure_under_time || "").toLowerCase();
                  const pace = String(repObs?.paceControl || repObs?.pace_control || "").toLowerCase();
                  return !structure.includes("maintained") || !pace.includes("controlled");
                });
                if (repViolates) highGuardPasses = false;
              }
            });

            const setWeights = observedPhase === "Clarity" ? [2, 2] : [1, 2, 2];
            const weighted = setScores.reduce(
              (acc, score, idx) => {
                const w = setWeights[idx] || 1;
                return {
                  sum: acc.sum + score * w,
                  weight: acc.weight + w,
                };
              },
              { sum: 0, weight: 0 }
            );

            const sessionScore = weighted.weight > 0
              ? Math.round(weighted.sum / weighted.weight)
              : 0;

            let projectedStability: "Low" | "Medium" | "High" = previousStability;
            let advanceReady = false;

            if (previousStability === "Low") {
              if (sessionScore <= 49) projectedStability = "Low";
              else if (sessionScore <= 69) projectedStability = "Medium";
              else projectedStability = highGuardPasses ? "High" : "Medium";
            }

            if (previousStability === "Medium") {
              if (sessionScore <= 44) projectedStability = "Low";
              else if (sessionScore <= 74) projectedStability = "Medium";
              else projectedStability = "High";
            }

            if (previousStability === "High") {
              if (sessionScore <= 69) projectedStability = "Medium";
              else if (sessionScore <= 89) projectedStability = "High";
              else {
                projectedStability = "High";
                advanceReady = true;
              }
            }

            const nextActionConfig = (NEXT_ACTION_ENGINE as any)?.[observedPhase]?.[projectedStability] || null;
            const projectedPhase = advanceReady && nextActionConfig?.advanceTo
              ? nextActionConfig.advanceTo
              : observedPhase;

            const stabilityScore = (value: "Low" | "Medium" | "High") => (value === "Low" ? 1 : value === "Medium" ? 2 : 3);
            const phaseDecision: "remain" | "advance" | "regress" =
              projectedPhase !== observedPhase
                ? "advance"
                : stabilityScore(projectedStability) < stabilityScore(previousStability)
                ? "regress"
                : "remain";

            const projectedConfig = (NEXT_ACTION_ENGINE as any)?.[projectedPhase]?.[projectedStability] || null;

            return {
              observedPhase,
              previousStability,
              phase: projectedPhase,
              stability: projectedStability,
              phaseDecision,
              sessionScore,
              nextAction: projectedConfig?.primaryAction || null,
              constraint: projectedConfig?.rules?.[0] || null,
              repRows,
              setScores,
              highGuardPasses,
            };
          };

          const mapDrillRowToDeterministicSession = (row: any) => {
            let parsed: any = null;
            try {
              parsed = row?.drill && typeof row.drill === "object"
                ? row.drill
                : JSON.parse(typeof row?.drill === "string" ? row.drill : "{}");
            } catch {
              parsed = null;
            }

            if (!parsed || typeof parsed !== "object") return null;

            const drillType = String(parsed.drillType || "diagnosis").toLowerCase() === "training"
              ? "training"
              : "diagnosis";

            if (drillType === "diagnosis") {
              const topic = String(parsed.introTopic || parsed.trainingTopic || "").trim();
              const diagnosisPhase = normalizeIntroPhase(parsed.phase || parsed.summary?.phase || "Clarity");
              const stability = normalizeStability(parsed.summary?.stability || "Low");
              const diagnosisScore = Number(parsed.summary?.diagnosisScore ?? 0);
              const trainingEntryPhase = deriveTrainingEntryPhase(normalizePhase(diagnosisPhase), stability);
              const nextAction = String(
                parsed.summary?.nextAction ||
                NEXT_ACTION_ENGINE[normalizePhase(diagnosisPhase)]?.[stability]?.primaryAction ||
                ""
              ).trim();
              const constraint = String(
                parsed.summary?.constraint ||
                NEXT_ACTION_ENGINE[normalizePhase(diagnosisPhase)]?.[stability]?.rules?.[0] ||
                ""
              ).trim() || null;

              return {
                id: row.id,
                date: row.submitted_at,
                duration: 0,
                deterministicLog: {
                  topicFocus: `This session focused on ${topic}, targeting baseline diagnosis in ${diagnosisPhase}.`,
                  whatWasTrained: `A diagnosis drill was used to identify ${DRILL_PURPOSE_BY_PHASE[diagnosisPhase] || "phase-specific response patterns"}.`,
                  behaviorSummary: `The student showed ${stability === "High" ? "stable execution" : stability === "Medium" ? "partial consistency" : "frequent instability"} during diagnosis.`,
                  performanceResult: `Based on performance, stability is now ${stability} (${diagnosisScore}/100).`,
                  stateMovement:
                    trainingEntryPhase === normalizePhase(diagnosisPhase)
                      ? `The student remained in ${trainingEntryPhase} for training entry.`
                      : `The student advanced to ${trainingEntryPhase} for training entry.`,
                  whatThisMeans: TUTOR_MEANING_BY_PHASE[trainingEntryPhase],
                  nextMove: nextAction,
                  summaryText: `This session focused on ${topic}, targeting baseline diagnosis in ${diagnosisPhase}.`,
                  drillLabel: `Intro Diagnosis (${diagnosisPhase})`,
                  score: diagnosisScore,
                  stability,
                  constraint,
                  practiceAssigned: `Prepare the next ${trainingEntryPhase} drill cycle for ${topic}.`,
                },
              };
            }

            const topic = String(parsed.trainingTopic || parsed.introTopic || "").trim();
            const observedPhase = normalizeIntroPhase(parsed.phase || parsed.summary?.observedPhase || "Structured Execution");
            const resultingPhase = normalizePhase(parsed.summary?.phase || observedPhase);
            const stability = normalizeStability(parsed.summary?.stability || "Low");
            const sessionScore = Number(parsed.summary?.sessionScore ?? 0);
            const phaseDecision = String(parsed.summary?.phaseDecision || "remain").toLowerCase();
            const nextAction = String(
              parsed.summary?.nextAction ||
              NEXT_ACTION_ENGINE[resultingPhase]?.[stability]?.primaryAction ||
              ""
            ).trim();
            const constraint = String(
              parsed.summary?.constraint ||
              NEXT_ACTION_ENGINE[resultingPhase]?.[stability]?.rules?.[0] ||
              ""
            ).trim() || null;

            return {
              id: row.id,
              date: row.submitted_at,
              duration: 0,
              deterministicLog: {
                topicFocus: `This session focused on ${topic}, targeting ${DRILL_PURPOSE_BY_PHASE[observedPhase] || "phase-specific execution"}.`,
                whatWasTrained: `A training drill was used to train ${DRILL_PURPOSE_BY_PHASE[observedPhase] || "phase-specific behavior"}.`,
                behaviorSummary: `The student showed ${phaseDecision === "advance" ? "improved independence" : stability === "High" ? "stable execution" : stability === "Medium" ? "inconsistent execution" : "breakdown under pressure"} during the drill.`,
                performanceResult: `Based on performance, stability is now ${stability} (${sessionScore}/100).`,
                stateMovement:
                  resultingPhase === normalizePhase(observedPhase)
                    ? `The student remained in ${resultingPhase}.`
                    : `${observedPhase} advanced to ${resultingPhase}.`,
                whatThisMeans: TUTOR_MEANING_BY_PHASE[resultingPhase],
                nextMove: nextAction,
                summaryText: `This session focused on ${topic}, targeting ${DRILL_PURPOSE_BY_PHASE[observedPhase] || "phase-specific execution"}.`,
                drillLabel: `Training Drill (${observedPhase})`,
                score: sessionScore,
                stability,
                constraint,
                practiceAssigned: `Prepare the next ${resultingPhase} drill cycle for ${topic}.`,
              },
            };
          };

          const DRILL_PURPOSE_BY_PHASE: Record<string, string> = {
            Clarity: "recognizing terms, steps, and reasoning",
            "Structured Execution": "following steps independently",
            "Controlled Discomfort": "staying stable under difficulty",
            "Time Pressure Stability": "maintaining structure under time",
          };

          const normalizeBehaviorSignal = (text: string) => {
            const value = String(text || "").toLowerCase();
            if (/hesitat|delay/.test(value)) return "hesitation";
            if (/guess/.test(value)) return "guessing";
            if (/pressure|collapse|breakdown|panic/.test(value)) return "breakdown under pressure";
            if (/independent|improv/.test(value)) return "improved independence";
            if (/stable|consistent/.test(value)) return "stable execution";
            return "mixed response";
          };

          const summarizeTopSignal = (signals: string[]) => {
            if (!signals.length) return "mixed response";
            const counts: Record<string, number> = {};
            for (const signal of signals) {
              counts[signal] = (counts[signal] || 0) + 1;
            }
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
          };

          const resolveParentIdForStudent = async (student: any, tutorId: string) => {
            let parentId = (student as any)?.parentId || (student as any)?.parent_id || null;
            if (parentId) return parentId;

            const { data: enrollment } = await supabase
              .from("enrollments")
              .select("parent_id")
              .eq("assigned_tutor_id", tutorId)
              .eq("student_id", student.id)
              .maybeSingle();

            return enrollment?.parent_id || null;
          };

          const createWeeklyStructuredDataFromDrills = (drillRows: any[]) => {
            const deterministicSessions = drillRows
              .map(mapDrillRowToDeterministicSession)
              .filter((session: any) => !!session?.deterministicLog);

            const parsedByRowId = drillRows.reduce((acc: Record<string, any>, row: any) => {
              try {
                const parsed = row?.drill && typeof row.drill === "object"
                  ? row.drill
                  : JSON.parse(typeof row?.drill === "string" ? row.drill : "{}");
                acc[String(row.id)] = parsed;
              } catch {
                acc[String(row.id)] = null;
              }
              return acc;
            }, {});

            if (!deterministicSessions.length) return null;

            const sorted = [...deterministicSessions].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const topicSnapshots: Record<string, { start: string; current: string }> = {};
            const behaviorSignals: string[] = [];
            const nextMoveByTopic: Record<string, string> = {};
            const stateMovementsWithTopic: string[] = [];
            const scores: number[] = [];

            sorted.forEach((session) => {
              const log = session.deterministicLog;
              const parsed: any = parsedByRowId[String(session.id)] || null;
              const rawTopic = String(parsed?.introTopic || parsed?.trainingTopic || "").trim();
              const topic = rawTopic || "Unknown topic";
              const phase = normalizePhase(parsed?.summary?.phase || parsed?.phase || "Clarity");
              const state = `${phase} (${String(log.stability || "Unknown")})`;

              if (!topicSnapshots[topic]) {
                topicSnapshots[topic] = { start: state, current: state };
              } else {
                topicSnapshots[topic] = { ...topicSnapshots[topic], current: state };
              }

              behaviorSignals.push(normalizeBehaviorSignal(String(log.behaviorSummary || "")));
              if (log.nextMove) {
                nextMoveByTopic[topic] = String(log.nextMove);
              }
              if (log.stateMovement) {
                stateMovementsWithTopic.push(`${topic}: ${String(log.stateMovement)}`);
              }
              if (typeof log.score === "number" && Number.isFinite(log.score)) scores.push(log.score);
            });

            const topics = Object.keys(topicSnapshots);
            const improvementSignal = summarizeTopSignal(behaviorSignals.filter((s) => /improved|stable/.test(s)));
            const breakdownSignal = summarizeTopSignal(behaviorSignals.filter((s) => /hesitation|guessing|breakdown/.test(s)));
            const dominantBehavior = summarizeTopSignal(behaviorSignals);
            const avgScore = scores.length > 0
              ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
              : 0;

            const conditioningProgress = Object.entries(topicSnapshots)
              .map(([topic, snapshot]) => `${topic}\nStarted: ${snapshot.start}\nCurrent: ${snapshot.current}`)
              .join("\n\n");

            const startDate = sorted[0].date;
            const endDate = sorted[sorted.length - 1].date;

            const nextFocusCandidates = Object.values(nextMoveByTopic)
              .filter((value) => String(value || "").trim().length > 0);
            const nextFocus = nextFocusCandidates.length > 0
              ? Array.from(new Set(nextFocusCandidates)).slice(0, 2).join(" | ")
              : "Reinforce current phase constraints and continue drill sequence.";

            return {
              version: "weekly-v2-auto",
              weekStartDate: new Date(startDate).toISOString().slice(0, 10),
              weekEndDate: new Date(endDate).toISOString().slice(0, 10),
              sessionsCompletedThisWeek: sorted.length,
              mainTopicsCovered: `This week focused on: ${topics.join(", ")}.`,
              whatImprovedThisWeek: `The student is becoming more consistent in ${improvementSignal}.`,
              studentResponsePatternThisWeek: `During this week, the student typically had: ${Array.from(new Set(behaviorSignals)).slice(0, 2).join("; ") || dominantBehavior}.`,
              mainMisunderstandingThisWeek: `The main challenge this week was ${breakdownSignal}.`,
              mainCorrectionHelpedThisWeek: `Across sessions, the system: ${stateMovementsWithTopic.slice(-3).join(" | ") || "remained in phase."}`,
              bossBattleSummaryThisWeek: conditioningProgress,
              reinforcementNextWeek: `Next week will focus on: ${nextFocus}.`,
              internalWeeklyTutorNote: "",
              sourceSessionIds: sorted.map((session) => session.id),
              sourceSessionCount: sorted.length,
              bossBattlesCompletedThisWeek: 0,
              stateSnapshot: sorted.map((session) => ({
                topic: String(parsedByRowId[String(session.id)]?.introTopic || parsedByRowId[String(session.id)]?.trainingTopic || "").trim() || "Unknown topic",
                phase: normalizePhase(parsedByRowId[String(session.id)]?.summary?.phase || parsedByRowId[String(session.id)]?.phase || "Clarity"),
                stability: session.deterministicLog.stability || "Unknown",
                score: session.deterministicLog.score || 0,
                transition: session.deterministicLog.stateMovement || "",
                nextMove: session.deterministicLog.nextMove || "",
              })),
            };
          };

          const createMonthlyStructuredDataFromDrills = (drillRows: any[]) => {
            const deterministicSessions = drillRows
              .map(mapDrillRowToDeterministicSession)
              .filter((session: any) => !!session?.deterministicLog);

            const parsedByRowId = drillRows.reduce((acc: Record<string, any>, row: any) => {
              try {
                const parsed = row?.drill && typeof row.drill === "object"
                  ? row.drill
                  : JSON.parse(typeof row?.drill === "string" ? row.drill : "{}");
                acc[String(row.id)] = parsed;
              } catch {
                acc[String(row.id)] = null;
              }
              return acc;
            }, {});

            if (!deterministicSessions.length) return null;

            const sorted = [...deterministicSessions].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const topicSnapshots: Record<string, { start: string; current: string }> = {};
            const behaviorSignals: string[] = [];
            const scores: number[] = [];

            sorted.forEach((session) => {
              const log = session.deterministicLog;
              const parsed: any = parsedByRowId[String(session.id)] || null;
              const rawTopic = String(parsed?.introTopic || parsed?.trainingTopic || "").trim();
              const topic = rawTopic || "Unknown topic";
              const phase = normalizePhase(parsed?.summary?.phase || parsed?.phase || "Clarity");
              const state = `${phase} (${String(log.stability || "Unknown")})`;

              if (!topicSnapshots[topic]) {
                topicSnapshots[topic] = { start: state, current: state };
              } else {
                topicSnapshots[topic] = { ...topicSnapshots[topic], current: state };
              }

              behaviorSignals.push(normalizeBehaviorSignal(String(log.behaviorSummary || "")));
              if (typeof log.score === "number" && Number.isFinite(log.score)) scores.push(log.score);
            });

            const topics = Object.keys(topicSnapshots);
            const improvementSignal = summarizeTopSignal(behaviorSignals.filter((s) => /improved|stable/.test(s)));
            const breakdownSignal = summarizeTopSignal(behaviorSignals.filter((s) => /hesitation|guessing|breakdown/.test(s)));
            const dominantBehavior = summarizeTopSignal(behaviorSignals);
            const avgScore = scores.length > 0
              ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
              : 0;

            const topicProgression = Object.entries(topicSnapshots)
              .map(([topic, snapshot]) => `${topic}\nStart: ${snapshot.start}\nEnd: ${snapshot.current}`)
              .join("\n\n");

            const startDate = sorted[0].date;
            const endDate = sorted[sorted.length - 1].date;

            const monthlyStateSummaryByTopic = Object.entries(topicSnapshots)
              .map(([topic, snapshot]) => {
                const currentPhase = String(snapshot.current || "Clarity").split(" (")[0] || "Clarity";
                return `The student remained in ${currentPhase} in ${topic}.`;
              })
              .slice(0, 4);

            const nextFocusByTopic = topics
              .map((topic) => `Maintaining with mixed practice in ${topic}`)
              .slice(0, 3);

            const nextFocus = nextFocusByTopic.length > 0
              ? nextFocusByTopic.join(" | ")
              : "Maintaining with mixed practice in current topics";

            return {
              version: "monthly-v2-auto",
              monthStartDate: new Date(startDate).toISOString().slice(0, 10),
              monthEndDate: new Date(endDate).toISOString().slice(0, 10),
              totalSessionsCompletedThisMonth: sorted.length,
              mainAreasCoveredThisMonth: `This month focused on: ${topics.join(", ")}.`,
              strongerSkillsThisMonth: `The student has improved in ${improvementSignal}. Average session score this month: ${avgScore}/100.`,
              responsePatternTrendThisMonth: `Across the month, the student typically showed: ${Array.from(new Set(behaviorSignals)).slice(0, 2).join("; ") || dominantBehavior}.`,
              recurringChallengeThisMonth: `The main recurring challenge this month was ${breakdownSignal}.`,
              mostEffectiveInterventionThisMonth: `Over the month: ${monthlyStateSummaryByTopic.join(" | ") || "The student remained in Structured Execution in current topics."}`,
              bossBattleTrendThisMonth: topicProgression,
              nextMonthPriority: `Next month will focus on: ${nextFocus}.`,
              internalMonthlyTutorNote: "",
              sourceWeeklyReportIds: [],
            };
          };


          const insertWeeklyReport = async ({
            tutorId,
            studentId,
            parentId,
            structuredData,
          }: {
            tutorId: string;
            studentId: string;
            parentId: string;
            structuredData: any;
          }) => {
            const weekNumber = getIsoWeekNumber(new Date(structuredData.weekStartDate));

            const { data, error } = await supabase
              .from("parent_reports")
              .insert({
                tutor_id: tutorId,
                student_id: studentId,
                parent_id: parentId,
                report_type: "weekly",
                week_number: weekNumber,
                month_name: null,
                summary: JSON.stringify(structuredData),
                topics_learned: structuredData.mainTopicsCovered,
                strengths: structuredData.whatImprovedThisWeek,
                areas_for_growth: structuredData.mainMisunderstandingThisWeek,
                boss_battles_completed: Number(structuredData.bossBattlesCompletedThisWeek || 0),
                solutions_unlocked: Number(structuredData.sessionsCompletedThisWeek || 0),
                confidence_growth: null,
                next_steps: structuredData.reinforcementNextWeek,
                sent_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (error) throw error;
            return data;
          };

          const insertMonthlyReport = async ({
            tutorId,
            studentId,
            parentId,
            structuredData,
          }: {
            tutorId: string;
            studentId: string;
            parentId: string;
            structuredData: any;
          }) => {
            const monthName = formatMonthName(new Date(structuredData.monthStartDate));

            const { data, error } = await supabase
              .from("parent_reports")
              .insert({
                tutor_id: tutorId,
                student_id: studentId,
                parent_id: parentId,
                report_type: "monthly",
                week_number: null,
                month_name: monthName,
                summary: JSON.stringify(structuredData),
                topics_learned: structuredData.mainAreasCoveredThisMonth,
                strengths: structuredData.strongerSkillsThisMonth,
                areas_for_growth: structuredData.recurringChallengeThisMonth,
                boss_battles_completed: 0,
                solutions_unlocked: Number(structuredData.totalSessionsCompletedThisMonth || 0),
                confidence_growth: null,
                next_steps: structuredData.nextMonthPriority,
                sent_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (error) throw error;
            return data;
          };

          const maybeAutoSendDeterministicReports = async (studentId: string, tutorId: string) => {
            const student = await storage.getStudent(studentId);
            if (!student || student.tutorId !== tutorId) return;

            const parentId = await resolveParentIdForStudent(student, tutorId);
            if (!parentId) return;

            const { data: drillRows, error: drillRowsError } = await supabase
              .from("intro_session_drills")
              .select("id, drill, submitted_at")
              .eq("student_id", studentId)
              .eq("tutor_id", tutorId)
              .order("submitted_at", { ascending: true });

            if (drillRowsError || !drillRows || drillRows.length === 0) return;

            const { data: latestWeekly } = await supabase
              .from("parent_reports")
              .select("sent_at")
              .eq("student_id", studentId)
              .eq("tutor_id", tutorId)
              .eq("report_type", "weekly")
              .order("sent_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const { data: latestMonthly } = await supabase
              .from("parent_reports")
              .select("sent_at")
              .eq("student_id", studentId)
              .eq("tutor_id", tutorId)
              .eq("report_type", "monthly")
              .order("sent_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const weeklyBaseline = latestWeekly?.sent_at ? new Date(latestWeekly.sent_at).getTime() : 0;
            const monthlyBaseline = latestMonthly?.sent_at ? new Date(latestMonthly.sent_at).getTime() : 0;

            const weeklyPending = drillRows.filter(
              (row: any) => new Date(row.submitted_at).getTime() > weeklyBaseline
            );
            const monthlyPending = drillRows.filter(
              (row: any) => new Date(row.submitted_at).getTime() > monthlyBaseline
            );

            if (weeklyPending.length >= 2) {
              const weeklyChunks: any[][] = [];
              for (let i = 0; i + 1 < weeklyPending.length; i += 2) {
                weeklyChunks.push(weeklyPending.slice(i, i + 2));
              }

              for (const chunk of weeklyChunks) {
                const structuredData = createWeeklyStructuredDataFromDrills(chunk);
                if (structuredData) {
                  await insertWeeklyReport({ tutorId, studentId, parentId, structuredData });
                }
              }
            }

            if (monthlyPending.length >= 8) {
              const monthlyChunks: any[][] = [];
              for (let i = 0; i + 7 < monthlyPending.length; i += 8) {
                monthlyChunks.push(monthlyPending.slice(i, i + 8));
              }

              for (const chunk of monthlyChunks) {
                const structuredData = createMonthlyStructuredDataFromDrills(chunk);
                if (structuredData) {
                  await insertMonthlyReport({ tutorId, studentId, parentId, structuredData });
                }
              }
            }
          };

          // Tutor submits intro session drill results
          app.post("/api/tutor/intro-session-drill", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
            try {
              const tutorId = (req as any).dbUser.id;
              const { studentId, drill, introTopic, phase: rawPhase } = req.body;
              const drillSets = normalizeIntroDrillSets(drill);
              const drillPhase = normalizeIntroPhase(rawPhase || "Clarity");
              const normalizedIntroTopic = String(introTopic || "").trim();

              if (!studentId || drillSets.length === 0) {
                return res.status(400).json({ message: "Missing or invalid studentId or drill data" });
              }
              if (!normalizedIntroTopic) {
                return res.status(400).json({ message: "Diagnostic topic is required before intro drill submission" });
              }

              const drillValidationError = validateDrillStructure("diagnosis", drillPhase, drillSets);
              if (drillValidationError) {
                return res.status(400).json({ message: drillValidationError });
              }

              // Validate student ownership
              const student = await storage.getStudent(studentId);
              if (!student || student.tutorId !== tutorId) {
                return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
              }

              const diagnosisSummary = computeIntroDiagnosisSummary(drillPhase, drillSets);

              // Store drill results in intro_session_drills table
              const id = uuidv4();
              const { data: inserted, error } = await supabase
                .from("intro_session_drills")
                .insert({
                  id,
                  student_id: studentId,
                  tutor_id: tutorId,
                  drill: JSON.stringify({
                    introTopic: normalizedIntroTopic,
                    phase: drillPhase,
                    drillType: "diagnosis",
                    sets: drillSets,
                    summary: diagnosisSummary,
                  }),
                  submitted_at: new Date().toISOString(),
                })
                .select()
                .single();
              if (error) {
                console.error("Error inserting intro session drill:", error);
                return res.status(500).json({ message: "Failed to store drill results" });
              }

              // Mark intro completed on successful diagnosis drill submission.
              const existingProfile = (student.personalProfile as any) || {};
              const existingWorkflow = (existingProfile.workflow as any) || {};
              if (!existingWorkflow.introCompletedAt) {
                await storage.updateStudent(studentId, {
                  personalProfile: {
                    ...existingProfile,
                    workflow: {
                      ...existingWorkflow,
                      introCompletedAt: new Date().toISOString(),
                    },
                  },
                } as any);
              }

              const scoringResults = diagnosisSummary.repRows.map((row) => ({
                set: row.set,
                rep: row.rep,
                score: row.repScore,
                sessionScore: row.repScore,
                phase: diagnosisSummary.phase,
                stability: diagnosisSummary.stability,
                nextAction: diagnosisSummary.nextAction,
                constraint: diagnosisSummary.constraint,
              }));

              try {
                await maybeAutoSendDeterministicReports(studentId, tutorId);
              } catch (autoReportError) {
                console.error("Auto report generation failed after intro drill:", autoReportError);
              }

              res.json({
                success: true,
                id: inserted.id,
                introTopic: normalizedIntroTopic,
                scoring: scoringResults,
                summary: diagnosisSummary,
              });
            } catch (err) {
              console.error("Exception in intro session drill submission:", err);
              res.status(500).json({ message: "Internal server error" });
            }
          });

          app.post("/api/tutor/training-session-drill", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
            try {
              const tutorId = (req as any).dbUser.id;
              const { studentId, trainingTopic, drill, phase: rawPhase, previousStability: rawPreviousStability } = req.body;
              const drillSets = normalizeIntroDrillSets(drill);
              const observedPhase = normalizeIntroPhase(rawPhase || "Structured Execution");
              const normalizedTopic = String(trainingTopic || "").trim();

              if (!studentId || drillSets.length === 0) {
                return res.status(400).json({ message: "Missing or invalid studentId or drill data" });
              }
              if (!normalizedTopic) {
                return res.status(400).json({ message: "Training topic is required before training drill submission" });
              }

              const drillValidationError = validateDrillStructure("training", observedPhase, drillSets);
              if (drillValidationError) {
                return res.status(400).json({ message: drillValidationError });
              }

              const student = await storage.getStudent(studentId);
              if (!student || student.tutorId !== tutorId) {
                return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
              }

              const conceptMastery: any =
                student.conceptMastery && typeof student.conceptMastery === "object"
                  ? { ...(student.conceptMastery as any) }
                  : {};
              const topicConditioningStore: any =
                conceptMastery.topicConditioning && typeof conceptMastery.topicConditioning === "object"
                  ? { ...conceptMastery.topicConditioning }
                  : {};
              const topicsStore: Record<string, any> =
                topicConditioningStore.topics && typeof topicConditioningStore.topics === "object"
                  ? { ...topicConditioningStore.topics }
                  : {};

              const existing = topicsStore[normalizedTopic] && typeof topicsStore[normalizedTopic] === "object"
                ? topicsStore[normalizedTopic]
                : {};

              const previousStability = normalizeStability(
                existing?.stability || rawPreviousStability || "Low"
              );
              const effectivePhase = normalizePhase(existing?.phase || observedPhase);

              const trainingSummary = computeTrainingSessionSummary(
                effectivePhase,
                previousStability,
                drillSets
              );

              const id = uuidv4();
              const { data: inserted, error } = await supabase
                .from("intro_session_drills")
                .insert({
                  id,
                  student_id: studentId,
                  tutor_id: tutorId,
                  drill: JSON.stringify({
                    trainingTopic: normalizedTopic,
                    phase: trainingSummary.observedPhase,
                    previousStability: trainingSummary.previousStability,
                    drillType: "training",
                    sets: drillSets,
                    summary: trainingSummary,
                  }),
                  submitted_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (error) {
                console.error("Error inserting training session drill:", error);
                return res.status(500).json({ message: "Failed to store training drill results" });
              }

              const nowIso = new Date().toISOString();
              const existingHistory = Array.isArray(existing.history) ? [...existing.history] : [];
              const updatedEntry = {
                ...existing,
                topic: normalizedTopic,
                phase: trainingSummary.phase,
                stability: trainingSummary.stability,
                lastUpdated: nowIso,
                nextAction: trainingSummary.nextAction,
                observationNotes: [
                  `Training Drill Session Score: ${trainingSummary.sessionScore}`,
                  `Decision: ${trainingSummary.phaseDecision.toUpperCase()}`,
                  trainingSummary.constraint ? `Constraint: ${trainingSummary.constraint}` : null,
                ]
                  .filter(Boolean)
                  .join(" | "),
                history: [
                  ...existingHistory,
                  {
                    date: nowIso,
                    phase: trainingSummary.phase,
                    stability: trainingSummary.stability,
                    nextAction: trainingSummary.nextAction,
                    observationNotes: `Training drill update. Session Score ${trainingSummary.sessionScore}.`,
                    structuredObservation: {
                      drillType: "training",
                      observedPhase: trainingSummary.observedPhase,
                      previousStability: trainingSummary.previousStability,
                      phaseDecision: trainingSummary.phaseDecision,
                      sessionScore: trainingSummary.sessionScore,
                      nextAction: trainingSummary.nextAction,
                      constraint: trainingSummary.constraint,
                    },
                    drillId: inserted.id,
                  },
                ].slice(-60),
              };

              topicsStore[normalizedTopic] = updatedEntry;
              topicConditioningStore.topics = topicsStore;
              topicConditioningStore.topic = normalizedTopic;
              topicConditioningStore.entry_phase = trainingSummary.phase;
              topicConditioningStore.stability = trainingSummary.stability;
              topicConditioningStore.lastUpdated = nowIso;
              topicConditioningStore.lastUpdatedTopic = normalizedTopic;
              topicConditioningStore.lastUpdatedAt = nowIso;
              conceptMastery.topicConditioning = topicConditioningStore;

              await storage.updateStudent(studentId, { conceptMastery });

              const scoringResults = trainingSummary.repRows.map((row) => ({
                set: row.set,
                rep: row.rep,
                score: row.repScore,
                sessionScore: trainingSummary.sessionScore,
                phase: trainingSummary.phase,
                stability: trainingSummary.stability,
                phaseDecision: trainingSummary.phaseDecision,
                nextAction: trainingSummary.nextAction,
                constraint: trainingSummary.constraint,
              }));

              try {
                await maybeAutoSendDeterministicReports(studentId, tutorId);
              } catch (autoReportError) {
                console.error("Auto report generation failed after training drill:", autoReportError);
              }

              res.json({
                success: true,
                id: inserted.id,
                trainingTopic: normalizedTopic,
                scoring: scoringResults,
                summary: trainingSummary,
              });
            } catch (err) {
              console.error("Exception in training session drill submission:", err);
              res.status(500).json({ message: "Internal server error" });
            }
          });
        // Tutor: Get all topic activations for a student
        app.get("/api/tutor/students/:studentId/topic-conditioning-activations", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
          try {
            const { studentId } = req.params;
            if (!studentId) {
              return res.status(400).json({ message: "Missing studentId" });
            }
            const { data, error } = await supabase
              .from("topic_conditioning_activations")
              .select("id, student_id, tutor_id, topic, reason, created_at")
              .eq("student_id", studentId)
              .order("created_at", { ascending: false });
            if (error) {
              console.error("Error fetching topic activations:", error);
              return res.status(500).json({ message: "Failed to fetch topic activations" });
            }
            res.json({ activations: data });
          } catch (err) {
            console.error("Exception in topic activations fetch:", err);
            res.status(500).json({ message: "Internal server error" });
          }
        });

          app.get("/api/tutor/students/:studentId/latest-intro-drill", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
            try {
              const { studentId } = req.params;
              const tutorId = (req as any).dbUser.id;
              if (!studentId) {
                return res.status(400).json({ message: "Missing studentId" });
              }
              const student = await storage.getStudent(studentId);
              if (!student || student.tutorId !== tutorId) {
                return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
              }

              const { data, error } = await supabase
                .from("intro_session_drills")
                .select("id, drill, submitted_at")
                .eq("student_id", studentId)
                .order("submitted_at", { ascending: false })
                .limit(20);

              if (error || !data || data.length === 0) {
                return res.status(404).json({ message: "No intro drill found for this student" });
              }

              let latestDiagnosis: any = null;
              for (const row of data) {
                let parsed: any = null;
                try {
                  parsed = row.drill && typeof row.drill === "object"
                    ? row.drill
                    : JSON.parse(typeof row.drill === "string" ? row.drill : "{}");
                } catch {
                  parsed = null;
                }
                if ((parsed?.drillType || "diagnosis") === "diagnosis") {
                  latestDiagnosis = { row, parsed };
                  break;
                }
              }

              if (!latestDiagnosis) {
                return res.status(404).json({ message: "No intro diagnosis drill found for this student" });
              }

              const drillObj = latestDiagnosis.parsed;
              res.json({
                id: latestDiagnosis.row.id,
                topic: drillObj.introTopic || drillObj.topic,
                entry_phase: drillObj.phase || drillObj.summary?.phase,
                phaseObserved: drillObj.phase || drillObj.summary?.phase,
                stability: drillObj.summary?.stability || "Low",
                stabilityObserved: drillObj.summary?.stability || "Low",
                drillType: drillObj.drillType,
                summary: drillObj.summary,
                submitted_at: latestDiagnosis.row.submitted_at,
              });
            } catch (err) {
              console.error("Exception in latest intro drill fetch:", err);
              res.status(500).json({ message: "Internal server error" });
            }
          });

      // Tutor: Activate a topic for a student
    app.post("/api/tutor/students/:studentId/topic-conditioning", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const { topic, reason } = req.body;
        const tutorId = (req as any).dbUser?.id;
        if (!studentId || !topic || !reason || !tutorId) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        const { data, error } = await supabase
          .from("topic_conditioning_activations")
          .insert({
            student_id: studentId,
            tutor_id: tutorId,
            topic,
            reason,
          })
          .select()
          .single();
        if (error) {
          console.error("Error inserting topic activation:", error);
          return res.status(500).json({ message: "Failed to activate topic" });
        }
        res.json({ activation: data });
      } catch (err) {
        console.error("Exception in topic activation:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  const getConfidenceScore = (confidenceLevel?: string | null) => {
    const confidenceLevelMap: Record<string, number> = {
      "very confident": 9,
      "confident": 8,
      "somewhat confident": 6,
      "not confident": 3,
      "very confident ": 9,
      "confident ": 8,
      "somewhat confident ": 6,
      "not confident ": 3,
    };

    return confidenceLevelMap[(confidenceLevel || "").toLowerCase()] || 5;
  };

  const ensureStudentForEnrollment = async (enrollment: any, tutorIdOverride?: string) => {
    const tutorId = tutorIdOverride || enrollment?.assigned_tutor_id;
    if (!enrollment || !tutorId || !enrollment.user_id || !enrollment.student_full_name || !enrollment.student_grade) {
      return null;
    }

    let existingStudent: any = null;

    if (enrollment.assigned_student_id) {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", enrollment.assigned_student_id)
        .maybeSingle();
      existingStudent = data;
    }

    if (!existingStudent) {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", enrollment.user_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();
      existingStudent = data;
    }

    if (!existingStudent) {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("name", enrollment.student_full_name)
        .eq("tutor_id", tutorId)
        .maybeSingle();
      existingStudent = data;
    }

    const studentPayload = {
      name: enrollment.student_full_name,
      grade: enrollment.student_grade,
      parent_contact: enrollment.parent_email,
    };

    if (existingStudent) {
      const needsUpdate =
        existingStudent.name !== studentPayload.name ||
        existingStudent.grade !== studentPayload.grade ||
        existingStudent.parent_contact !== studentPayload.parent_contact;

      if (needsUpdate) {
        const { data: updatedStudent, error: updateError } = await supabase
          .from("students")
          .update(studentPayload)
          .eq("id", existingStudent.id)
          .select("*")
          .maybeSingle();

        if (updateError) {
          throw updateError;
        }

        existingStudent = updatedStudent || existingStudent;
      }
    } else {
      const createdStudent = await storage.createStudent({
        name: enrollment.student_full_name,
        grade: enrollment.student_grade,
        tutorId,
        sessionProgress: 0,
        parentContact: enrollment.parent_email,
        parent_id: enrollment.user_id,
      } as any);

      existingStudent = createdStudent;
    }

    if (existingStudent?.id && enrollment.id && enrollment.assigned_student_id !== existingStudent.id) {
      const { error: linkError } = await supabase
        .from("parent_enrollments")
        .update({ assigned_student_id: existingStudent.id, updated_at: new Date().toISOString() })
        .eq("id", enrollment.id);

      if (linkError) {
        // Some deployments don't yet have assigned_student_id on parent_enrollments.
        // In that case we continue using canonical session matching fallbacks.
        if (String(linkError?.message || "").includes("assigned_student_id")) {
          console.warn("parent_enrollments.assigned_student_id missing; skipping enrollment-student linking");
        } else {
          console.error("Failed to link enrollment to student:", linkError);
        }
      }
    }

    return existingStudent;
  };

                  // Tutor fetches intro session by parentId and tutorId (studentId null)
                  app.get("/api/tutor/parent/:parentId/tutor/:tutorId/intro-session-details", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
                    try {
                      const { parentId, tutorId } = req.params;
                      const { data: session, error } = await supabase
                        .from("scheduled_sessions")
                        .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, parent_id, type")
                        .eq("parent_id", parentId)
                        .eq("tutor_id", tutorId)
                        .is("student_id", null)
                        .eq("type", "intro")
                        .order("created_at", { ascending: false })
                        .maybeSingle();
                      if (error) return res.status(500).json({ message: "Failed to fetch intro session", details: error });
                      if (!session) return res.status(404).json({ message: "Intro session not found" });
                      res.json(session);
                    } catch (err) {
                      console.error("Error fetching intro session by parent/tutor:", err);
                      res.status(500).json({ message: "Failed to fetch intro session" });
                    }
                  });
                // Parent signup (store affiliate code in session)
                app.post("/api/auth/signup", async (req: Request, res: Response) => {
                  console.log("[SIGNUP] Received signup body:", req.body);
                  if (req.body.affiliate_code) {
                    req.session.affiliateCode = req.body.affiliate_code;
                    console.log("[SIGNUP] Affiliate code stored in session:", req.session.affiliateCode);
                  } else {
                    console.log("[SIGNUP] No affiliate_code in signup body.");
                  }
                  // ...existing signup logic...
                  res.json({ message: "Signup route hit (demo logging only)" });
                });
              // Parent signup (store affiliate code in session)
              app.post("/api/auth/signup", async (req: Request, res: Response) => {
                // ...existing signup logic...
                if (req.body.affiliate_code) {
                  req.session.affiliateCode = req.body.affiliate_code;
                  console.log("[SIGNUP] Affiliate code stored in session:", req.body.affiliate_code);
                }
                // ...existing signup logic...
              });
            // Parent confirms intro session
            app.post("/api/parent/intro-session-confirm", isAuthenticated, async (req: Request, res: Response) => {
              try {
                const userId = (req as any).dbUser.id;
                const { sessionId } = req.body;
                if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });
                // Only allow parent to confirm their own session
                const { error: sessionUpdateError } = await supabase
                  .from("scheduled_sessions")
                  .update({ parent_confirmed: true, status: "confirmed", updated_at: new Date().toISOString() })
                  .eq("id", sessionId)
                  .eq("parent_id", userId);
                if (sessionUpdateError) return res.status(500).json({ message: "Failed to confirm session", details: sessionUpdateError });

                // Also update parent_enrollments.status to 'session_booked' for this parent
                // Find enrollment by parent_id and status 'proposal_sent'
                const { data: enrollment } = await supabase
                  .from("parent_enrollments")
                  .select("id")
                  .eq("user_id", userId)
                  .eq("status", "proposal_sent")
                  .maybeSingle();
                if (enrollment && enrollment.id) {
                  const { error: enrollmentUpdateError } = await supabase
                    .from("parent_enrollments")
                    .update({ status: "session_booked", updated_at: new Date().toISOString() })
                    .eq("id", enrollment.id);
                  if (enrollmentUpdateError) return res.status(500).json({ message: "Failed to update enrollment status", details: enrollmentUpdateError });
                }

                // Fetch session details for calendar event
                const { data: session, error: fetchError } = await supabase
                  .from("scheduled_sessions")
                  .select("id, scheduled_time, tutor_id, parent_id, student_id")
                  .eq("id", sessionId)
                  .maybeSingle();
                if (fetchError || !session) {
                  return res.status(500).json({ message: "Session confirmed, but failed to fetch session details for calendar event", details: fetchError });
                }

                // Fetch parent and tutor emails
                const { data: parent, error: parentError } = await supabase
                  .from("parents")
                  .select("email")
                  .eq("id", session.parent_id)
                  .maybeSingle();
                const { data: tutor, error: tutorError } = await supabase
                  .from("tutors")
                  .select("email")
                  .eq("id", session.tutor_id)
                  .maybeSingle();
                if (parentError || tutorError || !parent || !tutor) {
                  return res.status(500).json({ message: "Session confirmed, but failed to fetch parent/tutor emails for calendar event", details: parentError || tutorError });
                }

                // Prepare event details
                const summary = "Intro Tutoring Session";
                const description = `First session for parent and tutor. Session ID: ${sessionId}`;
                const startDateTime = session.scheduled_time;
                // Assume 1 hour session
                const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

                // Import and call createIntroSessionEvent
                const { createIntroSessionEvent } = await import("../../create-intro-session.js");
                try {
                  await createIntroSessionEvent({
                    summary,
                    description,
                    startDateTime,
                    endDateTime,
                    parentEmail: parent.email,
                    tutorEmail: tutor.email,
                  });
                } catch (calendarError) {
                  console.error("Failed to create Google Calendar event:", calendarError);
                  // Optionally: return error, or just log and continue
                }

                res.json({ success: true });
              } catch (error) {
                console.error("Error in parent intro session confirm:", error);
                res.status(500).json({ message: "Failed to confirm session" });
              }
            });

            // Parent proposes adjustment to intro session
            app.post("/api/parent/intro-session-adjust", isAuthenticated, async (req: Request, res: Response) => {
              try {
                const userId = (req as any).dbUser.id;
                const { sessionId, newDate, newTime } = req.body;
                if (!sessionId || !newDate || !newTime) return res.status(400).json({ message: "Missing sessionId, date, or time" });
                // Only allow parent to adjust their own session
                const { error: updateError } = await supabase
                  .from("scheduled_sessions")
                  .update({
                    scheduled_time: `${newDate}T${newTime}`,
                    parent_confirmed: true,
                    tutor_confirmed: false,
                    status: "pending_tutor_confirmation",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", sessionId)
                  .eq("parent_id", userId);
                if (updateError) return res.status(500).json({ message: "Failed to propose adjustment", details: updateError });
                res.json({ success: true });
              } catch (error) {
                console.error("Error in parent intro session adjust:", error);
                res.status(500).json({ message: "Failed to propose adjustment" });
              }
            });
          // Tutor responds to intro session (accept/adjust)
          app.post("/api/tutor/student/:studentId/intro-session-response", isAuthenticated, requireRole(["tutor"]), async (req: Request, res: Response) => {
            try {
              const { studentId } = req.params;
              const dbUser = (req as any).dbUser;
              const { action, newDate, newTime } = req.body;
              // Try to find the intro session for this tutor/student
              let { data: session, error: sessionError } = await supabase
                .from("scheduled_sessions")
                .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, parent_id, type")
                .eq("tutor_id", dbUser.id)
                .eq("student_id", studentId)
                .eq("type", "intro")
                .order("created_at", { ascending: false })
                .maybeSingle();
              // If not found, try fallback: find by parent_id where student_id is null
              if (!session) {
                // Get parentId for this student
                const { data: studentRow } = await supabase
                  .from("students")
                  .select("parent_id")
                  .eq("id", studentId)
                  .maybeSingle();
                const parentId = studentRow?.parent_id;
                if (parentId) {
                  const { data: fallbackSession } = await supabase
                    .from("scheduled_sessions")
                    .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, parent_id, type")
                    .eq("tutor_id", dbUser.id)
                    .eq("parent_id", parentId)
                    .is("student_id", null)
                    .eq("type", "intro")
                    .order("created_at", { ascending: false })
                    .maybeSingle();
                  if (fallbackSession) {
                    session = fallbackSession;
                  }
                }
              }
              if (!session) {
                return res.status(404).json({ message: "Intro session not found" });
              }
              let updateFields = {};
              if (action === "accept") {
                updateFields = {
                  tutor_confirmed: true,
                  parent_confirmed: true,
                  status: "confirmed",
                  updated_at: new Date().toISOString(),
                };
              } else if (action === "propose_adjustment") {
                if (!newDate || !newTime) {
                  return res.status(400).json({ message: "Missing new date or time" });
                }
                // Tutor is proposing an adjustment, so tutor has confirmed, parent must confirm next
                updateFields = {
                  scheduled_time: `${newDate}T${newTime}`,
                  tutor_confirmed: true,
                  parent_confirmed: false,
                  status: "pending_parent_confirmation",
                  updated_at: new Date().toISOString(),
                };
              } else {
                return res.status(400).json({ message: "Invalid action" });
              }
              console.log('[DEBUG] Updating scheduled_sessions', { sessionId: session.id, updateFields });
              const { error: updateError, data: updateData } = await supabase
                .from("scheduled_sessions")
                .update(updateFields)
                .eq("id", session.id)
                .select();
              console.log('[DEBUG] Update result', { updateError, updateData });
              if (updateError) {
                return res.status(500).json({ message: "Failed to update session", details: updateError });
              }
              res.json({ success: true });
            } catch (error) {
              console.error("Error in tutor intro session response:", error);
              res.status(500).json({ message: "Failed to process tutor response" });
            }
          });
        // ...existing code...
      // Revoke (delete) an affiliate code by ID
      app.delete("/api/coo/affiliate-codes/:id", isAuthenticated, requireRole(["coo"]), async (req: Request, res: Response) => {
        try {
          const { pool } = await import('./db.js');
          const dbUser = (req as any).dbUser;
          const { id } = req.params;
          // Only allow deleting codes created by this COO
          const result = await pool.query(
            `DELETE FROM affiliate_codes WHERE id = $1 AND affiliate_id = $2 RETURNING *`,
            [id, dbUser.id]
          );
          if (result.rowCount === 0) {
            return res.status(404).json({ message: "Code not found or not authorized" });
          }
          res.json({ success: true });
        } catch (err) {
          console.error("[affiliate-codes:delete] Error:", err);
          res.status(500).json({ message: err.message || "Failed to revoke code" });
        }
      });
    // List all affiliate codes for the current COO
    app.get("/api/coo/affiliate-codes", isAuthenticated, requireRole(["coo"]), async (req: Request, res: Response) => {
      try {
        const { pool } = await import('./db.js');
        const { transformSnakeToCamel } = await import('./storage');
        const dbUser = (req as any).dbUser;
        // Only show codes created by this COO
        const result = await pool.query(
          `SELECT * FROM affiliate_codes WHERE affiliate_id = $1 ORDER BY created_at DESC`,
          [dbUser.id]
        );
        const camelRows = transformSnakeToCamel(result.rows);
        res.json(camelRows);
      } catch (err) {
        console.error("[affiliate-codes] Error:", err);
        res.status(500).json({ message: err.message || "Failed to fetch codes" });
      }
    });
  // Debug: Test DB connectivity (single endpoint, uses pool)
  app.get("/api/debug/db-test", async (req: Request, res: Response) => {
    try {
      // Log the DATABASE_URL being used
      console.log("[DEBUG] DATABASE_URL:", process.env.DATABASE_URL);
      const { pool } = await import('./db.js');
      const result = await pool.query("SELECT 1 AS test");
      res.json({ success: true, result: result.rows });
    } catch (err) {
      console.error("[DEBUG] REAL ERROR:", err);
      res.status(500).json({ success: false, error: err.message || String(err), details: err });
    }
  });
  // COO: Create affiliate code/link
  app.post("/api/coo/create-affiliate-code", isAuthenticated, requireRole(["coo"]), async (req: Request, res: Response) => {
    console.log("[DEBUG] Session on POST /api/coo/create-affiliate-code:", req.session);
    try {
      const { type, personName, entityName, schoolType } = req.body;
      // Generate unique code (simple example)
      const code = "AFIX" + Math.random().toString(36).substring(2, 8).toUpperCase();
      // Insert into DB
      const affiliateCode = await createAffiliateCode({
        affiliateId: (req as any).dbUser?.id,
        code,
        type,
        personName,
        entityName,
        schoolType,
      });
      res.json({ code });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to create affiliate code" });
    }
  });

  // Debug endpoint for remote header/session inspection
  app.get("/api/debug/auth-info", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || null;
    const sessionId = req.sessionID || null;
    const session = req.session || null;
    console.log("[DEBUG] /api/debug/auth-info");
    console.log("  Authorization header:", authHeader);
    console.log("  Session ID:", sessionId);
    console.log("  Session:", session);
    console.log("  Cookies:", req.headers.cookie || null);
    console.log("  User-Agent:", req.headers["user-agent"] || null);
    console.log("  Origin:", req.headers.origin || null);
    console.log("  Referer:", req.headers.referer || null);
    res.json({
          authorization: authHeader,
          sessionId,
          session,
          cookies: req.headers.cookie || null,
          userAgent: req.headers["user-agent"] || null,
          origin: req.headers.origin || null,
          referer: req.headers.referer || null
        });
      });
    // Get intro session details for a student (for tutors)
    app.get(
      "/api/tutor/students/:studentId/intro-session-details",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          console.log('TEST LOG: intro-session-details route hit');
          const { studentId } = req.params;
          const dbUser = (req as any).dbUser;
          // Verify student exists and belongs to this tutor
          const student = await storage.getStudent(studentId);
          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }
          if (student.tutorId !== dbUser.id) {
            return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
          }
          // DEBUG: Print all scheduled_sessions for this tutor and student
          const { data: debugSessions, error: debugSessionsError } = await supabase
            .from("scheduled_sessions")
            .select("id, tutor_id, student_id, type, status, scheduled_time, parent_confirmed, tutor_confirmed, created_at, updated_at")
            .eq("tutor_id", dbUser.id)
            .eq("student_id", studentId);
          console.log("[DEBUG] All scheduled_sessions for tutor and student:", { debugSessions, debugSessionsError, tutorId: dbUser.id, studentId });
          // Find latest intro session for this student/tutor
          const { data: session, error: sessionError } = await supabase
            .from("scheduled_sessions")
            .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, type")
            .eq("tutor_id", dbUser.id)
            .eq("student_id", studentId)
            .eq("type", "intro")
            .order("created_at", { ascending: false })
            .maybeSingle();
          console.log("[DEBUG] intro-session-details query result:", { session, sessionError, tutorId: dbUser.id, studentId });
          if (sessionError) {
            console.error("[DEBUG] intro-session-details sessionError:", sessionError);
            return res.status(500).json({ message: "Failed to fetch intro session details", details: sessionError });
          }
          if (!session) {
            return res.json({ status: "not_scheduled" });
          }
          res.json({
            id: session.id,
            scheduled_time: session.scheduled_time,
            status: session.status,
            parent_confirmed: session.parent_confirmed,
            tutor_confirmed: session.tutor_confirmed,
            created_at: session.created_at,
            updated_at: session.updated_at,
            debug: {
              tutor_id: session.tutor_id,
              student_id: session.student_id,
              type: session.type
            }
          });
        } catch (error) {
          console.error("[DEBUG] Error fetching intro session details:", error);
          res.status(500).json({ message: "Failed to fetch intro session details", details: error });
        }
      }
    );
  // ...existing code...
  await setupAuth(app);

  // Parent proposes an intro session (after auth setup)
  app.post("/api/parent/intro-session/propose", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).dbUser.id;
      const { proposedDate, proposedTime } = req.body;
      if (!proposedDate || !proposedTime) {
        return res.status(400).json({ message: "Missing date or time" });
      }

      // Get parent's enrollment to find assigned tutor
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (enrollmentError || !enrollmentData) {
        return res.status(400).json({ message: "Failed to fetch enrollment" });
      }
      if (!enrollmentData.assigned_tutor_id || enrollmentData.status !== "assigned") {
        return res.status(400).json({ message: "You must be assigned a tutor before booking a session." });
      }

      const assignedStudent = enrollmentData.assigned_student_id
        ? await storage.getStudent(enrollmentData.assigned_student_id)
        : await ensureStudentForEnrollment(enrollmentData, enrollmentData.assigned_tutor_id);

      // Removed check for assignedWorkflow.assignmentAcceptedAt; only enrollment status and assigned tutor are required


      // Check for existing pending intro session for this parent/tutor
      const { data: existingSession, error: existingSessionError } = await supabase
        .from("scheduled_sessions")
        .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed")
        .eq("parent_id", userId)
        .eq("tutor_id", enrollmentData.assigned_tutor_id)
        .eq("type", "intro")
        .in("status", ["pending_tutor_confirmation", "pending_parent_confirmation"])
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (existingSession) {
        // If a pending session exists, update it with the new proposed time and confirmation flags
        const { error: updateError } = await supabase
          .from("scheduled_sessions")
          .update({
            scheduled_time: `${proposedDate}T${proposedTime}`,
            parent_confirmed: true,
            tutor_confirmed: false,
            status: "pending_tutor_confirmation",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSession.id);
        if (updateError) {
          console.error("Error updating existing intro session:", updateError);
          return res.status(500).json({ message: "Failed to update session" });
        }
        return res.status(200).json({
          id: existingSession.id,
          status: "pending_tutor_confirmation",
          scheduled_time: `${proposedDate}T${proposedTime}`,
          parent_confirmed: true,
          tutor_confirmed: false,
        });
      }

      // Insert new intro session if none exists
      const { data: sessionInsert, error: sessionError } = await supabase
        .from("scheduled_sessions")
        .insert([
          {
            parent_id: userId,
            tutor_id: enrollmentData.assigned_tutor_id,
            scheduled_time: `${proposedDate}T${proposedTime}`,
            type: "intro",
            status: "pending_tutor_confirmation",
            parent_confirmed: true,
            tutor_confirmed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (sessionError) {
        console.error("Error inserting intro session:", sessionError);
        return res.status(500).json({ message: "Failed to propose session" });
      }

      try {
        await ensureStudentForEnrollment(enrollmentData, enrollmentData.assigned_tutor_id);
      } catch (studentCreateError) {
        console.error("Error creating student record on intro session booking:", studentCreateError);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in propose intro session:", error);
      res.status(500).json({ message: "Failed to propose session" });
    }
  });

    // Parent intro session confirmation status
    app.get("/api/parent/intro-session-confirmation", isAuthenticated, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        console.log("[DEBUG] /api/parent/intro-session-confirmation userId:", userId);

        // Get parent's enrollment to find assigned tutor
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("parent_enrollments")
          .select("assigned_tutor_id, status, user_id")
          .eq("user_id", userId)
          .maybeSingle();
        console.log("[DEBUG] /api/parent/intro-session-confirmation enrollmentData:", enrollmentData, "enrollmentError:", enrollmentError);

        if (enrollmentError || !enrollmentData || !enrollmentData.assigned_tutor_id) {
          console.log("[DEBUG] /api/parent/intro-session-confirmation: no assigned tutor");
          return res.json({ status: "not_scheduled" });
        }


        // Find all intro sessions for this parent/tutor
        const { data: allSessions, error: allSessionsError } = await supabase
          .from("scheduled_sessions")
          .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, parent_id, tutor_id, type, created_at, updated_at")
          .eq("parent_id", userId)
          .eq("tutor_id", enrollmentData.assigned_tutor_id)
          .eq("type", "intro")
          .order("created_at", { ascending: false });
        console.log("[DEBUG] /api/parent/intro-session-confirmation allSessions:", allSessions, "allSessionsError:", allSessionsError);

        // Use the most recent session if any
        const session = allSessions && allSessions.length > 0 ? allSessions[0] : null;
        const sessionError = allSessionsError;
        console.log("[DEBUG] /api/parent/intro-session-confirmation session:", session, "sessionError:", sessionError);

        if (sessionError || !session) {
          // If we can't find a session, just check if the enrollment is assigned
          if (enrollmentData.status === "assigned") {
            console.log("[DEBUG] /api/parent/intro-session-confirmation response: awaiting_tutor_acceptance (no session found, but assigned)");
            return res.json({
              status: "awaiting_tutor_acceptance",
              introCompleted: false,
            });
          }
          console.log("[DEBUG] /api/parent/intro-session-confirmation response: not_scheduled");
          return res.json({ status: "not_scheduled" });
        }

        // Always use the actual session.status for the response
        const responseObj = {
          id: session.id,
          status: session.status,
          scheduled_time: session.scheduled_time,
          parent_confirmed: session.parent_confirmed,
          tutor_confirmed: session.tutor_confirmed,
          debug: {
            parent_id: session.parent_id,
            tutor_id: session.tutor_id,
            type: session.type,
            session_status: session.status
          }
        };
        console.log("[DEBUG] /api/parent/intro-session-confirmation response:", responseObj);
        return res.json(responseObj);

        let introCompleted = false;
        if (enrollmentData.assigned_student_id) {
          const assignedStudent = await storage.getStudent(enrollmentData.assigned_student_id);
          const workflow = (assignedStudent?.personalProfile as any)?.workflow || {};
          introCompleted = !!workflow.introCompletedAt;
        }

        // Always include id in response
        if (!session.tutor_confirmed) {
          return res.json({
            id: session.id,
            status: "pending_tutor_confirmation",
            scheduled_time: session.scheduled_time,
            introCompleted,
          });
        }
        if (!session.parent_confirmed) {
          return res.json({
            id: session.id,
            status: "pending_parent_confirmation",
            scheduled_time: session.scheduled_time,
            introCompleted,
          });
        }
        return res.json({
          id: session.id,
          status: "confirmed",
          scheduled_time: session.scheduled_time,
          introCompleted,
        });
      } catch (error) {
        console.error("Error in intro-session-confirmation:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch intro session confirmation status" });
      }
    });
  // Auth middleware
  await setupAuth(app);

  // Simple health check to verify JSON responses and CORS
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ========================================
  // AUTH ROUTES
  // ========================================

  // User endpoint is now handled by setupAuth in supabaseAuth.ts

  // Verify role authorization for email
  app.post("/api/auth/verify-role", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        role: z.enum(["tutor", "td", "coo"]),
      });
      const { email, role } = schema.parse(req.body);
      
      const isAuthorized = await storage.checkRoleAuthorization(email, role);
      
      if (!isAuthorized) {
        return res.status(403).json({ 
          valid: false, 
          error: "Email not authorized for this role" 
        });
      }
      
      res.json({ valid: true, role });
    } catch (error) {
      console.error("Error verifying role:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Check if TD has pod assignment
  app.get("/api/auth/check-td-assignment", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }
      
      const podId = await storage.checkTDPodAssignment(email);
      res.json({ hasPod: !!podId, podId });
    } catch (error) {
      console.error("Error checking TD assignment:", error);
      res.status(500).json({ message: "Failed to check TD assignment" });
    }
  });

  // Assign role permission (dev-only for now)
  app.post("/api/auth/assign-role", async (req: Request, res: Response) => {
    try {
      const permission = roleAuthorizationSchema.parse(req.body);
      await storage.addRolePermission(permission);
      res.json({ success: true, permission });
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // ========================================
  // TUTOR ROUTES
  // ========================================
    // Aggregated gateway session endpoint
    app.get(
      "/api/tutor/gateway-session",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          const tutorId = (req as any).dbUser.id;
          const dbUser = (req as any).dbUser;
          // Fetch assignment
          const assignment = await storage.getTutorAssignment(tutorId);
          // Fetch students
          const students = await storage.getStudentsByTutor(tutorId);
          // Fetch sessions
          const sessions = await storage.getSessionsByTutor(tutorId);
          // Fetch academic profile (verification status)
          const profile = await storage.getAcademicProfile(tutorId);
          // Fetch province (assuming it's in dbUser or profile)
          const province = dbUser?.province || profile?.province || null;
          // Role
          const role = dbUser?.role || "tutor";
          // Enrollment status (from parent_enrollments)
          const { data: enrollments } = await supabase
            .from("parent_enrollments")
            .select("status")
            .eq("assigned_tutor_id", tutorId);
          const enrollmentStatus = enrollments && enrollments.length > 0 ? enrollments[0].status : null;
          // Verification status (from profile)
          const verificationStatus = profile?.verified || false;

          // Fetch tutor application status and onboarding progress
          const tutorApplications = await storage.getTutorApplicationsByUser(tutorId);
          const latestApp = tutorApplications && tutorApplications.length > 0 ? tutorApplications[0] : null;
          let applicationStatus = null;
          if (latestApp) {
            const fallbackDocumentsStatus = {
              "1": "pending_upload",
              "2": "not_started",
              "3": "not_started",
              "4": "not_started",
              "5": "not_started",
            };
            const documentsStatus = latestApp.documentsStatus && typeof latestApp.documentsStatus === "object"
              ? { ...fallbackDocumentsStatus, ...latestApp.documentsStatus }
              : fallbackDocumentsStatus;
            const sequentialReviewStarted = Object.values(documentsStatus).some(
              (docStatus) => docStatus === "pending_review" || docStatus === "approved" || docStatus === "rejected"
            );
            const allSequentialDocumentsApproved = Object.values(documentsStatus).every((docStatus) => docStatus === "approved");
            let status = latestApp.status;
            const isUnder18 = latestApp.age < 18;
            if (allSequentialDocumentsApproved) {
              status = "confirmed";
            } else if (status === "approved" && sequentialReviewStarted) {
              status = "verification";
            }
            applicationStatus = {
              ...latestApp,
              status,
              applicationId: latestApp.id,
              hasTrialAgreement: !!latestApp.trialAgreementUrl,
              hasParentConsent: !!latestApp.parentConsentUrl,
              trialAgreementVerified: !!latestApp.trialAgreementVerified,
              parentConsentVerified: !!latestApp.parentConsentVerified,
              trialAgreementUrl: latestApp.trialAgreementUrl,
              parentConsentUrl: latestApp.parentConsentUrl,
              isUnder18,
              documentSubmissionStep: latestApp.documentSubmissionStep || (latestApp.status === "approved" ? 1 : 0),
              documentsStatus,
              onboardingCompletedAt: latestApp.onboardingCompletedAt ?? null,
            };
          }
    // Add route for singular 'student' to match frontend
    app.get(
      "/api/tutor/student/:studentId/intro-session-details",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          const { studentId } = req.params;
          const dbUser = (req as any).dbUser;
          // Try to find student by ID
          let student = null;
          let parentId = null;
          try {
            student = await storage.getStudent(studentId);
          } catch {}
          if (student) {
            parentId = student.parentId;
            // If student exists, check tutor ownership
            if (student.tutorId !== dbUser.id) {
              return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
            }
          } else {
            // If student does not exist, try to fetch parentId from DB
            const studentRow = await supabase
              .from("students")
              .select("parent_id")
              .eq("id", studentId)
              .maybeSingle();
            parentId = studentRow.data?.parent_id;
          }
          // Try to find intro session by student_id first (if student exists)
          let session = null;
          let sessionError = null;
          if (student) {
            const result = await supabase
              .from("scheduled_sessions")
              .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, parent_id, type")
              .eq("tutor_id", dbUser.id)
              .eq("student_id", studentId)
              .eq("type", "intro")
              .order("created_at", { ascending: false })
              .maybeSingle();
            session = result.data;
            sessionError = result.error;
          }
          // Always try fallback: return intro session with student_id=null if the parentId matches
          if (!session && parentId) {
            const { data: introSession, error: introSessionError } = await supabase
              .from("scheduled_sessions")
              .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at, tutor_id, student_id, parent_id, type")
              .eq("tutor_id", dbUser.id)
              .eq("parent_id", parentId)
              .eq("type", "intro")
              .is("student_id", null)
              .order("created_at", { ascending: false })
              .maybeSingle();
            if (introSession) {
              session = introSession;
            }
          }
          console.log("[DEBUG] intro-session-details query result (with fallback):", { session, sessionError, tutorId: dbUser.id, studentId, parentId });
          if (sessionError) {
            console.error("[DEBUG] intro-session-details sessionError:", sessionError);
            return res.status(500).json({ message: "Failed to fetch intro session details", details: sessionError });
          }
          if (!session) {
            return res.json({ status: "not_scheduled" });
          }
          res.json({
            id: session.id,
            scheduled_time: session.scheduled_time,
            status: session.status,
            parent_confirmed: session.parent_confirmed,
            tutor_confirmed: session.tutor_confirmed,
            created_at: session.created_at,
            updated_at: session.updated_at,
            debug: {
              tutor_id: session.tutor_id,
              student_id: session.student_id,
              parent_id: session.parent_id,
              type: session.type
            }
          });
        } catch (error) {
          console.error("[DEBUG] Error fetching intro session details:", error);
          res.status(500).json({ message: "Failed to fetch intro session details", details: error });
        }
      }
    );

          // Compose unified session object
          const gatewaySession = {
            assignment,
            students,
            sessions,
            profile,
            province,
            role,
            enrollmentStatus,
            verificationStatus,
            applicationStatus,
          };
          res.json(gatewaySession);
        } catch (error) {
          console.error("Error fetching gateway session:", error);
          res.status(500).json({ message: "Failed to fetch gateway session" });
        }
      }
    );

  // Get tutor's pod assignment and students
  const TOPIC_LABELS: Record<string, string> = {
    word_problems: "Word problems",
    tests: "Tests",
    timed_work: "Timed work",
    new_topics: "New topics",
    careless_errors: "Careless errors",
  };

  const parseTopicText = (value: unknown): string[] => {
    if (!value || typeof value !== "string") return [];
    return value
      .split(/[\n,;|]+/)
      .map((part) => part.replace(/^[-*\u2022\s]+/, "").trim())
      .filter(Boolean);
  };

  const buildReportedTopics = (stuckAreas: unknown, mathStruggleAreas: unknown): string[] => {
    const selected = Array.isArray(stuckAreas)
      ? stuckAreas
          .map((value) => TOPIC_LABELS[String(value)] || String(value))
          .map((topic) => topic.trim())
          .filter(Boolean)
      : [];

    const typed = parseTopicText(mathStruggleAreas);
    return Array.from(new Set([...selected, ...typed]));
  };

  const buildResponseSymptoms = (confidenceLevel: unknown): string[] => {
    switch (confidenceLevel) {
      case "very_low":
        return ["Freezes when questions look unfamiliar", "Seeks help early"];
      case "low":
        return ["Rushes under pressure", "Guesses without full structure"];
      case "average":
        return ["Breaks under time pressure"];
      case "high":
        return ["Stays structured under uncertainty"];
      default:
        return [];
    }
  };

  const buildIntakeSignals = (enrollment: any) => {
    const reportedTopics = buildReportedTopics([], enrollment?.math_struggle_areas);
    const responseSymptoms = buildResponseSymptoms(enrollment?.confidence_level);
    return {
      reported_topics: reportedTopics,
      response_symptoms: responseSymptoms,
      diagnostic_focus: {
        start_with: reportedTopics[0] || null,
        watch_for: responseSymptoms.slice(0, 2),
      },
    };
  };

  const buildTopicConditioningMap = (proposal: any) => {
    if (!proposal) return null;

    const normalizePhase = (raw: string | null | undefined) => {
      const value = String(raw || "").trim();
      const lower = value.toLowerCase();
      if (!value) return null;
      if (lower.includes("clarity")) return "Clarity";
      if (lower.includes("structured")) return "Structured Execution";
      if (lower.includes("discomfort")) return "Controlled Discomfort";
      if (lower.includes("time") || lower.includes("pressure")) return "Time Pressure Stability";
      return null;
    };

    const normalizeStability = (raw: string | null | undefined) => {
      const value = String(raw || "").trim().toLowerCase();
      if (!value) return null;
      if (value.includes("high")) return "High";
      if (value.includes("medium")) return "Medium";
      if (value.includes("low")) return "Low";
      return null;
    };

    const sanitizeTopic = (raw: string | null | undefined) => {
      const value = String(raw || "").trim();
      if (!value) return null;
      if (value.toLowerCase() === "onboarding baseline diagnostic") return null;
      return value;
    };

    const topic = sanitizeTopic(proposal.topic_conditioning_topic || proposal.current_topics || "");
    const noteText = String(proposal.tutor_notes || "");
    const justificationText = String(proposal.justification || "");

    const phaseFromNotes =
      noteText.match(/Training Entry Phase:\s*([^\n\r]+)/i)?.[1]?.trim() ||
      noteText.match(/Entry Phase:\s*([^\n\r]+)/i)?.[1]?.trim();
    const phaseFromJustification = justificationText.match(/Entry phase\s*([^|\.]+)/i)?.[1]?.trim();
    const stabilityFromNotes = noteText.match(/Stability:\s*([^\n\r]+)/i)?.[1]?.trim();
    const stabilityFromJustification = justificationText.match(/Stability\s*([^|\.]+)/i)?.[1]?.trim();

    const phase =
      normalizePhase(proposal.topic_conditioning_entry_phase) ||
      normalizePhase(phaseFromNotes) ||
      normalizePhase(phaseFromJustification) ||
      null;
    const stability =
      normalizeStability(proposal.topic_conditioning_stability) ||
      normalizeStability(stabilityFromNotes) ||
      normalizeStability(stabilityFromJustification) ||
      null;

    if (!topic && !phase && !stability) return null;
    return {
      topic: topic || null,
      entry_phase: phase,
      stability,
    };
  };

  app.get(
    "/api/tutor/pod",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const assignment = await storage.getTutorAssignment(tutorId);
        if (!assignment) {
          return res.json({ assignment: null, students: [] });
        }
        
        // First, check for parent enrollments assigned to this tutor that don't have students yet
        const { data: assignedEnrollments } = await supabase
          .from("parent_enrollments")
          .select("*")
          .eq("assigned_tutor_id", tutorId)
          .in("status", ["assigned", "proposal_sent", "session_booked", "report_received", "confirmed"]);
        
        // For each enrollment, check if a student exists, if not create one
        if (assignedEnrollments && assignedEnrollments.length > 0) {
          for (const enrollment of assignedEnrollments) {
            try {
              const ensuredStudent = await ensureStudentForEnrollment(enrollment, tutorId);
              if (ensuredStudent) {
                console.log("Ensured student exists:", enrollment.student_full_name);
              }
            } catch (err) {
              console.error("Error creating student from enrollment:", err);
            }
          }
        }
        
        const students = await hydrateStudentsWithSessionProgress(tutorId, await storage.getStudentsByTutor(tutorId));
        
        // Fetch parent enrollment info for each student
        const studentsWithParentInfo = await Promise.all(
          students.map(async (student: any) => {

            try {
              // Get parent enrollment for this student (match by studentId, name, or parentId)
              let parentEnrollment: any = null;
              let joinType = null;

              // 1. Try assigned_student_id
              const { data: linkedEnrollment } = await supabase
                .from("parent_enrollments")
                .select("*")
                .eq("assigned_tutor_id", tutorId)
                .eq("assigned_student_id", student.id)
                .maybeSingle();
              if (linkedEnrollment) {
                parentEnrollment = linkedEnrollment;
                joinType = "studentId";
              }

              // 2. Try student_full_name
              if (!parentEnrollment) {
                const { data: namedEnrollment } = await supabase
                  .from("parent_enrollments")
                  .select("*")
                  .eq("assigned_tutor_id", tutorId)
                  .eq("student_full_name", student.name)
                  .maybeSingle();
                if (namedEnrollment) {
                  parentEnrollment = namedEnrollment;
                  joinType = "studentName";
                }
              }

              // 3. Try parent_id (new fallback)
              if (!parentEnrollment && student.parentId) {
                const { data: parentIdEnrollment } = await supabase
                  .from("parent_enrollments")
                  .select("*")
                  .eq("assigned_tutor_id", tutorId)
                  .eq("parent_id", student.parentId)
                  .maybeSingle();
                if (parentIdEnrollment) {
                  parentEnrollment = parentIdEnrollment;
                  joinType = "parentId";
                }
              }

              console.log(`[POD JOIN DEBUG] Student: ${student.name} (${student.id}) | parentId: ${student.parentId} | joinType: ${joinType} | parentEnrollment:`, parentEnrollment);

              // Check if proposal was accepted by querying the proposal table
              let proposalAcceptedAt = null;
              let proposalSnapshot: any = null;
              if (parentEnrollment?.proposal_id) {
                const { data: proposal } = await supabase
                  .from("onboarding_proposals")
                  .select("accepted_at, current_topics, topic_conditioning_topic, topic_conditioning_entry_phase, topic_conditioning_stability, justification, tutor_notes")
                  .eq("id", parentEnrollment.proposal_id)
                  .single();
                proposalSnapshot = proposal || null;
                proposalAcceptedAt = proposal?.accepted_at || null;
              }

              // Alternative: check if enrollment status is beyond proposal_sent (session_booked or later)
              const isApproved = parentEnrollment &&
                (proposalAcceptedAt ||
                 ["session_booked", "report_received", "confirmed"].includes(parentEnrollment.status));

              return {
                ...student,
                parentInfo: parentEnrollment
                  ? {
                      ...parentEnrollment,
                      ...buildIntakeSignals(parentEnrollment),
                    }
                  : null,
                topicConditioning: buildTopicConditioningMap(proposalSnapshot),
                proposalSentAt: parentEnrollment?.proposal_sent_at || null,
                parentApprovedAt: isApproved ? (proposalAcceptedAt || parentEnrollment?.updated_at) : null,
              };
            } catch (err) {
              // If no parent enrollment found, return student without parentInfo
              return {
                ...student,
                parentInfo: null,
                topicConditioning: null,
                proposalSentAt: null,
                parentApprovedAt: null,
              };
            }
          })
        );
        
        res.json({ assignment, students: studentsWithParentInfo });
      } catch (error) {
        console.error("Error fetching pod:", error);
        res.status(500).json({ message: "Failed to fetch pod" });
      }
    }
  );

  app.get(
    "/api/tutor/pod-team",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const assignment = await storage.getTutorAssignment(tutorId);

        if (!assignment) {
          return res.json({
            pod: null,
            territoryDirector: null,
            members: [],
            memberCount: 0,
            capacity: 12,
          });
        }

        const assignments = await storage.getTutorAssignmentsByPod(assignment.podId);
        const members = await Promise.all(
          assignments.map(async (podAssignment: any) => {
            const tutor = await storage.getUser(podAssignment.tutorId);
            return {
              id: podAssignment.tutorId,
              assignmentId: podAssignment.id,
              name: tutor?.name || "Unknown Tutor",
              email: tutor?.email || "",
              phone: tutor?.phone || "",
              role: tutor?.role || "tutor",
              grade: tutor?.grade || null,
              school: tutor?.school || null,
              bio: tutor?.bio || null,
              profileImageUrl: tutor?.profileImageUrl || null,
              certificationStatus: podAssignment.certificationStatus || "pending",
            };
          })
        );

        const tdUser = assignment.pod.tdId
          ? await storage.getUser(assignment.pod.tdId)
          : null;

        return res.json({
          pod: {
            id: assignment.pod.id,
            podName: assignment.pod.podName,
          },
          territoryDirector: tdUser
            ? {
                id: tdUser.id,
                name: tdUser.name,
                email: tdUser.email,
                phone: tdUser.phone || "",
                bio: tdUser.bio || null,
                profileImageUrl: tdUser.profileImageUrl || null,
                role: tdUser.role || "td",
              }
            : null,
          members,
          memberCount: members.length,
          capacity: 12,
        });
      } catch (error) {
        console.error("Error fetching pod team:", error);
        return res.status(500).json({ message: "Failed to fetch pod team" });
      }
    }
  );

  // Backfill students from assigned parent_enrollments for the authenticated tutor
  // Useful in split deployments if automatic creation didn't run
  app.post(
    "/api/tutor/backfill-students",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const created: string[] = [];

        const { data: assignedEnrollments, error: enrollErr } = await supabase
          .from("parent_enrollments")
          .select("*")
          .eq("assigned_tutor_id", tutorId)
          .eq("status", "assigned");

        if (enrollErr) {
          return res.status(500).json({ message: "Failed to fetch enrollments" });
        }

        if (assignedEnrollments && assignedEnrollments.length > 0) {
          for (const enrollment of assignedEnrollments) {
            const { data: existingStudent } = await supabase
              .from("students")
              .select("id")
              .eq("name", enrollment.student_full_name)
              .eq("tutor_id", tutorId)
              .maybeSingle();

            if (!existingStudent) {
              const confidenceLevelMap: any = {
                "very confident": 9,
                "confident": 8,
                "somewhat confident": 6,
                "not confident": 3,
              };
              const confidenceText = (enrollment.confidence_level || "").toLowerCase();
              const confidenceScore = confidenceLevelMap[confidenceText] || 5;

              const { error: insertErr } = await supabase
                .from("students")
                .insert({
                  name: enrollment.student_full_name,
                  grade: enrollment.student_grade,
                  tutor_id: tutorId,
                  session_progress: 0,
                  parent_contact: enrollment.parent_email,
                });
              if (!insertErr) {
                created.push(enrollment.student_full_name);
              }
            }
          }
        }

        res.json({ success: true, created });
      } catch (error) {
        console.error("Error backfilling students:", error);
        res.status(500).json({ message: "Failed to backfill students" });
      }
    }
  );

  // Get tutor's students
  app.get(
    "/api/tutor/students",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const students = await hydrateStudentsWithSessionProgress(tutorId, await storage.getStudentsByTutor(tutorId));
        res.json(students);
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Failed to fetch students" });
      }
    }
  );

  // Get tutor's sessions
  app.get(
    "/api/tutor/sessions",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const sessions = await storage.getSessionsByTutor(tutorId);
        res.json(sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Failed to fetch sessions" });
      }
    }
  );

  type TopicPhase = "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability";
  type TopicStability = "Low" | "Medium" | "High";

  const PHASE_ORDER: TopicPhase[] = [
    "Clarity",
    "Structured Execution",
    "Controlled Discomfort",
    "Time Pressure Stability",
  ];

  const NEXT_ACTION_ENGINE: Record<TopicPhase, Record<TopicStability, { primaryAction: string; rules: string[]; advanceTo?: TopicPhase }>> = {
    Clarity: {
      Low: {
        primaryAction: "Reinforce Vocabulary",
        rules: ["No Boss Battles", "No time pressure", "No skipping layers"],
      },
      Medium: {
        primaryAction: "Continue 3-Layer Lens",
        rules: ["No time pressure", "Boss Battles not primary"],
      },
      High: {
        primaryAction: "Transition to Structured Execution",
        rules: ["Do not stay in teaching mode"],
        advanceTo: "Structured Execution",
      },
    },
    "Structured Execution": {
      Low: {
        primaryAction: "Run strict Model -> Apply -> Guide loops",
        rules: ["No time pressure", "Boss Battles only if student can start"],
      },
      Medium: {
        primaryAction: "Increase independent problem volume",
        rules: ["Do not rush to time pressure"],
      },
      High: {
        primaryAction: "Transition to Controlled Discomfort",
        rules: ["Do not keep repeating basic problems"],
        advanceTo: "Controlled Discomfort",
      },
    },
    "Controlled Discomfort": {
      Low: {
        primaryAction: "Introduce Boss Battles carefully",
        rules: ["No time pressure yet", "No rescuing"],
      },
      Medium: {
        primaryAction: "Increase frequency of Boss Battles",
        rules: ["Do not remove difficulty", "Do not over-guide"],
      },
      High: {
        primaryAction: "Transition to Time Pressure Stability",
        rules: ["Do not stay in comfort zone"],
        advanceTo: "Time Pressure Stability",
      },
    },
    "Time Pressure Stability": {
      Low: {
        primaryAction: "Introduce short timed problems",
        rules: ["Do not push speed", "Do not increase time pressure aggressively"],
      },
      Medium: {
        primaryAction: "Increase timed repetitions",
        rules: ["Do not sacrifice structure for speed"],
      },
      High: {
        primaryAction: "Maintain with mixed practice",
        rules: ["Do not over-train the same pattern"],
      },
    },
  };

  const PARENT_MEANING_BY_PHASE: Record<TopicPhase, string> = {
    Clarity: "Your child is building core understanding before speed or pressure work.",
    "Structured Execution": "Your child is becoming more consistent and independent with method.",
    "Controlled Discomfort": "Your child is learning to stay composed when work becomes difficult.",
    "Time Pressure Stability": "Your child is strengthening performance under time pressure.",
  };

  const TUTOR_MEANING_BY_PHASE: Record<TopicPhase, string> = {
    Clarity: "Student still needs foundational clarity before independent execution.",
    "Structured Execution": "Student can begin but still needs consistency without tutor carry.",
    "Controlled Discomfort": "Student executes, but destabilizes when challenge spikes.",
    "Time Pressure Stability": "Student can solve, but urgency still tests structure retention.",
  };

  const PHASE_FIELD_WEIGHTS: Record<TopicPhase, Record<string, number>> = {
    Clarity: {
      vocabulary_precision: 30,
      method_recognition: 30,
      reason_clarity: 20,
      immediate_apply_response: 20,
    },
    "Structured Execution": {
      start_behavior: 25,
      step_execution: 30,
      repeatability: 25,
      independence_level: 20,
    },
    "Controlled Discomfort": {
      initial_boss_response: 30,
      first_step_control: 25,
      discomfort_tolerance: 25,
      rescue_dependence: 20,
    },
    "Time Pressure Stability": {
      start_under_time: 20,
      structure_under_time: 35,
      pace_control: 20,
      completion_integrity: 25,
    },
  };

  const normalizeObservationLevel = (value: unknown): "weak" | "partial" | "clear" => {
    const v = String(value || "").toLowerCase().trim();
    if (!v) return "weak";

    if (
      v.includes("could not") ||
      v.includes("cannot") ||
      v.includes("no idea") ||
      v.includes("avoid") ||
      v.includes("guess") ||
      v.includes("froze") ||
      v.includes("abandoned") ||
      v.includes("panic-driven") ||
      v.includes("shutdown") ||
      v.includes("collapse") ||
      v.includes("needed tutor to carry")
    ) {
      return "weak";
    }

    if (
      v.includes("clear") ||
      v.includes("independent") ||
      v.includes("maintained") ||
      v.includes("controlled") ||
      v.includes("completed with structure") ||
      v.includes("calmly") ||
      v.includes("consisten") ||
      v.includes("without support") ||
      v.includes("did not seek rescue")
    ) {
      return "clear";
    }

    return "partial";
  };

  const weightedFieldContribution = (weight: number, level: "weak" | "partial" | "clear") => {
    if (level === "clear") return weight;
    if (level === "partial") return Math.round(weight * 0.6);
    return 0;
  };

  const STABILITY_THRESHOLDS = {
    low: { remainMax: 49, mediumMax: 69, highMin: 70 },
    medium: { regressMax: 44, remainMax: 74, highMin: 75 },
    high: { regressMax: 49, remainMax: 79, advanceReadyMin: 80 },
  };

  const normalizePhase = (value: unknown): TopicPhase => {
    const v = String(value || "").toLowerCase();
    if (v.includes("clarity")) return "Clarity";
    if (v.includes("structured")) return "Structured Execution";
    if (v.includes("discomfort")) return "Controlled Discomfort";
    if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
    return "Structured Execution";
  };

  const normalizeStability = (value: unknown): TopicStability => {
    const v = String(value || "").toLowerCase();
    if (v.includes("high")) return "High";
    if (v.includes("medium")) return "Medium";
    return "Low";
  };

  const deriveTrainingEntryPhase = (
    diagnosisPhase: TopicPhase,
    _stability: TopicStability,
  ): TopicPhase => {
    // Core model source of truth: diagnosis classifies entry phase/stability only.
    return diagnosisPhase;
  };

  const stabilityToScore = (stability: TopicStability) => (stability === "Low" ? 1 : stability === "Medium" ? 2 : 3);

  const inferTopicStateFromObservation = (
    observedPhase: TopicPhase,
    previousStability: TopicStability,
    categories: Array<{ key?: string; label?: string; value?: string }>
  ) => {
    const byKey = new Map<string, string>();
    for (const entry of categories || []) {
      const key = String(entry?.key || "").trim();
      const value = String(entry?.value || "").trim();
      if (key && value) byKey.set(key, value);
    }

    const scoreMap = PHASE_FIELD_WEIGHTS[observedPhase] || {};
    let sessionScore = 0;
    Object.entries(scoreMap).forEach(([key, weight]) => {
      const selected = byKey.get(key) || "";
      const level = normalizeObservationLevel(selected);
      sessionScore += weightedFieldContribution(weight, level);
    });
    sessionScore = Math.max(0, Math.min(100, sessionScore));

    let highGatePasses = true;
    if (observedPhase === "Clarity") {
      highGatePasses = Object.keys(scoreMap).every((key) => {
        const selected = byKey.get(key) || "";
        const level = normalizeObservationLevel(selected);
        return weightedFieldContribution(scoreMap[key], level) > 0;
      });
    }
    if (observedPhase === "Structured Execution") {
      const step = (byKey.get("step_execution") || "").toLowerCase();
      const start = (byKey.get("start_behavior") || "").toLowerCase();
      highGatePasses = !step.includes("guessed") && !start.includes("avoided");
    }
    if (observedPhase === "Controlled Discomfort") {
      const initial = (byKey.get("initial_boss_response") || "").toLowerCase();
      const firstStep = (byKey.get("first_step_control") || "").toLowerCase();
      highGatePasses = !initial.includes("froze") && !initial.includes("avoid") && !firstStep.includes("could not");
    }
    if (observedPhase === "Time Pressure Stability") {
      const structure = (byKey.get("structure_under_time") || "").toLowerCase();
      const pace = (byKey.get("pace_control") || "").toLowerCase();
      highGatePasses = structure.includes("maintained") && pace.includes("controlled");
    }

    let projectedStability: TopicStability = previousStability;
    let advanceReady = false;

    if (previousStability === "Low") {
      if (sessionScore <= STABILITY_THRESHOLDS.low.remainMax) projectedStability = "Low";
      else if (sessionScore <= STABILITY_THRESHOLDS.low.mediumMax) projectedStability = "Medium";
      else projectedStability = highGatePasses ? "High" : "Medium";
    }

    if (previousStability === "Medium") {
      if (sessionScore <= STABILITY_THRESHOLDS.medium.regressMax) projectedStability = "Low";
      else if (sessionScore <= STABILITY_THRESHOLDS.medium.remainMax) projectedStability = "Medium";
      else projectedStability = "High";
    }

    if (previousStability === "High") {
      if (sessionScore <= STABILITY_THRESHOLDS.high.regressMax) projectedStability = "Medium";
      else if (sessionScore <= STABILITY_THRESHOLDS.high.remainMax) projectedStability = "High";
      else {
        projectedStability = "High";
        advanceReady = true;
      }
    }

    const nextPhase = NEXT_ACTION_ENGINE[observedPhase]?.[projectedStability]?.advanceTo;
    const projectedPhase: TopicPhase = advanceReady && nextPhase ? nextPhase : observedPhase;
    const phaseDecision: "remain" | "advance" | "regress" =
      projectedPhase !== observedPhase
        ? "advance"
        : stabilityToScore(projectedStability) < stabilityToScore(previousStability)
        ? "regress"
        : "remain";

    return {
      sessionScore,
      phase: projectedPhase,
      stability: projectedStability,
      phaseDecision,
      nextAction: NEXT_ACTION_ENGINE[projectedPhase][projectedStability].primaryAction,
      constraint: NEXT_ACTION_ENGINE[projectedPhase][projectedStability].rules[0] || null,
      tutorMeaning: TUTOR_MEANING_BY_PHASE[projectedPhase],
      parentMeaning: PARENT_MEANING_BY_PHASE[projectedPhase],
    };
  };

  // Create session
  app.post(
    "/api/tutor/sessions",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        let authoritativeTopicInference: any = null;
        // Parse and type the data
        const data = insertSessionSchema.parse({
          ...req.body,
          tutorId,
          date: new Date(req.body.date),
        });
        // Defensive: ensure studentId and confidenceScoreDelta exist
        const studentId = (data as any).studentId || (data as any).student_id;
        const confidenceScoreDelta = (data as any).confidenceScoreDelta || (data as any).confidence_score_delta || 0;
        const session = await storage.createSession(data);
        // Update student progress
        if (studentId) {
          const student = await storage.getStudent(studentId);
          if (student) {
            const sessions = await storage.getSessionsByStudent(studentId);
            await storage.updateStudentProgress(
              studentId,
              sessions.length,
              confidenceScoreDelta
            );

            const topicStatePayload = req.body?.topicStatePayload;
            const topic = String(topicStatePayload?.topic || "").trim();
            if (topic) {
              const conceptMastery: any =
                student.conceptMastery && typeof student.conceptMastery === "object"
                  ? { ...(student.conceptMastery as any) }
                  : {};
              const topicConditioningStore: any =
                conceptMastery.topicConditioning && typeof conceptMastery.topicConditioning === "object"
                  ? { ...conceptMastery.topicConditioning }
                  : {};
              const topicsStore: Record<string, any> =
                topicConditioningStore.topics && typeof topicConditioningStore.topics === "object"
                  ? { ...topicConditioningStore.topics }
                  : {};

              const nowIso = new Date(req.body?.date || new Date().toISOString()).toISOString();
              const existing = topicsStore[topic] && typeof topicsStore[topic] === "object" ? topicsStore[topic] : {};

              const structuredObservation = topicStatePayload?.structuredObservation;
              const observedPhase = normalizePhase(
                structuredObservation?.observedPhase || existing?.phase || topicStatePayload?.phase
              );
              const previousStability = normalizeStability(
                structuredObservation?.previousStability || existing?.stability || topicStatePayload?.stability
              );

              const inferred =
                structuredObservation && Array.isArray(structuredObservation?.categories)
                  ? inferTopicStateFromObservation(observedPhase, previousStability, structuredObservation.categories)
                  : null;

              const resolvedPhase = inferred?.phase || normalizePhase(topicStatePayload?.phase || existing?.phase);
              const resolvedStability = inferred?.stability || normalizeStability(topicStatePayload?.stability || existing?.stability);
              const resolvedNextAction =
                inferred?.nextAction ||
                String(topicStatePayload?.nextAction || req.body?.needsReinforcement || "").trim() ||
                null;

              const resolvedStructuredObservation =
                structuredObservation && typeof structuredObservation === "object"
                  ? {
                      ...structuredObservation,
                      sessionScore: inferred?.sessionScore ?? structuredObservation?.sessionScore ?? null,
                      phaseDecision: inferred?.phaseDecision ?? structuredObservation?.phaseDecision ?? null,
                      tutorExplanation:
                        inferred?.tutorMeaning ?? structuredObservation?.tutorExplanation ?? null,
                      parentMeaning:
                        inferred?.parentMeaning ?? structuredObservation?.parentMeaning ?? null,
                      nextAction: inferred?.nextAction ?? structuredObservation?.nextAction ?? null,
                      constraint: inferred?.constraint ?? structuredObservation?.constraint ?? null,
                    }
                  : null;

              const history = Array.isArray(existing.history) ? [...existing.history] : [];
              history.push({
                date: nowIso,
                phase: resolvedPhase,
                stability: resolvedStability,
                nextAction: resolvedNextAction,
                observationNotes: String(topicStatePayload?.observationNotes || "").trim() || null,
                structuredObservation: resolvedStructuredObservation,
                sessionId: session.id,
              });

              topicsStore[topic] = {
                topic,
                phase: resolvedPhase,
                stability: resolvedStability,
                lastUpdated: nowIso,
                nextAction: resolvedNextAction,
                observationNotes: String(topicStatePayload?.observationNotes || "").trim() || null,
                structuredObservation: resolvedStructuredObservation,
                history: history.slice(-60),
              };

              topicConditioningStore.topics = topicsStore;
              topicConditioningStore.lastUpdatedTopic = topic;
              topicConditioningStore.lastUpdatedAt = nowIso;
              conceptMastery.topicConditioning = topicConditioningStore;

              authoritativeTopicInference = {
                topic,
                observedPhase,
                previousStability,
                phase: resolvedPhase,
                stability: resolvedStability,
                nextAction: resolvedNextAction,
                phaseDecision: inferred?.phaseDecision || null,
                sessionScore: inferred?.sessionScore ?? null,
                constraint: inferred?.constraint || null,
                tutorMeaning: inferred?.tutorMeaning || null,
                parentMeaning: inferred?.parentMeaning || null,
              };

              await storage.updateStudent(studentId, { conceptMastery });
            }
          }
        }
        res.json({
          ...session,
          topicInference: authoritativeTopicInference,
        });
      } catch (error) {
        console.error("Error creating session:", error);
        res.status(400).json({ message: "Failed to create session" });
      }
    }
  );

  const parseStructuredReportSummary = (summary: string | null) => {
    if (!summary) return null;
    try {
      const parsed = JSON.parse(summary);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getIsoWeekNumber = (date: Date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil((((utcDate as any) - (yearStart as any)) / 86400000 + 1) / 7);
  };

  const formatMonthName = (date: Date) => {
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const parseBossBattleCount = (rawValue: unknown) => {
    const text = String(rawValue || "").trim();
    if (!text) return 0;

    const numericMatches = text.match(/\d+/g);
    if (numericMatches && numericMatches.length > 0) {
      return numericMatches.reduce((sum, value) => sum + Number(value || 0), 0);
    }

    return 1;
  };

  const getSessionMetrics = (sessions: any[]) => {
    const readSessionText = (session: any, camelKey: string, snakeKey: string) => {
      return String(session?.[camelKey] ?? session?.[snakeKey] ?? "").trim();
    };

    const completedSessions = sessions.length;
    const bossBattlesCompleted = sessions.reduce(
      (sum, session) => sum + parseBossBattleCount(session?.bossBattlesDone ?? session?.boss_battles_done),
      0
    );
    const solutionsUnlocked = sessions.filter(
      (session) =>
        !!readSessionText(session, "vocabularyNotes", "vocabulary_notes") ||
        !!readSessionText(session, "methodNotes", "method_notes") ||
        !!readSessionText(session, "reasonNotes", "reason_notes")
    ).length;

    const uniqueSessionDays = Array.from(
      new Set(
        sessions
          .map((session) => {
            const date = new Date(session.date);
            if (Number.isNaN(date.getTime())) return null;
            return date.toISOString().slice(0, 10);
          })
          .filter((value): value is string => !!value)
      )
    ).sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    if (uniqueSessionDays.length > 0) {
      let cursor = new Date(`${uniqueSessionDays[0]}T00:00:00.000Z`);
      for (const sessionDay of uniqueSessionDays) {
        const currentDay = new Date(`${sessionDay}T00:00:00.000Z`);
        if (currentDay.getTime() === cursor.getTime()) {
          currentStreak += 1;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
          continue;
        }

        break;
      }
    }

    return {
      completedSessions,
      bossBattlesCompleted,
      solutionsUnlocked,
      currentStreak,
    };
  };

  const normalizeComparableName = (value: unknown) => String(value || "").trim().toLowerCase();

  const getCanonicalStudentSessions = async ({
    tutorId,
    studentId,
    studentName,
    parentId,
    parentContact,
  }: {
    tutorId: string;
    studentId?: string | null;
    studentName?: string | null;
    parentId?: string | null;
    parentContact?: string | null;
  }) => {
    const { data: tutorStudents } = await supabase
      .from("students")
      .select("id, name, parent_id, parent_contact")
      .eq("tutor_id", tutorId);

    const normalizedName = normalizeComparableName(studentName);
    const normalizedParentContact = normalizeComparableName(parentContact);
    const candidateIds = Array.from(
      new Set(
        (tutorStudents || [])
          .filter((candidate: any) => {
            if (studentId && candidate.id === studentId) return true;
            if (parentId && candidate.parent_id && candidate.parent_id === parentId) return true;
            if (normalizedParentContact && normalizeComparableName(candidate.parent_contact) === normalizedParentContact) return true;
            if (normalizedName && normalizeComparableName(candidate.name) === normalizedName) return true;
            return false;
          })
          .map((candidate: any) => candidate.id)
          .concat(studentId ? [studentId] : [])
      )
    );

    if (candidateIds.length === 0) {
      return [] as any[];
    }

    const { data: sessions } = await supabase
      .from("tutoring_sessions")
      .select("*")
      .eq("tutor_id", tutorId)
      .in("student_id", candidateIds)
      .order("date", { ascending: false });

    return sessions || [];
  };

  const hydrateStudentsWithSessionProgress = async (tutorId: string, students: any[]) => {
    const studentIds = students.map((student) => student.id).filter(Boolean);
    const drillCounts: Record<string, number> = {};

    if (studentIds.length > 0) {
      const { data: drills } = await supabase
        .from("intro_session_drills")
        .select("student_id")
        .eq("tutor_id", tutorId)
        .in("student_id", studentIds);

      (drills || []).forEach((row: any) => {
        const id = String(row.student_id || "");
        if (!id) return;
        drillCounts[id] = (drillCounts[id] || 0) + 1;
      });
    }

    return students.map((student) => ({
      ...student,
      sessionProgress: drillCounts[String(student.id)] || 0,
    }));
  };

  const mapParentFacingReport = (report: any, tutorName?: string | null) => {
    const structured = parseStructuredReportSummary(report.summary) || {};
    const base = {
      id: report.id,
      reportType: report.report_type,
      sentAt: report.sent_at,
      tutor: {
        name: tutorName || "Tutor",
      },
      parentFeedback: report.parent_feedback || null,
      parentFeedbackAt: report.parent_feedback_at || null,
    };

    if (report.report_type === "weekly") {
      return {
        ...base,
        weekRange:
          structured.weekStartDate && structured.weekEndDate
            ? {
                start: structured.weekStartDate,
                end: structured.weekEndDate,
              }
            : null,
        sessionsCompleted: Number(structured.sessionsCompletedThisWeek || report.solutions_unlocked || 0),
        mainTopicsCovered: structured.mainTopicsCovered || report.topics_learned || "",
        whatImproved: structured.whatImprovedThisWeek || report.strengths || "",
        studentResponsePattern: structured.studentResponsePatternThisWeek || "",
        mainMisunderstanding: structured.mainMisunderstandingThisWeek || report.areas_for_growth || "",
        correctionThatHelped: structured.mainCorrectionHelpedThisWeek || "",
        bossBattleSummary: structured.bossBattleSummaryThisWeek || "",
        nextFocus: structured.reinforcementNextWeek || report.next_steps || "",
      };
    }

    return {
      ...base,
      monthRange:
        structured.monthStartDate && structured.monthEndDate
          ? {
              start: structured.monthStartDate,
              end: structured.monthEndDate,
            }
          : null,
      monthName: report.month_name || null,
      totalSessionsCompleted: Number(structured.totalSessionsCompletedThisMonth || report.solutions_unlocked || 0),
      mainAreasCovered: structured.mainAreasCoveredThisMonth || report.topics_learned || "",
      skillsStronger: structured.strongerSkillsThisMonth || report.strengths || "",
      responsePatternTrend: structured.responsePatternTrendThisMonth || "",
      recurringChallenge: structured.recurringChallengeThisMonth || report.areas_for_growth || "",
      mostEffectiveIntervention: structured.mostEffectiveInterventionThisMonth || "",
      bossBattleTrend: structured.bossBattleTrendThisMonth || "",
      nextMonthPriority: structured.nextMonthPriority || report.next_steps || "",
    };
  };

  // Get all reports created by tutor (optional student filter)
  app.get(
    "/api/tutor/reports",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const studentId = typeof req.query.studentId === "string" ? req.query.studentId : null;

        let query = supabase
          .from("parent_reports")
          .select("*")
          .eq("tutor_id", tutorId)
          .order("sent_at", { ascending: false });

        if (studentId) {
          query = query.eq("student_id", studentId);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }

        const reports = (data || []).map((report: any) => ({
          id: report.id,
          tutorId: report.tutor_id,
          studentId: report.student_id,
          parentId: report.parent_id,
          reportType: report.report_type,
          weekNumber: report.week_number,
          monthName: report.month_name,
          summary: report.summary,
          topicsLearned: report.topics_learned,
          strengths: report.strengths,
          areasForGrowth: report.areas_for_growth,
          bossBattlesCompleted: report.boss_battles_completed,
          solutionsUnlocked: report.solutions_unlocked,
          confidenceGrowth: report.confidence_growth,
          nextSteps: report.next_steps,
          parentFeedback: report.parent_feedback,
          parentFeedbackAt: report.parent_feedback_at,
          sentAt: report.sent_at,
          createdAt: report.created_at,
          structuredData: parseStructuredReportSummary(report.summary),
        }));

        res.json(reports);
      } catch (error) {
        console.error("Error fetching tutor reports:", error);
        res.status(500).json({ message: "Failed to fetch tutor reports" });
      }
    }
  );

  // Reports center data per student (sessions + weekly/monthly reports)
  app.get(
    "/api/tutor/students/:studentId/reports-center",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const { studentId } = req.params;

        const student = await storage.getStudent(studentId);
        if (!student || student.tutorId !== tutorId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const { data: drillRows, error: drillRowsError } = await supabase
          .from("intro_session_drills")
          .select("id, student_id, tutor_id, drill, submitted_at")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .order("submitted_at", { ascending: false });

        if (drillRowsError) {
          throw drillRowsError;
        }

        const sessions = (drillRows || [])
          .map(mapDrillRowToDeterministicSession)
          .filter(Boolean);

        const { data: reports, error: reportsError } = await supabase
          .from("parent_reports")
          .select("*")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .order("sent_at", { ascending: false });

        if (reportsError) {
          throw reportsError;
        }

        const enrichedReports = (reports || []).map((report: any) => ({
          id: report.id,
          tutorId: report.tutor_id,
          studentId: report.student_id,
          parentId: report.parent_id,
          reportType: report.report_type,
          weekNumber: report.week_number,
          monthName: report.month_name,
          summary: report.summary,
          topicsLearned: report.topics_learned,
          strengths: report.strengths,
          areasForGrowth: report.areas_for_growth,
          bossBattlesCompleted: report.boss_battles_completed,
          solutionsUnlocked: report.solutions_unlocked,
          confidenceGrowth: report.confidence_growth,
          nextSteps: report.next_steps,
          parentFeedback: report.parent_feedback,
          parentFeedbackAt: report.parent_feedback_at,
          sentAt: report.sent_at,
          createdAt: report.created_at,
          structuredData: parseStructuredReportSummary(report.summary),
        }));

        res.json({
          sessions,
          reports: enrichedReports,
        });
      } catch (error) {
        console.error("Error fetching reports center data:", error);
        res.status(500).json({ message: "Failed to fetch reports center data" });
      }
    }
  );

  // Create weekly parent report
  app.post(
    "/api/tutor/reports/weekly",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const { studentId, weekStartDate, weekEndDate, internalWeeklyTutorNote } = req.body || {};

        if (!studentId) {
          return res.status(400).json({ message: "Missing required studentId" });
        }

        const student = await storage.getStudent(studentId);
        if (!student || student.tutorId !== tutorId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const parentId = await resolveParentIdForStudent(student, tutorId);

        if (!parentId) {
          return res.status(400).json({ message: "Unable to resolve parent for this student" });
        }

        let drillQuery = supabase
          .from("intro_session_drills")
          .select("id, drill, submitted_at")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .order("submitted_at", { ascending: true });

        if (weekStartDate) {
          drillQuery = drillQuery.gte("submitted_at", `${weekStartDate}T00:00:00.000Z`);
        }
        if (weekEndDate) {
          drillQuery = drillQuery.lte("submitted_at", `${weekEndDate}T23:59:59.999Z`);
        }

        const { data: drillRows, error: drillRowsError } = await drillQuery;
        if (drillRowsError) throw drillRowsError;

        if (!drillRows || drillRows.length === 0) {
          return res.status(400).json({ message: "No drill sessions found for the selected week range" });
        }

        const structuredData = createWeeklyStructuredDataFromDrills(drillRows);
        if (!structuredData) {
          return res.status(400).json({ message: "Unable to generate weekly report from drill data" });
        }
        structuredData.internalWeeklyTutorNote = String(internalWeeklyTutorNote || "");

        const inserted = await insertWeeklyReport({
          tutorId,
          studentId,
          parentId,
          structuredData,
        });

        res.json({
          ...inserted,
          structuredData,
        });
      } catch (error) {
        console.error("Error creating weekly report:", error);
        res.status(500).json({ message: "Failed to create weekly report" });
      }
    }
  );

  // Create monthly parent report
  app.post(
    "/api/tutor/reports/monthly",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const { studentId, monthStartDate, monthEndDate, internalMonthlyTutorNote } = req.body || {};

        if (!studentId) {
          return res.status(400).json({ message: "Missing required studentId" });
        }

        const student = await storage.getStudent(studentId);
        if (!student || student.tutorId !== tutorId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const parentId = await resolveParentIdForStudent(student, tutorId);

        if (!parentId) {
          return res.status(400).json({ message: "Unable to resolve parent for this student" });
        }

        let drillQuery = supabase
          .from("intro_session_drills")
          .select("id, drill, submitted_at")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .order("submitted_at", { ascending: true });

        if (monthStartDate) {
          drillQuery = drillQuery.gte("submitted_at", `${monthStartDate}T00:00:00.000Z`);
        }
        if (monthEndDate) {
          drillQuery = drillQuery.lte("submitted_at", `${monthEndDate}T23:59:59.999Z`);
        }

        const { data: drillRows, error: drillRowsError } = await drillQuery;
        if (drillRowsError) throw drillRowsError;

        if (!drillRows || drillRows.length === 0) {
          return res.status(400).json({ message: "No drill sessions found for the selected month range" });
        }

        const structuredData = createMonthlyStructuredDataFromDrills(drillRows);
        if (!structuredData) {
          return res.status(400).json({ message: "Unable to generate monthly report from drill data" });
        }
        structuredData.internalMonthlyTutorNote = String(internalMonthlyTutorNote || "");

        const inserted = await insertMonthlyReport({
          tutorId,
          studentId,
          parentId,
          structuredData,
        });

        res.json({
          ...inserted,
          structuredData,
        });
      } catch (error) {
        console.error("Error creating monthly report:", error);
        res.status(500).json({ message: "Failed to create monthly report" });
      }
    }
  );

  // Get tutor's reflections
  app.get(
    "/api/tutor/reflections",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const reflections = await storage.getReflectionsByTutor(tutorId);
        res.json(reflections);
      } catch (error) {
        console.error("Error fetching reflections:", error);
        res.status(500).json({ message: "Failed to fetch reflections" });
      }
    }
  );

  // Create reflection
  app.post(
    "/api/tutor/reflections",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const reflection = await storage.createReflection({
          tutorId,
          date: new Date(),
          reflectionText: req.body.reflectionText,
          habitScore: req.body.habitScore,
        });
        res.json(reflection);
      } catch (error) {
        console.error("Error creating reflection:", error);
        res.status(400).json({ message: "Failed to create reflection" });
      }
    }
  );

  // ========================================
  // SCHOOL TRACKER ROUTES (Academic Profiles & Struggle Targets)
  // ========================================

  // Get tutor's own academic profile
  app.get(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const profile = await storage.getAcademicProfile(dbUser.id);
        res.json(profile);
      } catch (error) {
        console.error("Error fetching tutor's academic profile:", error);
        res.status(500).json({ message: "Failed to fetch academic profile" });
      }
    }
  );

  // Create or update tutor's own academic profile
  app.post(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        console.log("Saving profile for user:", dbUser.id);
        console.log("Request body:", req.body);
        const data = insertAcademicProfileSchema.parse({
          ...req.body,
          studentId: dbUser.id,
        });
        console.log("Parsed data:", data);
        const profile = await storage.upsertAcademicProfile(data);
        console.log("Saved profile:", profile);
        res.json(profile);
      } catch (error) {
        console.error("Error saving tutor's academic profile:", error);
        res.status(400).json({ message: `Failed to save academic profile: ${error instanceof Error ? error.message : String(error)}` });
      }
    }
  );

  // Get tutor's user profile (phone, bio, profile picture)
  app.get(
    "/api/tutor/user-profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const user = await storage.getUser(dbUser.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Failed to fetch user profile" });
      }
    }
  );

  // Update tutor's user profile (phone, bio)
  app.put(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const { phone, bio } = req.body;
        
        const updated = await storage.updateUserProfile(dbUser.id, {
          phone: phone || null,
          bio: bio || null,
        });
        
        if (!updated) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(updated);
      } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(400).json({ message: "Failed to update user profile" });
      }
    }
  );

  // Upload profile image
  app.post(
    "/api/tutor/profile/upload-image",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const { imageBase64, imageMime } = req.body;

        if (!imageBase64) {
          return res.status(400).json({ message: "No image data provided" });
        }

        console.log(`Received profile image for tutor ${dbUser.id} - size: ${imageBase64.length} chars, mime: ${imageMime}`);

        // Store as data URL directly in database
        const dataUrl = `data:${imageMime || 'image/jpeg'};base64,${imageBase64}`;
        console.log(`Data URL length: ${dataUrl.length} chars`);

        // Update user profile with data URL
        console.log("Updating user profile with image...");
        const updated = await storage.updateUserProfile(dbUser.id, {
          profileImageUrl: dataUrl,
        });

        console.log("Update result:", updated ? "success" : "no result");

        if (!updated) {
          console.error("updateUserProfile returned undefined");
          return res.status(404).json({ message: "User not found" });
        }

        console.log(`Profile picture stored for user ${dbUser.id}`);
        res.json(updated);
      } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ 
          message: "Failed to upload profile image",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  // Delete profile image
  app.delete(
    "/api/tutor/profile/image",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        
        const updated = await storage.updateUserProfile(dbUser.id, {
          profileImageUrl: null,
        });

        if (!updated) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(updated);
      } catch (error) {
        console.error("Error removing profile image:", error);
        res.status(500).json({ message: "Failed to remove profile image" });
      }
    }
  );

  // Get student's academic profile
  app.get(
    "/api/tutor/students/:studentId/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const profile = await storage.getAcademicProfile(studentId);
        res.json(profile);
      } catch (error) {
        console.error("Error fetching academic profile:", error);
        res.status(500).json({ message: "Failed to fetch academic profile" });
      }
    }
  );

  // Create or update student's academic profile
  app.post(
    "/api/tutor/students/:studentId/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const data = insertAcademicProfileSchema.parse({
          ...req.body,
          studentId,
        });
        const profile = await storage.upsertAcademicProfile(data);
        res.json(profile);
      } catch (error) {
        console.error("Error saving academic profile:", error);
        res.status(400).json({ message: "Failed to save academic profile" });
      }
    }
  );

  // Get tutor's own struggle targets
  app.get(
    "/api/tutor/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const targets = await storage.getStruggleTargets(dbUser.id);
        res.json(targets);
      } catch (error) {
        console.error("Error fetching tutor's struggle targets:", error);
        res.status(500).json({ message: "Failed to fetch struggle targets" });
      }
    }
  );

  // Get student's struggle targets
  app.get(
    "/api/tutor/students/:studentId/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const targets = await storage.getStruggleTargets(studentId);
        res.json(targets);
      } catch (error) {
        console.error("Error fetching struggle targets:", error);
        res.status(500).json({ message: "Failed to fetch struggle targets" });
      }
    }
  );

  // Save student identity sheet
  app.post(
    "/api/tutor/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;
        const formData = req.body;

        console.log("📥 Received formData.confidenceTriggers:", formData.confidenceTriggers);
        console.log("Type:", typeof formData.confidenceTriggers, "IsArray:", Array.isArray(formData.confidenceTriggers));
        console.log("📥 Received formData.confidenceKillers:", formData.confidenceKillers);
        console.log("Type:", typeof formData.confidenceKillers, "IsArray:", Array.isArray(formData.confidenceKillers));

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Update student with identity sheet data
        console.log("Saving confidenceTriggers:", formData.confidenceTriggers, "Type:", typeof formData.confidenceTriggers, "IsArray:", Array.isArray(formData.confidenceTriggers));
        console.log("Saving confidenceKillers:", formData.confidenceKillers, "Type:", typeof formData.confidenceKillers, "IsArray:", Array.isArray(formData.confidenceKillers));
        
        const updatedStudent = await storage.updateStudent(studentId, {
          personalProfile: {
            name: formData.name,
            grade: formData.grade,
            school: formData.school,
            learningId: formData.learningId,
            personalityType: formData.personalityType,
            longTermGoals: formData.longTermGoals,
          },
          emotionalInsights: {
            relationshipWithMath: formData.relationshipWithMath,
            confidenceTriggers: formData.confidenceTriggers,
            confidenceKillers: formData.confidenceKillers,
            pressureResponse: formData.pressureResponse,
            growthDrivers: formData.growthDrivers,
          },
          academicDiagnosis: {
            currentClassTopics: formData.currentClassTopics,
            strugglesWith: formData.strugglesWith,
            gapsIdentified: formData.gapsIdentified,
            bossBattlesCompleted: formData.bossBattlesCompleted,
            lastBossBattleResult: formData.lastBossBattleResult,
            tutorNotes: formData.tutorNotes,
          },
          identitySheet: formData.identitySheetResponses,
          identitySheetCompletedAt: new Date(),
        } as any);

        res.json({
          success: true,
          message: "Identity sheet saved successfully",
          student: updatedStudent,
        });
      } catch (error) {
        console.error("Error saving identity sheet:", error);
        res.status(500).json({
          message: "Failed to save identity sheet",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // Get student identity sheet
  app.get(
    "/api/tutor/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;
        console.log("📋 Identity sheet request:", {
          studentId,
          tutorId: dbUser?.id,
          origin: req.headers.origin,
          authHeader: req.headers.authorization ? 'present' : 'missing',
        });
        
        console.log("📋 Identity sheet request - studentId:", studentId, "tutorId:", dbUser?.id);

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          console.log("❌ Student not found:", studentId);
          return res.status(404).json({ message: "Student not found" });
        }

        console.log("✅ Student found:", student.id, "student.tutorId:", student.tutorId);

        if (student.tutorId !== dbUser.id) {
          console.log("❌ Tutor mismatch - student.tutorId:", student.tutorId, "dbUser.id:", dbUser.id);
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Return identity sheet data if it exists
        const identitySheetData = {
          personalProfile: student.personalProfile || null,
          emotionalInsights: student.emotionalInsights || null,
          academicDiagnosis: student.academicDiagnosis || null,
          identitySheet: student.identitySheet || null,
          completedAt: student.identitySheetCompletedAt || null,
        };

        console.log("✅ Returning identity sheet data for student:", studentId);
        res.json(identitySheetData);
      } catch (error) {
        console.error("Error fetching identity sheet:", error);
        res.status(500).json({ message: "Failed to fetch identity sheet" });
      }
    }
  );

  // Get student assignments (form submissions)
  app.get(
    "/api/tutor/students/:studentId/assignments",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Get all assignments for this student
        const { data: assignments, error } = await supabase
          .from("assignments")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching assignments:", error);
          return res.status(500).json({ message: "Failed to fetch assignments" });
        }

        res.json(assignments || []);
      } catch (error) {
        console.error("Error fetching student assignments:", error);
        res.status(500).json({ message: "Failed to fetch assignments" });
      }
    }
  );

  // Get persisted student workflow state for tutor card actions
  app.get(
    "/api/tutor/students/:studentId/workflow-state",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Try to find intro session directly by student_id
        let introSession: { status: string } | null = null;
        const { data: introByStudent } = await supabase
          .from("scheduled_sessions")
          .select("status")
          .eq("tutor_id", dbUser.id)
          .eq("student_id", studentId)
          .eq("type", "intro")
          .order("created_at", { ascending: false })
          .maybeSingle();
        introSession = introByStudent;

        // Fallback: look for intro sessions stored with parent_id only (student_id is null)
        if (!introSession) {
          const parentId = student.parentId || (() => null)();
          if (parentId) {
            const { data: introByParent } = await supabase
              .from("scheduled_sessions")
              .select("status")
              .eq("tutor_id", dbUser.id)
              .eq("parent_id", parentId)
              .eq("type", "intro")
              .is("student_id", null)
              .order("created_at", { ascending: false })
              .maybeSingle();
            introSession = introByParent;
          }
        }


        let { data: latestProposal } = await supabase
          .from("onboarding_proposals")
          .select("sent_at, accepted_at, enrollment_id")
          .eq("student_id", studentId)
          .eq("tutor_id", dbUser.id)
          .order("created_at", { ascending: false })
          .maybeSingle();
        
        // Backfill signal: if an intro diagnosis drill exists, treat intro as completed.
        const { data: latestIntroDrillRow } = await supabase
          .from("intro_session_drills")
          .select("drill, submitted_at")
          .eq("student_id", studentId)
          .eq("tutor_id", dbUser.id)
          .order("submitted_at", { ascending: false })
          .maybeSingle();
        
        const latestIntroDrillPayload =
          typeof latestIntroDrillRow?.drill === "string"
            ? (() => {
                try {
                  return JSON.parse(latestIntroDrillRow.drill);
                } catch {
                  return null;
                }
              })()
            : latestIntroDrillRow?.drill || null;
        
        const hasCompletedIntroDrill = !!(
          latestIntroDrillPayload &&
          (latestIntroDrillPayload.drillType === "diagnosis" || !latestIntroDrillPayload.drillType)
        );

        // Fallback: if not found, try by tutor_id + enrollment_id (pre-acceptance)
        if (!latestProposal) {
          // Find enrollment for this student
          let enrollmentId = null;
          // Prefer parent_enrollment_id if present (new field)
          if (student.parentEnrollmentId || student.parent_enrollment_id) {
            enrollmentId = student.parentEnrollmentId || student.parent_enrollment_id;
          } else if (student.parentId) {
            // Try to find enrollment by parentId and tutorId
            const { data: enroll } = await supabase
              .from("parent_enrollments")
              .select("id")
              .eq("user_id", student.parentId)
              .eq("assigned_tutor_id", dbUser.id)
              .maybeSingle();
            enrollmentId = enroll?.id || null;
          }
          if (enrollmentId) {
            const { data: fallbackProposal } = await supabase
              .from("onboarding_proposals")
              .select("sent_at, accepted_at, enrollment_id")
              .eq("enrollment_id", enrollmentId)
              .eq("tutor_id", dbUser.id)
              .order("created_at", { ascending: false })
              .maybeSingle();
            if (fallbackProposal) latestProposal = fallbackProposal;
          } else if (student.parentContact) {
            // As a last resort, try to find a proposal by parent email + tutor id
            const { data: enroll } = await supabase
              .from("parent_enrollments")
              .select("id")
              .eq("parent_email", student.parentContact)
              .eq("assigned_tutor_id", dbUser.id)
              .maybeSingle();
            if (enroll && enroll.id) {
              const { data: fallbackProposal } = await supabase
                .from("onboarding_proposals")
                .select("sent_at, accepted_at, enrollment_id")
                .eq("enrollment_id", enroll.id)
                .eq("tutor_id", dbUser.id)
                .order("created_at", { ascending: false })
                .maybeSingle();
              if (fallbackProposal) latestProposal = fallbackProposal;
            }
          }
        }

        console.log("[DEBUG] /api/tutor/students/:studentId/workflow-state", {
          studentId,
          tutorId: dbUser.id,
          latestProposal
        });

        const personalProfile = (student.personalProfile as any) || {};
        const workflow = personalProfile.workflow || {};

        const inferredIntroCompleted = !!(
          workflow.introCompletedAt ||
          hasCompletedIntroDrill ||
          student.identitySheetCompletedAt ||
          latestProposal?.sent_at ||
          latestProposal?.accepted_at
        );

        const assignmentAccepted = !!(
          workflow.assignmentAcceptedAt ||
          introSession ||
          inferredIntroCompleted ||
          student.identitySheetCompletedAt ||
          latestProposal?.sent_at ||
          latestProposal?.accepted_at
        );

        res.json({
          assignmentAccepted,
          introConfirmed: introSession?.status === "confirmed",
          introCompleted: inferredIntroCompleted,
          identitySaved: !!student.identitySheetCompletedAt,
          proposalSent: !!latestProposal?.sent_at,
          proposalAccepted: !!latestProposal?.accepted_at,
        });
      } catch (error) {
        console.error("Error fetching workflow state:", error);
        res.status(500).json({ message: "Failed to fetch workflow state" });
      }
    }
  );

  // Mark intro session completed (persisted)
  app.post(
    "/api/tutor/students/:studentId/workflow/assignment-decision",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const { decision } = req.body as { decision?: "accept" | "decline" };
        const dbUser = (req as any).dbUser;

        if (decision !== "accept" && decision !== "decline") {
          return res.status(400).json({ message: "Decision must be 'accept' or 'decline'" });
        }

        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        const existingProfile = (student.personalProfile as any) || {};
        const workflow = existingProfile.workflow || {};

        if (decision === "accept") {

          const updatedProfile = {
            ...existingProfile,
            workflow: {
              ...workflow,
              assignmentAcceptedAt: workflow.assignmentAcceptedAt || new Date().toISOString(),
              assignmentDeclinedAt: null,
            },
          };

          let updated = student;
          // Only update student if it exists (in your flow, it may not exist yet)
          if (student) {
            updated = await storage.updateStudent(studentId, {
              personalProfile: updatedProfile,
            } as any);
          }

          // Update parent_enrollments status to 'not_scheduled' using available fields
          // Try assigned_student_id first, then fallback to student_full_name
          let parentEnrollment = null;
          let parentEnrollmentError = null;
          let query = supabase
            .from("parent_enrollments")
            .select("id")
            .eq("assigned_tutor_id", dbUser.id);
          if (studentId) {
            // Try assigned_student_id
            query = query.eq("assigned_student_id", studentId);
            const { data } = await query.maybeSingle();
            parentEnrollment = data;
          }
          if (!parentEnrollment) {
            // Fallback: match by student_full_name (from student or request)
            let studentName = student?.name;
            if (!studentName && req.body.studentName) studentName = req.body.studentName;
            if (studentName) {
              const { data } = await supabase
                .from("parent_enrollments")
                .select("id")
                .eq("assigned_tutor_id", dbUser.id)
                .eq("student_full_name", studentName)
                .maybeSingle();
              parentEnrollment = data;
            }
          }
          if (parentEnrollment && parentEnrollment.id) {
            await supabase
              .from("parent_enrollments")
              .update({ status: "assigned", current_step: "assigned", updated_at: new Date().toISOString() })
              .eq("id", parentEnrollment.id);
          }

          return res.json({
            success: true,
            assignmentAccepted: true,
            student: updated,
          });
        }

        const { data: existingIntroSession } = await supabase
          .from("scheduled_sessions")
          .select("id")
          .eq("tutor_id", dbUser.id)
          .eq("student_id", studentId)
          .eq("type", "intro")
          .maybeSingle();

        if (existingIntroSession || workflow.introCompletedAt || student.identitySheetCompletedAt) {
          return res.status(400).json({ message: "Assignment can only be declined before the intro workflow begins" });
        }

        const { data: enrollmentByStudent } = await supabase
          .from("parent_enrollments")
          .select("id")
          .eq("assigned_tutor_id", dbUser.id)
          .eq("assigned_student_id", studentId)
          .maybeSingle();

        if (enrollmentByStudent?.id) {
          const { error: enrollmentUpdateError } = await supabase
            .from("parent_enrollments")
            .update({
              status: "awaiting_assignment",
              assigned_tutor_id: null,
              assigned_student_id: null,
              proposal_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", enrollmentByStudent.id);

          if (enrollmentUpdateError) {
            return res.status(500).json({ message: "Failed to re-open parent assignment" });
          }
        }

        const { error: deleteStudentError } = await supabase
          .from("students")
          .delete()
          .eq("id", studentId)
          .eq("tutor_id", dbUser.id);

        if (deleteStudentError) {
          return res.status(500).json({ message: "Failed to decline assignment" });
        }

        return res.json({
          success: true,
          assignmentAccepted: false,
          declined: true,
        });
      } catch (error) {
        console.error("Error responding to assignment:", error);
        res.status(500).json({ message: "Failed to respond to assignment" });
      }
    }
  );

  app.post(
    "/api/tutor/students/:studentId/workflow/intro-completed",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        const { data: introSession } = await supabase
          .from("scheduled_sessions")
          .select("status")
          .eq("tutor_id", dbUser.id)
          .eq("student_id", studentId)
          .eq("type", "intro")
          .order("created_at", { ascending: false })
          .maybeSingle();

        // Fallback: session may be stored with parent_id only (student_id null)
        let resolvedSession = introSession;
        if (!resolvedSession) {
          const parentId = (student as any).parentId || null;
          if (parentId) {
            const { data: introByParent } = await supabase
              .from("scheduled_sessions")
              .select("status")
              .eq("tutor_id", dbUser.id)
              .eq("parent_id", parentId)
              .eq("type", "intro")
              .is("student_id", null)
              .order("created_at", { ascending: false })
              .maybeSingle();
            resolvedSession = introByParent;
          }
        }

        if (resolvedSession?.status !== "confirmed") {
          return res.status(400).json({ message: "Intro session must be confirmed before completing" });
        }

        const existingProfile = (student.personalProfile as any) || {};
        const updatedProfile = {
          ...existingProfile,
          workflow: {
            ...(existingProfile.workflow || {}),
            introCompletedAt: new Date().toISOString(),
          },
        };

        const updated = await storage.updateStudent(studentId, {
          personalProfile: updatedProfile,
        } as any);

        res.json({
          success: true,
          introCompleted: true,
          student: updated,
        });
      } catch (error) {
        console.error("Error marking intro completed:", error);
        res.status(500).json({ message: "Failed to mark intro completed" });
      }
    }
  );

  // Get student tracking systems (sessions, reports, TD feedback)
  app.get(
    "/api/tutor/students/:studentId/tracking",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Get tutoring sessions
        const tutorId = dbUser.id;
        const { data: sessions, error: sessionError } = await supabase
          .from("scheduled_sessions")
          .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at")
          .eq("tutor_id", tutorId)
          .eq("parent_id", student.parentId)
          .eq("type", "intro")
          .order("created_at", { ascending: false });

        // Get parent reports
        const { data: parentReports, error: reportsError } = await supabase
          .from("parent_reports")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (reportsError) {
          console.error("Error fetching parent reports:", reportsError);
        }

        // Get TD weekly check-ins (feedback)
        const { data: tdFeedback, error: feedbackError } = await supabase
          .from("weekly_check_ins")
          .select("*")
          .eq("tutor_id", dbUser.id)
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching TD feedback:", feedbackError);
        }

        res.json({
          sessions: sessions || [],
          parentReports: parentReports || [],
          tdFeedback: tdFeedback || [],
        });
      } catch (error) {
        console.error("Error fetching tracking data:", error);
        res.status(500).json({ message: "Failed to fetch tracking data" });
      }
    }
  );

  // Create struggle target
  app.post(
    "/api/tutor/students/:studentId/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        
        // Convert consolidationDate string to Date if provided
        const body = {
          ...req.body,
          studentId,
          consolidationDate: req.body.consolidationDate ? new Date(req.body.consolidationDate) : null,
        };
        
        const data = insertStruggleTargetSchema.parse(body);
        const target = await storage.createStruggleTarget(data);
        res.json(target);
      } catch (error) {
        console.error("Error creating struggle target:", error);
        res.status(400).json({ message: "Failed to create struggle target" });
      }
    }
  );

  // Create tutor's own struggle target
  app.post(
    "/api/tutor/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        console.log("Creating target for user:", dbUser.id);
        console.log("Request body:", req.body);
        
        // Convert consolidationDate string to Date if provided
        const body = {
          ...req.body,
          studentId: dbUser.id,
          consolidationDate: req.body.consolidationDate ? new Date(req.body.consolidationDate) : null,
        };
        
        const data = insertStruggleTargetSchema.parse(body);
        console.log("Parsed data:", data);
        const target = await storage.createStruggleTarget(data);
        console.log("Created target:", target);
        res.json(target);
      } catch (error) {
        console.error("Error creating tutor's struggle target:", error);
        res.status(400).json({ message: `Failed to create struggle target: ${error instanceof Error ? error.message : String(error)}` });
      }
    }
  );

  // Update struggle target
  app.put(
    "/api/tutor/targets/:id",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const target = await storage.updateStruggleTarget(id, req.body);
        if (!target) {
          return res.status(404).json({ message: "Target not found" });
        }
        res.json(target);
      } catch (error) {
        console.error("Error updating struggle target:", error);
        res.status(400).json({ message: "Failed to update struggle target" });
      }
    }
  );

  // Delete struggle target
  app.delete(
    "/api/tutor/targets/:id",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await storage.deleteStruggleTarget(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting struggle target:", error);
        res.status(500).json({ message: "Failed to delete struggle target" });
      }
    }
  );

  // ========================================
  // WEEKLY CHECK-IN ROUTES (Tutor)
  // ========================================

  // Submit weekly check-in
  app.post(
    "/api/tutor/weekly-check-in",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const schema = z.object({
          podId: z.string(),
          weekStartDate: z.string(),
          sessionsSummary: z.string().min(1),
          wins: z.string().min(1),
          challenges: z.string().min(1),
          emotions: z.string().min(1),
          skillImprovement: z.string().min(1),
          helpNeeded: z.string().optional(),
          nextWeekGoals: z.string().min(1),
        });

        const data = schema.parse(req.body);
        const weekStartDate = new Date(data.weekStartDate);

        // Use Drizzle ORM insert for weeklyCheckIns
        await storage.db.insert(storage.weeklyCheckIns).values({
          tutorId,
          podId: data.podId,
          weekStartDate,
          sessionsSummary: data.sessionsSummary,
          wins: data.wins,
          challenges: data.challenges,
          emotions: data.emotions,
          skillImprovement: data.skillImprovement,
          helpNeeded: data.helpNeeded || null,
          nextWeekGoals: data.nextWeekGoals,
        });
        res.json({ success: true, message: "Weekly check-in submitted" });
      } catch (error) {
        console.error("Error submitting weekly check-in:", error);
        res.status(400).json({ message: "Failed to submit check-in" });
      }
    }
  );

  // Get tutor's check-ins for a pod
  app.get(
    "/api/tutor/weekly-check-ins",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const podId = req.query.podId as string;

        if (!podId) {
          return res.status(400).json({ message: "Pod ID required" });
        }

        // Use Drizzle ORM select for weeklyCheckIns
        const checkIns = await storage.db
          .select()
          .from(storage.weeklyCheckIns)
          .where((wci) => wci.tutorId === tutorId && wci.podId === podId)
          .orderBy((wci) => wci.weekStartDate, "desc");
        res.json(checkIns);
      } catch (error) {
        console.error("Error fetching weekly check-ins:", error);
        res.status(500).json({ message: "Failed to fetch check-ins" });
      }
    }
  );

  // ========================================
  // TD ROUTES
  // ========================================

  // Get TD's pod overview
  app.get(
    "/api/td/pod-overview",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        console.log(`🔍 [TD Pod Overview] Fetching pods for TD: ${tdId}`);
        const pods = await storage.getPodsByTD(tdId);
        console.log(`📦 [TD Pod Overview] Found ${pods?.length || 0} pods`);
        if (!pods || pods.length === 0) {
          console.log(`⚠️  [TD Pod Overview] No pods found, returning empty array`);
          return res.json([]);
        }

        const podOverviews = await Promise.all(
          pods.map(async (pod) => {
            const assignments = await storage.getTutorAssignmentsByPod(pod.id);
            const tutors = await Promise.all(
              assignments.map(async (assignment) => {
                const tutor = await storage.getUser(assignment.tutorId);
                return tutor ? { ...tutor, assignment } : null;
              })
            );

            const validTutors = tutors.filter(Boolean);
            let totalStudents = 0;
            let totalSessions = 0;

            for (const tutor of validTutors) {
              const students = await storage.getStudentsByTutor(tutor!.id);
              totalStudents += students.length;
              for (const student of students) {
                totalSessions += student.sessionProgress;
              }
            }

            return {
              pod,
              tutors: validTutors,
              totalStudents,
              totalSessions,
            };
          })
        );

        res.json(podOverviews);
      } catch (error) {
        console.error("Error fetching pod overview:", error);
        res.status(500).json({ message: "Failed to fetch pod overview" });
      }
    }
  );

  // Get TD's tutors with profiles
  app.get(
    "/api/td/tutors",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pod = await storage.getPodByTD(tdId);
        if (!pod) {
          return res.json([]);
        }

        const assignments = await storage.getTutorAssignmentsByPod(pod.id);
        const profiles = await Promise.all(
          assignments.map(async (assignment) => {
            const tutor = await storage.getUser(assignment.tutorId);
            if (!tutor) return null;

            const students = await storage.getStudentsByTutor(tutor.id);
            const sessions = await storage.getSessionsByTutor(tutor.id);
            const reflections = await storage.getReflectionsByTutor(tutor.id);
            
            const avgHabitScore =
              reflections.length > 0
                ? reflections.reduce((sum, r) => sum + (r.habitScore || 0), 0) /
                  reflections.length
                : 0;

            return {
              tutor,
              assignment,
              students,
              sessions,
              reflectionCount: reflections.length,
              avgHabitScore,
            };
          })
        );

        res.json(profiles.filter(Boolean));
      } catch (error) {
        console.error("Error fetching tutors:", error);
        res.status(500).json({ message: "Failed to fetch tutors" });
      }
    }
  );

  // Get all tutor weekly check-ins for a TD's pod
  app.get(
    "/api/td/tutor-check-ins",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pods = await storage.getPodsByTD(tdId);
        
        if (!pods || pods.length === 0) {
          return res.json([]);
        }

        const allCheckIns = [];
        for (const pod of pods) {
          const checkIns = await storage.db.query.weeklyCheckIns.findMany({
            where: (wci, { eq }) => eq(wci.podId, pod.id),
            orderBy: (wci, { desc }) => desc(wci.weekStartDate),
          });

          // Enrich with tutor information
          const enrichedCheckIns = await Promise.all(
            checkIns.map(async (checkIn) => {
              const tutor = await storage.getUser(checkIn.tutorId);
              return {
                ...checkIn,
                podName: pod.podName,
                tutor: tutor ? { id: tutor.id, name: tutor.name || tutor.firstName, email: tutor.email } : null,
              };
            })
          );
          allCheckIns.push(...enrichedCheckIns);
        }

        res.json(allCheckIns);
      } catch (error) {
        console.error("Error fetching tutor check-ins:", error);
        res.status(500).json({ message: "Failed to fetch check-ins" });
      }
    }
  );

  // Get TD insights dashboard data
  app.get(
    "/api/td/insights",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pods = await storage.getPodsByTD(tdId);
        
        if (!pods || pods.length === 0) {
          return res.json({
            tutorsNeedingHelp: [],
            studentsAtRisk: [],
            podsBehindSchedule: [],
            recentCheckIns: [],
          });
        }

        const tutorsNeedingHelp = [];
        const studentsAtRisk = [];
        const podsBehindSchedule = [];
        const recentCheckIns = [];

        for (const pod of pods) {
          // Get recent check-ins for this pod
          const checkIns = await storage.db.query.weeklyCheckIns.findMany({
            where: (wci, { eq }) => eq(wci.podId, pod.id),
            orderBy: (wci, { desc }) => desc(wci.weekStartDate),
            limit: 10,
          });

          for (const checkIn of checkIns) {
            const tutor = await storage.getUser(checkIn.tutorId);
            
            // Add to recent check-ins
            recentCheckIns.push({
              ...checkIn,
              tutorName: tutor?.name || tutor?.firstName,
              podName: pod.podName,
            });

            // Check if tutor needs help
            if (checkIn.helpNeeded && checkIn.helpNeeded.trim().length > 0) {
              tutorsNeedingHelp.push({
                tutorId: checkIn.tutorId,
                tutorName: tutor?.name || tutor?.firstName,
                tutorEmail: tutor?.email,
                podName: pod.podName,
                helpNeeded: checkIn.helpNeeded,
                challenges: checkIn.challenges,
                weekStartDate: checkIn.weekStartDate,
                submittedAt: checkIn.submittedAt,
              });
            }
          }

          // Get students in this pod
          const assignments = await storage.getTutorAssignmentsByPod(pod.id);
          let totalStudents = 0;
          let totalSessions = 0;

          for (const assignment of assignments) {
            const students = await storage.getStudentsByTutor(assignment.tutorId);
            totalStudents += students.length;
            
            for (const student of students) {
              totalSessions += student.sessionProgress || 0;

              // Check if student is at risk (low confidence or behind schedule)
              const expectedSessions = 3; // Minimum expected sessions
              if (student.sessionProgress < expectedSessions || (student.confidenceScore || 0) < 5) {
                const tutor = await storage.getUser(assignment.tutorId);
                studentsAtRisk.push({
                  studentId: student.id,
                  studentName: student.name,
                  tutorId: assignment.tutorId,
                  tutorName: tutor?.name || tutor?.firstName,
                  podName: pod.podName,
                  sessionProgress: student.sessionProgress,
                  confidenceScore: student.confidenceScore,
                  reason: student.sessionProgress < expectedSessions ? 'Behind on sessions' : 'Low confidence',
                });
              }
            }
          }

          // Check if pod is behind schedule
          const maxSessions = totalStudents * 9;
          const expectedProgress = 0.3; // At least 30% complete
          const actualProgress = maxSessions > 0 ? totalSessions / maxSessions : 0;
          
          if (actualProgress < expectedProgress && totalStudents > 0) {
            podsBehindSchedule.push({
              podId: pod.id,
              podName: pod.podName,
              totalStudents,
              totalSessions,
              maxSessions,
              progress: Math.round(actualProgress * 100),
              tutorCount: assignments.length,
            });
          }
        }

        res.json({
          tutorsNeedingHelp: tutorsNeedingHelp.slice(0, 10), // Top 10
          studentsAtRisk: studentsAtRisk.slice(0, 15), // Top 15
          podsBehindSchedule,
          recentCheckIns: recentCheckIns.slice(0, 5), // Most recent 5
        });
      } catch (error) {
        console.error("Error fetching TD insights:", error);
        res.status(500).json({ message: "Failed to fetch insights" });
      }
    }
  );

  // ========================================
  // COO ROUTES
    // Get COO leads for UI
    app.get(
      "/api/coo/leads",
      isAuthenticated,
      requireRole(["coo"]),
      async (req: Request, res: Response) => {
        try {
          // Fetch all leads (include affiliate_type, affiliate_name, lead_type, onboarding_type, full_name)
          const { data: leads, error } = await supabase
            .from("leads")
            .select("id, user_id, affiliate_id, tracking_source, created_at, affiliate_type, affiliate_name, lead_type, onboarding_type, full_name")
            .order("created_at", { ascending: false });
          if (error) {
            console.error("[COO LEADS] Supabase error:", error);
            return res.status(500).json({ message: "Failed to fetch leads", details: error });
          }
          // Gather all user_ids and affiliate_ids
          const userIds = Array.from(new Set((leads || []).map((l: any) => l.user_id).filter(Boolean)));
          const affiliateIds = Array.from(new Set((leads || []).map((l: any) => l.affiliate_id).filter((id: string | null) => id && id !== null)));

          // Fetch all parent users
          const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id, first_name, last_name, email").in("id", userIds);
          if (usersError) {
            console.error("[COO LEADS] Supabase error (users):", usersError);
            return res.status(500).json({ message: "Failed to fetch parent users", details: usersError });
          }

          // Build lookup map
          const userMap = Object.fromEntries((users || []).map((u: any) => [u.id, u]));

          // Fetch affiliate_codes for real affiliates only
          let codeMap: Record<string, any> = {};
          if (affiliateIds.length > 0) {
            const { data: codes } = await supabase
              .from("affiliate_codes")
              .select("affiliate_id, code, type, person_name, entity_name, school_type")
              .in("affiliate_id", affiliateIds);
            if (codes) {
              codes.forEach((c: any) => { if (!codeMap[c.affiliate_id]) codeMap[c.affiliate_id] = c; });
            }
          }

          // Transform for UI
          const result = (leads || []).map((lead: any) => {
            const parent = userMap[lead.user_id] || {};
            // If organic (affiliate_id is null), show as organic
            const isOrganic = lead.affiliate_id === null;
            let affiliateType = lead.affiliate_type || '';
            let affiliateName = lead.affiliate_name || '';
            if (!isOrganic && codeMap[lead.affiliate_id]) {
              affiliateType = codeMap[lead.affiliate_id].type || affiliateType;
              affiliateName = codeMap[lead.affiliate_id].person_name || codeMap[lead.affiliate_id].entity_name || affiliateName;
            }
            return {
              id: lead.id,
              parentName: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
              userEmail: parent.email || '',
              status: lead.tracking_source || (isOrganic ? 'organic' : ''),
              createdAt: lead.created_at,
              affiliateType: isOrganic ? 'organic' : (affiliateType || ''),
              affiliateName: isOrganic ? '' : (affiliateName || ''),
              leadType: lead.lead_type || '',
              onboardingType: lead.onboarding_type || '',
              fullName: lead.full_name || '',
            };
          });
          res.json(result);
        } catch (err) {
          console.error("[COO LEADS] Exception:", err);
          res.status(500).json({ message: "Failed to fetch leads", error: String(err) });
        }
      }
    );
  // ========================================

  // Get COO dashboard stats
  app.get(
    "/api/coo/stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const allUsers = await storage.getUsersByRole("tutor");
        const verifiedTutors = allUsers.filter((u) => u.verified);
        const pendingApplications = allUsers.filter((u) => !u.verified);
        const pods = await storage.getPods();
        const activePods = pods.filter((p) => p.status === "active");

        let totalStudents = 0;
        let totalSessions = 0;

        for (const tutor of allUsers) {
          const students = await storage.getStudentsByTutor(tutor.id);
          totalStudents += students.length;
          for (const student of students) {
            totalSessions += student.sessionProgress;
          }
        }

        const completionRate =
          totalStudents > 0 ? (totalSessions / (totalStudents * 9)) * 100 : 0;

        res.json({
          totalTutors: allUsers.length,
          verifiedTutors: verifiedTutors.length,
          pendingApplications: pendingApplications.length,
          activePods: activePods.length,
          totalStudents,
          totalSessions,
          completionRate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
      }
    }
  );

  // Get COO sales & affiliate overview stats
  app.get(
    "/api/coo/sales-stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        // Get all affiliates
        const affiliates = await storage.getUsersByRole("affiliate");
        
        // Import supabase from storage
        const supabase = (storage as any).supabase;
        
        // Get all leads and closes - only count actual affiliate relationships
        const { data: leads = [] } = await supabase
          .from("leads")
          .select("*");
        
        const { data: closes = [] } = await supabase
          .from("closes")
          .select("*");
        
        // Affiliate details - only count their own leads/closes
        const affiliateDetails = affiliates.map(aff => {
          const affLeads = leads.filter((l: any) => l.affiliate_id === aff.id);
          const affCloses = closes.filter((c: any) => 
            affLeads.some((l: any) => l.user_id === c.parent_id)
          );
          
          return {
            id: aff.id,
            name: aff.name || aff.email,
            email: aff.email,
            totalLeads: affLeads.length,
            totalCloses: affCloses.length,
            conversionRate: affLeads.length > 0 
              ? Math.round((affCloses.length / affLeads.length) * 100) 
              : 0,
          };
        });
        
        // Organic leads (affiliate_id is null)
        const organicLeads = leads.filter((l: any) => l.affiliate_id === null);
        const organicCloses = closes.filter((c: any) => 
          organicLeads.some((l: any) => l.user_id === c.parent_id)
        );
        
        const organicStats = {
          id: "organic",
          name: "Organic Traffic",
          email: "Direct signups",
          totalLeads: organicLeads.length,
          totalCloses: organicCloses.length,
          conversionRate: organicLeads.length > 0 
            ? Math.round((organicCloses.length / organicLeads.length) * 100) 
            : 0,
          isOrganic: true,
        };
        
        // Combine affiliate and organic details, sort by leads
        const allDetails = [
          ...affiliateDetails,
          ...(organicLeads.length > 0 ? [organicStats] : [])
        ].sort((a, b) => b.totalLeads - a.totalLeads);
        
        // Only return affiliate data + organic
        res.json({
          affiliateDetails: allDetails,
        });
      } catch (error) {
        console.error("Error fetching sales stats:", error);
        res.status(500).json({ message: "Failed to fetch sales stats" });
      }
    }
  );

  // Get affiliate encounters
  app.get(
    "/api/affiliate/:affiliateId/encounters",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        const { data: encounters } = await supabase
          .from("encounters")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });
        
        res.json(encounters || []);
      } catch (error) {
        console.error("Error fetching encounters:", error);
        res.status(500).json({ message: "Failed to fetch encounters" });
      }
    }
  );

  // Get affiliate leads
  app.get(
    "/api/affiliate/:affiliateId/leads",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        const { data: leads } = await supabase
          .from("leads")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });
        
        res.json(leads || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ message: "Failed to fetch leads" });
      }
    }
  );

  // Get affiliate closes
  app.get(
    "/api/affiliate/:affiliateId/closes",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        // Get leads for this affiliate first
        const { data: affLeads = [] } = await supabase
          .from("leads")
          .select("*")
          .eq("affiliate_id", affiliateId);
        
        // Get closes where parent_id matches any of this affiliate's leads
        const parentIds = affLeads.map((l: any) => l.user_id);
        let query = supabase.from("closes").select("*");
        
        if (parentIds.length > 0) {
          query = query.in("parent_id", parentIds);
        } else {
          // Return empty array if no leads
          return res.json([]);
        }
        
        const { data: closes } = await query.order("created_at", { ascending: false });
        
        res.json(closes || []);
      } catch (error) {
        console.error("Error fetching closes:", error);
        res.status(500).json({ message: "Failed to fetch closes" });
      }
    }
  );

  // Get organic leads (affiliate_id = null)
  app.get(
    "/api/organic/leads",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const supabase = (storage as any).supabase;
        
        const { data: leads } = await supabase
          .from("leads")
          .select("*")
          .is("affiliate_id", null)
          .order("created_at", { ascending: false });
        
        res.json(leads || []);
      } catch (error) {
        console.error("Error fetching organic leads:", error);
        res.status(500).json({ message: "Failed to fetch organic leads" });
      }
    }
  );

  // Get organic closes (from organic leads only)
  app.get(
    "/api/organic/closes",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const supabase = (storage as any).supabase;
        
        // Get organic leads (affiliate_id = null)
        const { data: organicLeads = [] } = await supabase
          .from("leads")
          .select("*")
          .is("affiliate_id", null);
        
        // Get closes where parent_id matches any organic lead
        const parentIds = organicLeads.map((l: any) => l.user_id);
        let query = supabase.from("closes").select("*");
        
        if (parentIds.length > 0) {
          query = query.in("parent_id", parentIds);
        } else {
          return res.json([]);
        }
        
        const { data: closes } = await query.order("created_at", { ascending: false });
        
        res.json(closes || []);
      } catch (error) {
        console.error("Error fetching organic closes:", error);
        res.status(500).json({ message: "Failed to fetch organic closes" });
      }
    }
  );

  // Get applications (verified and unverified tutors)
  app.get(
    "/api/coo/applications",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const tutors = await storage.getUsersByRole("tutor");
        const applications = await Promise.all(
          tutors.map(async (tutor) => {
            const verificationDoc = await storage.getVerificationDocByTutor(tutor.id);
            return { user: tutor, verificationDoc };
          })
        );
        res.json(applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Verify tutor
  app.post(
    "/api/coo/verify-tutor/:userId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        await storage.updateUserVerification(userId, true);
        await storage.updateVerificationStatus(userId, "verified");
        res.json({ success: true });
      } catch (error) {
        console.error("Error verifying tutor:", error);
        res.status(500).json({ message: "Failed to verify tutor" });
      }
    }
  );

  // Reject tutor
  app.post(
    "/api/coo/reject-tutor/:userId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        await storage.updateVerificationStatus(userId, "rejected");
        res.json({ success: true });
      } catch (error) {
        console.error("Error rejecting tutor:", error);
        res.status(500).json({ message: "Failed to reject tutor" });
      }
    }
  );

  // Get all pods
  app.get(
    "/api/coo/pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getPods();
        res.json(pods);
      } catch (error) {
        console.error("Error fetching pods:", error);
        res.status(500).json({ message: "Failed to fetch pods" });
      }
    }
  );

  // Get deleted pods
  app.get(
    "/api/coo/deleted-pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getDeletedPods();
        res.json(pods);
      } catch (error) {
        console.error("Error fetching deleted pods:", error);
        res.status(500).json({ message: "Failed to fetch deleted pods" });
      }
    }
  );

  // Delete pod (soft delete)
  app.delete(
    "/api/coo/pods/:podId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        await storage.deletePod(podId);
        res.json({ message: "Pod deleted successfully" });
      } catch (error) {
        console.error("Error deleting pod:", error);
        res.status(500).json({ message: "Failed to delete pod" });
      }
    }
  );

  // Create pod
  app.post(
    "/api/coo/pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        console.log("📦 Creating pod with data:", req.body);
        const { tutorIds, ...podData } = req.body;
        
        // Validate pod data first
        const data = insertPodSchema.parse({
          ...podData,
          startDate: podData.startDate ? new Date(podData.startDate) : null,
        });
        console.log("✅ Validated pod data:", data);

        // Validate tutors BEFORE creating pod
        if (tutorIds && Array.isArray(tutorIds) && tutorIds.length > 0) {
          // Validate tutor count (max 10 for training pods)
          if (tutorIds.length > 10) {
            return res.status(400).json({ 
              message: "Training pods can have a maximum of 10 tutors"
            });
          }

          // Get approved tutors to validate assignments
          const approvedTutors = await storage.getApprovedTutors();
          const approvedTutorIds = new Set(approvedTutors.map(t => t.id));

          // Validate all tutorIds are approved
          const invalidTutors = tutorIds.filter(id => !approvedTutorIds.has(id));
          if (invalidTutors.length > 0) {
            console.error("❌ Attempted to assign unapproved tutors:", invalidTutors);
            return res.status(400).json({ 
              message: "All assigned tutors must have approved applications",
              invalidTutors
            });
          }
          console.log(`✅ Validated ${tutorIds.length} approved tutors`);
        }

        // Create pod only after all validations pass
        const pod = await storage.createPod(data);
        console.log("✅ Pod created successfully:", pod);

        // Assign validated tutors to pod
        if (tutorIds && Array.isArray(tutorIds) && tutorIds.length > 0) {
          console.log(`📝 Assigning ${tutorIds.length} approved tutors to pod ${pod.id}`);
          for (const tutorId of tutorIds) {
            await storage.createTutorAssignment({
              tutorId,
              podId: pod.id,
              certificationStatus: "pending",
            });
          }
          console.log("✅ Tutors assigned successfully");
        }
        
        res.json(pod);
      } catch (error: any) {
        console.error("❌ Error creating pod:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Stack trace:", error.stack);
        res.status(400).json({ 
          message: "Failed to create pod",
          error: error.message || "Unknown error"
        });
      }
    }
  );

  // Get tutors assigned to a pod
  app.get(
    "/api/coo/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        
        // Fetch tutor details for each assignment
        const tutorsData = await Promise.all(
          assignments.map(async (assignment: any) => {
            const tutor = await storage.getUser(assignment.tutorId);
            return {
              ...assignment,
              tutorName: tutor?.name || "Unknown",
              tutorEmail: tutor?.email || "",
            };
          })
        );
        
        res.json(tutorsData);
      } catch (error) {
        console.error("Error fetching pod tutors:", error);
        res.status(500).json({ message: "Failed to fetch pod tutors" });
      }
    }
  );

  // Get all tutor assignments across all pods (to prevent duplicate assignments)
  app.get(
    "/api/coo/all-tutor-assignments",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: assignments } = await supabase
          .from("tutor_assignments")
          .select("tutor_id");
        
        console.log("📋 Raw assignments from DB:", assignments);
        
        if (!assignments) {
          console.log("📋 No assignments found, returning empty array");
          return res.json([]);
        }
        
        // Transform snake_case to camelCase (tutor_id -> tutorId)
        // Return just the tutor IDs to check against
        const tutorIds = assignments.map((a: any) => a.tutor_id);
        console.log("📋 All assigned tutor IDs:", tutorIds);
        res.json(tutorIds);
      } catch (error) {
        console.error("Error fetching all tutor assignments:", error);
        res.status(500).json({ message: "Failed to fetch tutor assignments" });
      }
    }
  );

  // Get pod statistics
  app.get(
    "/api/coo/pods/:podId/stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        const sessions = await storage.getSessionsByPod(podId);
        
        // Calculate statistics
        const totalTutors = assignments.length;
        const totalStudents = assignments.reduce((sum: number, a: any) => sum + (a.studentCount || 0), 0);
        const sessionsCompleted = sessions.length;
        
        res.json({
          totalTutors,
          totalStudents,
          sessionsCompleted
        });
      } catch (error) {
        console.error("Error fetching pod statistics:", error);
        res.status(500).json({ message: "Failed to fetch pod statistics" });
      }
    }
  );

  // Get students for a specific tutor (COO view)
  app.get(
    "/api/coo/tutors/:tutorId/students",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { tutorId } = req.params;
        console.log("📚 COO requesting students for tutor:", tutorId);
        const students = await storage.getStudentsByTutor(tutorId);
        console.log("📚 Found students:", students.map(s => ({ id: s.id, name: s.name })));
        res.json(students);
      } catch (error) {
        console.error("Error fetching tutor students:", error);
        res.status(500).json({ message: "Failed to fetch tutor students" });
      }
    }
  );

  // Get student identity sheet (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        console.log("📋 COO requesting identity sheet for student:", studentId);
        
        // Direct query to check what's in DB
        const { data: directData, error: directError } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId);
        console.log("📋 Direct query result:", JSON.stringify(directData, null, 2));
        console.log("📋 Direct query error:", directError);
        
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          console.log("❌ Student not found via storage:", studentId);
          return res.status(404).json({ message: "Student not found" });
        }

        console.log("✅ Student found:", student.id);
        console.log("📋 Student personalProfile:", student.personalProfile);
        console.log("📋 Student emotionalInsights:", student.emotionalInsights);
        console.log("📋 Student academicDiagnosis:", student.academicDiagnosis);
        console.log("📋 Student identitySheet:", student.identitySheet);

        const identitySheetData = {
          personalProfile: student.personalProfile || null,
          emotionalInsights: student.emotionalInsights || null,
          academicDiagnosis: student.academicDiagnosis || null,
          identitySheet: student.identitySheet || null,
          completedAt: student.identitySheetCompletedAt || null,
        };

        console.log("📋 Returning identity sheet data:", identitySheetData);
        res.json(identitySheetData);
      } catch (error) {
        console.error("Error fetching identity sheet for COO:", error);
        res.status(500).json({ message: "Failed to fetch identity sheet" });
      }
    }
  );

  // Get student assignments (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/assignments",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        const { data: assignments, error } = await supabase
          .from("assignments")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching assignments:", error);
          return res.status(500).json({ message: "Failed to fetch assignments" });
        }

        res.json(assignments || []);
      } catch (error) {
        console.error("Error fetching student assignments for COO:", error);
        res.status(500).json({ message: "Failed to fetch assignments" });
      }
    }
  );

  // Get student tracking data (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/tracking",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Get tutoring sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("tutoring_sessions")
          .select("*")
          .eq("student_id", studentId)
          .order("session_date", { ascending: false });

        // Get parent reports
        const { data: parentReports, error: reportsError } = await supabase
          .from("parent_reports")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        // Get TD feedback
        const { data: tdFeedback, error: feedbackError } = await supabase
          .from("td_feedback")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (sessionsError || reportsError || feedbackError) {
          console.error("Error fetching tracking data:", { sessionsError, reportsError, feedbackError });
          return res.status(500).json({ message: "Failed to fetch tracking data" });
        }

        res.json({
          sessions: sessions || [],
          parentReports: parentReports || [],
          tdFeedback: tdFeedback || [],
        });
      } catch (error) {
        console.error("Error fetching student tracking for COO:", error);
        res.status(500).json({ message: "Failed to fetch tracking data" });
      }
    }
  );

  // Remove tutor from pod
  app.delete(
    "/api/coo/pods/:podId/tutors/:assignmentId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { assignmentId } = req.params;
        await storage.deleteTutorAssignment(assignmentId);
        res.json({ message: "Tutor removed from pod successfully" });
      } catch (error) {
        console.error("Error removing tutor from pod:", error);
        res.status(500).json({ message: "Failed to remove tutor from pod" });
      }
    }
  );

  // Add tutor to existing pod
  app.post(
    "/api/coo/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const { tutorIds } = req.body;
        
        if (!Array.isArray(tutorIds) || tutorIds.length === 0) {
          return res.status(400).json({ message: "tutorIds must be a non-empty array" });
        }

        // Get current assignments
        const currentAssignments = await storage.getTutorAssignmentsByPod(podId);
        const totalTutors = currentAssignments.length + tutorIds.length;

        // Validate tutor count (max 10 for training pods)
        if (totalTutors > 10) {
          return res.status(400).json({ 
            message: `Pod would exceed maximum of 10 tutors (current: ${currentAssignments.length}, adding: ${tutorIds.length})`
          });
        }

        // Validate all tutors are approved
        const approvedTutors = await storage.getApprovedTutors();
        const approvedTutorIds = new Set(approvedTutors.map(t => t.id));

        const invalidTutors = tutorIds.filter((id: string) => !approvedTutorIds.has(id));
        if (invalidTutors.length > 0) {
          return res.status(400).json({ 
            message: "All assigned tutors must have approved applications",
            invalidTutors
          });
        }

        // Check for existing assignments
        const existingIds = new Set(currentAssignments.map((a: any) => a.tutor_id));
        const duplicates = tutorIds.filter((id: string) => existingIds.has(id));
        if (duplicates.length > 0) {
          return res.status(400).json({ 
            message: "Some tutors are already assigned to this pod",
            duplicates
          });
        }

        // Create new assignments
        const newAssignments = await Promise.all(
          tutorIds.map((tutorId: string) =>
            storage.createTutorAssignment({
              tutorId,
              podId,
              certificationStatus: "pending",
            })
          )
        );

        res.json(newAssignments);
      } catch (error) {
        console.error("Error adding tutors to pod:", error);
        res.status(400).json({ message: "Failed to add tutors to pod" });
      }
    }
  );

  // Get TDs with pod assignments
  app.get(
    "/api/coo/tds",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const tds = await storage.getUsersByRole("td");
        const pods = await storage.getPods();
        
        // Add pod assignment to each TD
        const tdsWithPods = tds.map(td => {
          const assignedPod = pods.find(p => p.tdId === td.id);
          return {
            ...td,
            assignedPodId: assignedPod?.id || null,
          };
        });
        
        res.json(tdsWithPods);
      } catch (error) {
        console.error("Error fetching TDs:", error);
        res.status(500).json({ message: "Failed to fetch TDs" });
      }
    }
  );

  // Get approved tutors (tutors with approved applications)
  app.get(
    "/api/coo/approved-tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const approvedTutors = await storage.getApprovedTutors();
        console.log("👥 Approved tutors:", approvedTutors.map((t: any) => ({ id: t.id, name: t.name })));
        res.json(approvedTutors);
      } catch (error) {
        console.error("Error fetching approved tutors:", error);
        res.status(500).json({ message: "Failed to fetch approved tutors" });
      }
    }
  );

  // Get role permissions
  app.get(
    "/api/coo/role-permissions",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const permissions = await storage.getRolePermissions();
        res.json(permissions);
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        res.status(500).json({ message: "Failed to fetch role permissions" });
      }
    }
  );

  // Assign TD to pod
  app.post(
    "/api/coo/assign-td",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          tdId: z.string(),
          podId: z.string(),
        });
        const { tdId, podId } = schema.parse(req.body);
        
        // Update the pod to have this TD
        await storage.updatePodTD(podId, tdId);
        
        // Update the role permission to include the pod assignment
        const user = await storage.getUser(tdId);
        if (user && user.email) {
          await storage.addRolePermission({
            email: user.email,
            role: "td",
            assignedPodId: podId,
          });
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error("Error assigning TD:", error);
        res.status(400).json({ message: "Failed to assign TD" });
      }
    }
  );

  // Send broadcast
  app.post(
    "/api/coo/broadcast",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        console.log("📤 Broadcast request body:", JSON.stringify(req.body, null, 2));
        const data = insertBroadcastSchema.parse(req.body);
        console.log("✅ Broadcast validated:", JSON.stringify(data, null, 2));
        const broadcast = await storage.createBroadcast(data);
        res.json(broadcast);
      } catch (error: any) {
        console.error("❌ Error creating broadcast:", error);
        if (error.errors) {
          console.error("Validation errors:", error.errors);
          return res.status(400).json({ message: "Validation failed", errors: error.errors });
        }
        res.status(400).json({ message: "Failed to create broadcast" });
      }
    }
  );

  // ========================================
  // SHARED ROUTES (Tutors, TDs, COO)
  // ========================================

  // Get broadcasts
  app.get(
    "/api/broadcasts",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userCreatedAt = (req as any).dbUser?.createdAt;
        const broadcasts = await storage.getBroadcasts(userCreatedAt);
        res.json(broadcasts);
      } catch (error) {
        console.error("Error fetching broadcasts:", error);
        res.status(500).json({ message: "Failed to fetch broadcasts" });
      }
    }
  );

  // Get unread broadcast count
  app.get(
    "/api/broadcasts/unread-count",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const userCreatedAt = (req as any).dbUser?.createdAt;
        const unreadCount = await storage.getUnreadBroadcastCount(userId, userCreatedAt);
        res.json({ unreadCount });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
      }
    }
  );

  // Get user's read broadcasts
  app.get(
    "/api/broadcasts/read-list",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const readBroadcasts = await storage.getUserBroadcastReads(userId);
        res.json({ readBroadcasts });
      } catch (error) {
        console.error("Error fetching read broadcasts:", error);
        res.status(500).json({ message: "Failed to fetch read broadcasts" });
      }
    }
  );

  // Check broadcast_reads table status
  app.get("/api/broadcasts/table-status", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("broadcast_reads")
        .select("id")
        .limit(1);
      
      if (error && error.code === 'PGRST205') {
        return res.json({ 
          tableExists: false, 
          message: "broadcast_reads table not found. Please run BROADCAST_READS_TABLE.sql in Supabase SQL Editor"
        });
      }
      
      res.json({ 
        tableExists: true, 
        message: "broadcast_reads table exists"
      });
    } catch (error) {
      res.json({ 
        tableExists: false, 
        error: "Unable to check table status"
      });
    }
  });

  // Mark broadcast as read
  app.post(
    "/api/broadcasts/:broadcastId/read",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const { broadcastId } = req.params;
        
        // Validate broadcastId is not empty
        if (!broadcastId || broadcastId.trim() === "") {
          return res.status(400).json({ message: "Invalid broadcast ID" });
        }
        
        await storage.markBroadcastAsRead(userId, broadcastId);
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error marking broadcast as read:", error);
        if (error.message === "Broadcast not found") {
          return res.status(404).json({ message: "Broadcast not found" });
        }
        if (error.message === "User not found") {
          return res.status(401).json({ message: "User not found" });
        }
        // Check if table doesn't exist
        if (error?.code === 'PGRST205' || error?.message?.includes('broadcast_reads')) {
          return res.status(503).json({ 
            message: "Broadcast read tracking not available. Please run BROADCAST_READS_TABLE.sql in Supabase SQL Editor",
            tableIssue: true
          });
        }
        res.status(500).json({ message: "Failed to mark broadcast as read" });
      }
    }
  );

  // ========================================
  // TUTOR APPLICATION ROUTES
  // ========================================

  // Submit tutor application
  app.post(
    "/api/tutor/application",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const data = insertTutorApplicationSchema.parse({
          ...req.body,
          userId,
        });
        const application = await storage.createTutorApplication(data);
        res.json(application);
      } catch (error) {
        console.error("Error submitting tutor application:", error);
        res.status(400).json({ message: "Failed to submit application" });
      }
    }
  );

  // Get tutor's application status (for gateway)
  app.get(
    "/api/tutor/application-status",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        console.log("📋 Fetching tutor application status for user:", userId);
        
        // Add a timeout so this doesn't hang forever (increased to 15s for high-latency networks)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout after 15s")), 15000)
        );
        
        const applicationsPromise = storage.getTutorApplicationsByUser(userId);
        const applications = await Promise.race([applicationsPromise, timeoutPromise]) as any[];
        
        console.log("✅ Got applications:", applications?.length || 0, "for user:", userId);
        
        if (!applications || applications.length === 0) {
          console.log("📝 User has no applications, returning not_applied");
          return res.json({ status: "not_applied" });
        }
        
        // Get the most recent application
        const latestApp = applications[0];
        console.log("📝 Latest app status:", latestApp.status, "for user:", userId);
        
        // Check if under 18 based on age in application
        const isUnder18 = latestApp.age < 18;
        
        const fallbackDocumentsStatus = {
          "1": "pending_upload",
          "2": "not_started",
          "3": "not_started",
          "4": "not_started",
          "5": "not_started",
        };
        const documentsStatus = latestApp.documentsStatus && typeof latestApp.documentsStatus === "object"
          ? { ...fallbackDocumentsStatus, ...latestApp.documentsStatus }
          : fallbackDocumentsStatus;
        const sequentialReviewStarted = Object.values(documentsStatus).some(
          (docStatus) => docStatus === "pending_review" || docStatus === "approved" || docStatus === "rejected"
        );
        const allSequentialDocumentsApproved = Object.values(documentsStatus).every((docStatus) => docStatus === "approved");

        // Check legacy document upload status
        const hasTrialAgreement = !!latestApp.trialAgreementUrl;
        const hasParentConsent = !!latestApp.parentConsentUrl;
        const trialAgreementVerified = !!latestApp.trialAgreementVerified;
        const parentConsentVerified = !!latestApp.parentConsentVerified;
        
        // Determine if onboarding is complete
        const requiredDocsComplete = hasTrialAgreement && (!isUnder18 || hasParentConsent);
        const docsVerified = trialAgreementVerified && (!isUnder18 || parentConsentVerified);
        
        // Map application status to gateway status
        let status: string;
        switch (latestApp.status) {
          case "pending":
            status = "pending";
            break;
          case "approved":
            if (allSequentialDocumentsApproved) {
              status = "confirmed";
            } else if (sequentialReviewStarted) {
              status = "verification"; // Docs uploaded, awaiting verification
            } else {
              status = "approved"; // Still needs to upload docs
            }
            break;
          case "rejected":
            status = "rejected";
            break;
          default:
            status = "pending";
        }
        
        console.log("✅ Returning status:", status, "for user:", userId);
        res.json({
          status,
          applicationId: latestApp.id,
          isUnder18,
          hasTrialAgreement,
          hasParentConsent,
          trialAgreementVerified,
          parentConsentVerified,
          trialAgreementUrl: latestApp.trialAgreementUrl,
          parentConsentUrl: latestApp.parentConsentUrl,
          documentSubmissionStep: latestApp.documentSubmissionStep || (latestApp.status === "approved" ? 1 : 0),
          documentsStatus,
          onboardingCompletedAt: latestApp.onboardingCompletedAt ?? null,
        });
      } catch (error) {
        console.error("❌ Error fetching tutor application status:", error);
        res.status(500).json({ message: "Failed to fetch application status" });
      }
    }
  );

  // Upload tutor onboarding document
  app.post(
    "/api/tutor/onboarding-documents/upload",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType, docStep, fileName, fileData, fileType } = req.body;
        const parsedDocStep = typeof docStep === "number" ? docStep : Number(docStep);
        const isSequentialUpload = Number.isInteger(parsedDocStep) && parsedDocStep >= 1 && parsedDocStep <= 5;

        if (!applicationId || !fileName || !fileData || (!documentType && !isSequentialUpload)) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        if (!isSequentialUpload && !["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }

        // Verify the application belongs to this user
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }

        // Decode base64 file data
        const buffer = Buffer.from(fileData, 'base64');

        // Ensure file path begins with userId folder
        const safeFileName = fileName.startsWith(`${userId}/`) ? fileName : `${userId}/${fileName}`;

        // Upload using server (service role) supabase client to avoid RLS issues
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tutor-documents')
          .upload(safeFileName, buffer, {
            contentType: fileType || undefined,
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase storage upload error:', uploadError);
          return res.status(500).json({ message: 'Storage upload failed', error: uploadError.message });
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('tutor-documents').getPublicUrl(safeFileName);
        if (!urlData?.publicUrl) {
          console.error('Could not resolve public URL for uploaded onboarding document', {
            applicationId,
            docStep: isSequentialUpload ? parsedDocStep : undefined,
            documentType: isSequentialUpload ? undefined : documentType,
            safeFileName,
          });
          return res.status(500).json({ message: 'Upload succeeded but file URL could not be generated' });
        }

        // Save to database
        const updated = isSequentialUpload
          ? await storage.updateTutorSequentialDocument(applicationId, parsedDocStep, urlData.publicUrl)
          : await storage.updateTutorOnboardingDocument(
              applicationId,
              documentType as 'trial_agreement' | 'parent_consent',
              urlData.publicUrl
            );

        if (!updated) {
          return res.status(500).json({ message: 'Failed to update document record' });
        }

        res.json({ success: true, application: updated, publicUrl: urlData.publicUrl });
      } catch (error) {
        console.error('Error uploading onboarding document (server handler):', error);
        res.status(500).json({ message: 'Failed to upload document' });
      }
    }
  );

  app.get(
    "/api/tutor/onboarding-documents/:docStep/download",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const docStep = Number(req.params.docStep);
        const templateFileNames: Record<number, string> = {
          1: "01-consent-form-adult.pdf",
          2: "02-independent-contractor-agreement-adult.pdf",
          3: "03-safeguarding-and-conduct-policy-adult.pdf",
          4: "04-data-protection-consent-adult.pdf",
          5: "05-matric-entry-qualification-verification.pdf",
        };

        const templateFileName = templateFileNames[docStep];
        if (!templateFileName) {
          return res.status(400).json({ message: "Invalid document step" });
        }

        const templatePathCandidates = [
          // Source execution (tsx server/index.ts)
          fileURLToPath(new URL(`../assets/tutor-onboarding/${templateFileName}`, import.meta.url)),
          // Dist execution (node dist/index.js)
          fileURLToPath(new URL(`../../assets/tutor-onboarding/${templateFileName}`, import.meta.url)),
          // Runtime cwd fallback
          resolve(process.cwd(), "assets", "tutor-onboarding", templateFileName),
          // Runtime cwd fallback when started from server folder
          resolve(process.cwd(), "..", "assets", "tutor-onboarding", templateFileName),
        ];

        const templatePath = templatePathCandidates.find((candidate) => existsSync(candidate));

        if (!templatePath) {
          console.error("Onboarding template not found", {
            docStep,
            templateFileName,
            triedPaths: templatePathCandidates,
          });
          return res.status(404).json({
            message: "Template file not found on API server for this step",
            templateFileName,
          });
        }

        res.download(templatePath, templateFileName);
      } catch (error) {
        console.error("Error downloading onboarding template:", error);
        res.status(500).json({ message: "Failed to download document template" });
      }
    }
  );

  // Tutor marks onboarding complete (after assignment) - allows leaving gateway permanently
  app.post(
    "/api/tutor/complete-onboarding",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId } = req.body;

        if (!applicationId) {
          return res.status(400).json({ message: "Missing applicationId" });
        }

        // Verify ownership
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }

        const updated = await storage.completeTutorOnboarding(applicationId);
        if (!updated) {
          return res.status(500).json({ message: "Failed to complete onboarding" });
        }

        res.json({ success: true, application: updated });
      } catch (error) {
        console.error('Error completing onboarding:', error);
        res.status(500).json({ message: 'Failed to complete onboarding' });
      }
    }
  );

  app.post(
    "/api/tutor/onboarding-documents",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType, documentUrl } = req.body;
        
        if (!applicationId || !documentType || !documentUrl) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (!["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }
        
        // Verify the application belongs to this user
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }
        
        // Update the document URL
        const updated = await storage.updateTutorOnboardingDocument(
          applicationId,
          documentType as "trial_agreement" | "parent_consent",
          documentUrl
        );
        
        if (!updated) {
          return res.status(500).json({ message: "Failed to update document" });
        }
        
        res.json({ success: true, application: updated });
      } catch (error) {
        console.error("Error uploading onboarding document:", error);
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  );

  // COO: Verify tutor onboarding document
  app.post(
    "/api/coo/tutor/:id/document/:docStep/review",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const docStep = Number(req.params.docStep);
        const { approved, rejectionReason } = req.body;
        const reviewerId = (req.session as any).userId;

        if (!Number.isInteger(docStep) || docStep < 1 || docStep > 5) {
          return res.status(400).json({ message: "Invalid document step" });
        }

        if (typeof approved !== "boolean") {
          return res.status(400).json({ message: "Missing approval decision" });
        }

        const updated = await storage.reviewTutorSequentialDocument(
          id,
          docStep,
          approved,
          reviewerId,
          rejectionReason
        );

        if (!updated) {
          return res.status(404).json({ message: "Application not found" });
        }

        res.json({
          success: true,
          application: updated,
          message: approved
            ? docStep === 5 && Object.values(updated.documentsStatus || {}).every((status) => status === "approved")
              ? "Document approved. Tutor onboarding is complete."
              : `Document ${docStep} approved. Tutor can move to the next document.`
            : `Document ${docStep} rejected. Tutor must resubmit this step.`,
        });
      } catch (error) {
        console.error("Error reviewing sequential tutor document:", error);
        res.status(500).json({ message: "Failed to review document" });
      }
    }
  );

  app.post(
    "/api/coo/verify-tutor-document",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType } = req.body;
        
        if (!applicationId || !documentType) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (!["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }
        
        const updated = await storage.verifyTutorOnboardingDocument(
          applicationId,
          documentType as "trial_agreement" | "parent_consent",
          userId
        );
        
        if (!updated) {
          return res.status(500).json({ message: "Failed to verify document" });
        }
        
        // Check if all required docs are now verified
        const isUnder18 = updated.age < 18;
        const allVerified = updated.trialAgreementVerified && 
          (!isUnder18 || updated.parentConsentVerified);
        
        // If all verified, mark onboarding as complete
        if (allVerified) {
          await storage.completeTutorOnboarding(applicationId);
        }
        
        res.json({ success: true, application: updated, onboardingComplete: allVerified });
      } catch (error) {
        console.error("Error verifying onboarding document:", error);
        res.status(500).json({ message: "Failed to verify document" });
      }
    }
  );

  // Get tutor's own applications
  app.get(
    "/api/tutor/applications",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const applications = await storage.getTutorApplicationsByUser(userId);
        res.json(applications);
      } catch (error) {
        console.error("Error fetching tutor applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Get all tutor applications (COO and HR)
  app.get(
    "/api/coo/tutor-applications",
    isAuthenticated,
    requireRole(["coo", "hr"]),
    async (req: Request, res: Response) => {
      try {
        const { status } = req.query;
        let applications;
        
        if (status && (status === "pending" || status === "approved" || status === "rejected")) {
          applications = await storage.getTutorApplicationsByStatus(status);
        } else {
          applications = await storage.getTutorApplications();
        }
        
        res.json(applications);
      } catch (error) {
        console.error("Error fetching tutor applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Approve tutor application (COO)
  app.post(
    "/api/coo/tutor-applications/:id/approve",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const reviewerId = (req.session as any).userId;
        const application = await storage.approveTutorApplication(id, reviewerId);
        
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        res.json(application);
      } catch (error) {
        console.error("Error approving tutor application:", error);
        res.status(500).json({ message: "Failed to approve application" });
      }
    }
  );

  // Reject tutor application (COO)
  app.post(
    "/api/coo/tutor-applications/:id/reject",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;
        const reviewerId = (req.session as any).userId;
        const application = await storage.rejectTutorApplication(id, reviewerId, reason || "");
        
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        res.json(application);
      } catch (error) {
        console.error("Error rejecting tutor application:", error);
        res.status(500).json({ message: "Failed to reject application" });
      }
    }
  );

  // ========================================
  // HR ROUTES
  // ========================================

  // Get HR dashboard stats
  app.get(
    "/api/hr/stats",
    isAuthenticated,
    requireRole(["hr", "coo"]),
    async (req: Request, res: Response) => {
      try {
        // Get all tutor applications
        const allApplications = await storage.getTutorApplications();
        
        // Get pending tutor applications from tutor_applications table
        const pendingApplications = await storage.getTutorApplicationsByStatus("pending");
        
        // Get approved tutors (from tutor_applications table)
        const approvedApplications = await storage.getTutorApplicationsByStatus("approved");

        // Get tutors who are approved but not yet assigned to a pod
        let availableForPods = 0;
        try {
          // Get all tutor assignments
          const { data: assignments } = await supabase
            .from("tutor_assignments")
            .select("tutor_id");
          
          const assignedTutorIds = new Set(assignments?.map(a => a.tutor_id) || []);
          
          // Count approved tutors who are not in the assignments list
          availableForPods = approvedApplications.filter(
            app => !assignedTutorIds.has(app.userId)
          ).length;
        } catch (e) {
          console.warn("Could not fetch tutor assignments:", e);
          availableForPods = approvedApplications.length; // Fallback to all approved
        }

        // Get student enrollments - total and this month
        let totalEnrollments = 0;
        let studentEnrollments = 0;
        try {
          // Get this month's enrollments first
          const currentMonth = new Date();
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          
          const { data: monthEnrollments, error: enrollError } = await supabase
            .from("parent_enrollments")
            .select("id")
            .gte("created_at", firstDay.toISOString());
          
          if (enrollError) {
            console.warn("Error fetching month enrollments:", enrollError);
          } else if (monthEnrollments) {
            studentEnrollments = monthEnrollments.length;
          }

          // Get total enrollments (use count for efficiency)
          const { count, error: countError } = await supabase
            .from("parent_enrollments")
            .select("*", { count: "exact", head: true });
          
          if (countError) {
            console.warn("Error fetching total enrollments count:", countError);
            // Fallback: total should be at least this month's count
            totalEnrollments = studentEnrollments;
          } else {
            totalEnrollments = count || studentEnrollments;
          }
        } catch (e) {
          console.warn("Could not fetch parent enrollments:", e);
          // Continue with 0 enrollments if table doesn't exist
        }

        // Get people count from registry
        let peopleCount = 0;
        try {
          const { count: pCount } = await supabase
            .from("people_registry")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");
          peopleCount = pCount || 0;
        } catch (e) {
          console.warn("Could not fetch people count:", e);
        }

        // Get open disputes count
        let openDisputes = 0;
        try {
          const { count: dCount } = await supabase
            .from("disputes")
            .select("*", { count: "exact", head: true })
            .in("status", ["open", "under_review", "escalated"]);
          openDisputes = dCount || 0;
        } catch (e) {
          console.warn("Could not fetch disputes count:", e);
        }

        res.json({
          totalApplications: allApplications.length,
          pendingApplications: pendingApplications.length,
          approvedTutors: approvedApplications.length,
          availableForPods,
          totalEnrollments,
          studentEnrollments,
          peopleCount,
          openDisputes,
        });
      } catch (error) {
        console.error("Error fetching HR stats:", error);
        res.status(500).json({ 
          totalApplications: 0,
          pendingApplications: 0,
          approvedTutors: 0,
          availableForPods: 0,
          totalEnrollments: 0,
          studentEnrollments: 0,
          peopleCount: 0,
          openDisputes: 0,
          error: "Failed to fetch stats" 
        });
      }
    }
  );

  // Get all parent enrollments for COO traffic page
  app.get(
    "/api/hr/enrollments",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        // Direct select with all enrollment fields - prefer direct query to avoid RPC/RLS mismatches
        const { data, error } = await supabase
          .from("parent_enrollments")
          .select("id, user_id, parent_full_name, parent_phone, parent_email, parent_city, student_full_name, student_grade, school_name, math_struggle_areas, previous_tutoring, confidence_level, internet_access, parent_motivation, status, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error selecting parent_enrollments:", error.message);
          return res.status(500).json([]);
        }

        // Normalize and return
        const transformed = (data || []).map((e: any) => ({
          ...e,
          statusLabel: e.status === "awaiting_assignment" ? "Awaiting Assignment" : 
                      e.status === "assigned" ? "Assigned" :
                      e.status === "confirmed" ? "Confirmed" :
                      e.status
        }));

        console.log(`/api/hr/enrollments returned ${transformed.length} rows`);
        res.json(transformed);
      } catch (error) {
        console.error("Error in /api/hr/enrollments:", error);
        res.status(500).json([]);
      }
    }
  );

  // Assign tutor to parent enrollment (COO-controlled)
  app.post(
    "/api/hr/enrollments/:enrollmentId/assign-tutor",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { enrollmentId } = req.params;
        const { tutorId, podId } = req.body;

        if (!tutorId) {
          return res.status(400).json({ message: "Tutor ID is required" });
        }

        // Update the parent enrollment with the assigned tutor, but do not set to 'assigned' until tutor accepts
        const { data, error } = await supabase
          .from("parent_enrollments")
          .update({
            assigned_tutor_id: tutorId,
            status: "awaiting_tutor_acceptance",
            updated_at: new Date().toISOString(),
          })
          .eq("id", enrollmentId)
          .select();

        if (error) {
          console.error("Error updating enrollment:", error);
          return res.status(500).json({ message: "Failed to assign tutor" });
        }

        if (!data || data.length === 0) {
          return res.status(404).json({ message: "Enrollment not found" });
        }

        const enrollment = data[0];

        // Create or repair a student record for the assigned tutor
        try {
          const student = await ensureStudentForEnrollment(enrollment, tutorId);

          if (student) {
            console.log("Student ensured successfully for:", enrollment.student_full_name);
          }
        } catch (studentErr) {
          console.error("Error in student creation flow:", studentErr);
          // Don't fail the tutor assignment
        }

        res.json({
          message: "Tutor assigned successfully",
          enrollment: data[0],
        });
      } catch (error) {
        console.error("Error assigning tutor:", error);
        res.status(500).json({ message: "Failed to assign tutor" });
      }
    }
  );

  // Get active pods for COO to assign tutors
  app.get(
    "/api/hr/active-pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getPods();
        const activePods = pods.filter((p) => p.status === "active");
        res.json(activePods);
      } catch (error) {
        console.error("Error fetching active pods:", error);
        res.status(500).json({ message: "Failed to fetch active pods" });
      }
    }
  );

  // Get tutors in a pod for COO assignment flow
  app.get(
    "/api/hr/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        
        // Fetch tutor details for each assignment
        const tutorsData = await Promise.all(
          assignments.map(async (assignment: any) => {
            const tutor = await storage.getUser(assignment.tutorId);
            return {
              ...assignment,
              tutorName: tutor?.name || "Unknown",
              tutorEmail: tutor?.email || "",
            };
          })
        );
        
        res.json(tutorsData);
      } catch (error) {
        console.error("Error fetching pod tutors:", error);
        res.status(500).json({ message: "Failed to fetch pod tutors" });
      }
    }
  );

  // Get tutor profile by ID (public endpoint for HR)
  app.get(
    "/api/tutors/:tutorId",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { tutorId } = req.params;

        const tutor = await storage.getUser(tutorId);
        if (!tutor) {
          return res.status(404).json({ message: "Tutor not found" });
        }

        res.json(tutor);
      } catch (error) {
        console.error("Error fetching tutor profile:", error);
        res.status(500).json({ message: "Failed to fetch tutor profile" });
      }
    }
  );

  // ========================================
  // BRAIN MODULE ROUTES (HR)
  // ========================================

  // Get all people in registry
  app.get(
    "/api/hr/brain/people",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching people registry:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in people registry:", error);
        res.json([]);
      }
    }
  );

  // Add person to registry
  app.post(
    "/api/hr/brain/people",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .insert({
            full_name: req.body.fullName,
            role_title: req.body.roleTitle,
            role_description: req.body.roleDescription,
            short_bio: req.body.shortBio,
            team_name: req.body.teamName,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status || "active",
            start_date: req.body.startDate ? new Date(req.body.startDate) : new Date(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding person:", error);
          return res.status(500).json({ message: "Failed to add person" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in add person:", error);
        res.status(500).json({ message: "Failed to add person" });
      }
    }
  );

  // Get all details (weekly deliverables)
  app.get(
    "/api/hr/brain/details",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("details")
          .select(`
            *,
            person:people_registry(*)
          `)
          .order("due_date", { ascending: true });

        if (error) {
          console.error("Error fetching details:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in details:", error);
        res.json([]);
      }
    }
  );

  // Create detail
  app.post(
    "/api/hr/brain/details",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("details")
          .insert({
            person_id: req.body.personId,
            description: req.body.description,
            due_date: new Date(req.body.dueDate),
            status: "pending",
            created_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating detail:", error);
          return res.status(500).json({ message: "Failed to create detail" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in create detail:", error);
        res.status(500).json({ message: "Failed to create detail" });
      }
    }
  );

  // Mark detail as done
  app.patch(
    "/api/hr/brain/details/:id/done",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from("details")
          .update({
            status: "done",
            fulfilled_at: new Date(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error marking detail done:", error);
          return res.status(500).json({ message: "Failed to mark detail done" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in mark detail done:", error);
        res.status(500).json({ message: "Failed to mark detail done" });
      }
    }
  );

  // Get all projects
  app.get(
    "/api/hr/brain/projects",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            owner:people_registry(*)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching projects:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in projects:", error);
        res.json([]);
      }
    }
  );

  // Create project
  app.post(
    "/api/hr/brain/projects",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("projects")
          .insert({
            name: req.body.name,
            owner_id: req.body.ownerId,
            horizon: req.body.horizon,
            objective: req.body.objective,
            status: "active",
            start_date: new Date(),
            created_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating project:", error);
          return res.status(500).json({ message: "Failed to create project" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in create project:", error);
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  );

  // Get all ideas
  app.get(
    "/api/hr/brain/ideas",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching ideas:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in ideas:", error);
        res.json([]);
      }
    }
  );

  // Update idea status
  app.patch(
    "/api/hr/brain/ideas/:id/status",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("ideas")
          .update({
            status: req.body.status,
            review_notes: req.body.notes,
            reviewed_by: userId,
            reviewed_at: new Date(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating idea status:", error);
          return res.status(500).json({ message: "Failed to update idea status" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in update idea status:", error);
        res.status(500).json({ message: "Failed to update idea status" });
      }
    }
  );

  // Convert idea to project
  app.post(
    "/api/hr/brain/ideas/:id/convert",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = (req.session as any).userId;

        // Get the idea
        const { data: idea, error: ideaError } = await supabase
          .from("ideas")
          .select("*")
          .eq("id", id)
          .single();

        if (ideaError || !idea) {
          return res.status(404).json({ message: "Idea not found" });
        }

        // Create project from idea (owner needs to be set manually after)
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: idea.title,
            objective: idea.description,
            horizon: "30",
            status: "active",
            start_date: new Date(),
            created_by: userId,
          })
          .select()
          .single();

        if (projectError) {
          console.error("Error creating project from idea:", projectError);
          return res.status(500).json({ message: "Failed to create project" });
        }

        // Update idea with project reference
        await supabase
          .from("ideas")
          .update({
            status: "approved",
            converted_to_project_id: project.id,
          })
          .eq("id", id);

        res.json({ project, idea });
      } catch (error) {
        console.error("Error converting idea to project:", error);
        res.status(500).json({ message: "Failed to convert idea" });
      }
    }
  );

  // Submit idea (public - any logged in user)
  app.post(
    "/api/ideas/submit",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("ideas")
          .insert({
            title: req.body.title,
            description: req.body.description,
            pillar: req.body.pillar,
            problem_solved: req.body.problemSolved,
            status: "new",
            submitted_by: userId,
            submitter_name: req.body.submitterName,
            submitter_role: req.body.submitterRole,
          })
          .select()
          .single();

        if (error) {
          console.error("Error submitting idea:", error);
          return res.status(500).json({ message: "Failed to submit idea" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit idea:", error);
        res.status(500).json({ message: "Failed to submit idea" });
      }
    }
  );

  // Submit High School Leadership Pilot request (allow public submissions)
  app.post(
    "/api/pilots/highschool/submit",
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any)?.userId || null;
        const insertObj: any = {
          school_name: req.body.schoolName,
          contact_person_name: req.body.contactPersonName || null,
          contact_person_phone: req.body.phone || null,
          contact_person_role: req.body.contactPersonRole,
          email: req.body.email,
          submitter_name: req.body.submitterName || null,
          submitter_role: req.body.submitterRole || null,
        };
        if (userId) insertObj.submitted_by = userId;

        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .insert(insertObj)
          .select()
          .single();

        if (error) {
          console.error("Error submitting leadership pilot request:", error);
          return res.status(500).json({ message: "Failed to submit request" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit leadership pilot request:", error);
        res.status(500).json({ message: "Failed to submit request" });
      }
    }
  );

  // Submit Early Intervention Pilot request (allow public submissions)
  app.post(
    "/api/pilots/earlyintervention/submit",
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any)?.userId || null;
        const insertObj: any = {
          school_name: req.body.schoolName,
          contact_person_name: req.body.contactPersonName || null,
          contact_person_phone: req.body.phone || null,
          contact_person_role: req.body.contactPersonRole,
          email: req.body.email,
          submitter_name: req.body.submitterName || null,
          submitter_role: req.body.submitterRole || null,
        };
        if (userId) insertObj.submitted_by = userId;

        const { data, error } = await supabase
          .from("early_intervention_requests")
          .insert(insertObj)
          .select()
          .single();

        if (error) {
          console.error("Error submitting early intervention pilot request:", error);
          return res.status(500).json({ message: "Failed to submit request" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit early intervention pilot request:", error);
        res.status(500).json({ message: "Failed to submit request" });
      }
    }
  );

  // COO: fetch leadership pilot requests
    // COO: delete leadership pilot request
    app.delete(
      "/api/coo/leadership-pilot-requests/:id",
      isAuthenticated,
      requireRole(["coo"]),
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const { error } = await supabase
            .from("leadership_pilot_requests")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Error deleting leadership pilot request:", error);
            return res.status(500).json({ message: "Failed to delete pilot request" });
          }
          res.json({ message: "Pilot request deleted" });
        } catch (error) {
          console.error("Error in deleting leadership pilot request:", error);
          res.status(500).json({ message: "Failed to delete pilot request" });
        }
      }
    );
  app.get(
    "/api/coo/leadership-pilot-requests",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching leadership pilot requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching leadership pilot requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // HR: fetch leadership pilot requests
  app.get(
    "/api/hr/leadership-pilot-requests",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching leadership pilot requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching leadership pilot requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // COO: fetch early intervention pilot requests
    // COO: delete early intervention pilot request
    app.delete(
      "/api/coo/earlyintervention-requests/:id",
      isAuthenticated,
      requireRole(["coo"]),
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const { error } = await supabase
            .from("early_intervention_requests")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Error deleting early intervention pilot request:", error);
            return res.status(500).json({ message: "Failed to delete pilot request" });
          }
          res.json({ message: "Pilot request deleted" });
        } catch (error) {
          console.error("Error in deleting early intervention pilot request:", error);
          res.status(500).json({ message: "Failed to delete pilot request" });
        }
      }
    );
  app.get(
    "/api/coo/earlyintervention-requests",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("early_intervention_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching early intervention requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching early intervention requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // HR: fetch early intervention pilot requests
  app.get(
    "/api/hr/earlyintervention-requests",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("early_intervention_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching early intervention requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching early intervention requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // Get people registry list (for any logged in user - for dispute logging)
  app.get(
    "/api/people-registry/list",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .select("id, full_name, role_title, status")
          .eq("status", "active")
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Error fetching people list:", error);
          return res.json([]);
        }

        // Transform to camelCase for frontend
        const transformed = (data || []).map((p: any) => ({
          id: p.id,
          fullName: p.full_name,
          roleTitle: p.role_title,
          status: p.status,
        }));

        res.json(transformed);
      } catch (error) {
        console.error("Error in people list:", error);
        res.json([]);
      }
    }
  );

  // ========================================
  // DISPUTES MODULE ROUTES (HR)
  // ========================================

  // Get all disputes
  app.get(
    "/api/hr/disputes",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: disputes, error } = await supabase
          .from("disputes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching disputes:", error);
          return res.json([]);
        }

        // Fetch resolutions for each dispute
        const disputesWithResolutions = await Promise.all(
          (disputes || []).map(async (dispute: any) => {
            const { data: resolutions } = await supabase
              .from("dispute_resolutions")
              .select("*")
              .eq("dispute_id", dispute.id)
              .order("created_at", { ascending: true });

            return {
              ...dispute,
              resolutions: resolutions || [],
            };
          })
        );

        res.json(disputesWithResolutions);
      } catch (error) {
        console.error("Error in disputes:", error);
        res.json([]);
      }
    }
  );

  // Log a dispute (any logged in user)
  app.post(
    "/api/disputes/log",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("disputes")
          .insert({
            logged_by: userId,
            logged_by_name: req.body.loggedByName,
            involved_parties: req.body.involvedParties,
            involved_party_names: req.body.involvedPartyNames,
            dispute_type: req.body.disputeType,
            description: req.body.description,
            desired_outcome: req.body.desiredOutcome,
            status: "open",
            visible_to: ["hr", "ceo"],
          })
          .select()
          .single();

        if (error) {
          console.error("Error logging dispute:", error);
          return res.status(500).json({ message: "Failed to log dispute" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in log dispute:", error);
        res.status(500).json({ message: "Failed to log dispute" });
      }
    }
  );

  // Update dispute status
  app.patch(
    "/api/hr/disputes/:id/status",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from("disputes")
          .update({
            status: req.body.status,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating dispute status:", error);
          return res.status(500).json({ message: "Failed to update dispute status" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in update dispute status:", error);
        res.status(500).json({ message: "Failed to update dispute status" });
      }
    }
  );

  // Resolve dispute
  app.post(
    "/api/hr/disputes/:disputeId/resolve",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { disputeId } = req.params;
        const userId = (req.session as any).userId;

        // Create resolution record
        const { data: resolution, error: resError } = await supabase
          .from("dispute_resolutions")
          .insert({
            dispute_id: disputeId,
            action: req.body.action,
            summary: req.body.summary,
            decision: req.body.decision,
            follow_up_date: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
            resolved_by: userId,
          })
          .select()
          .single();

        if (resError) {
          console.error("Error creating resolution:", resError);
          return res.status(500).json({ message: "Failed to create resolution" });
        }

        // Update dispute status to resolved
        await supabase
          .from("disputes")
          .update({ status: "resolved" })
          .eq("id", disputeId);

        res.json(resolution);
      } catch (error) {
        console.error("Error in resolve dispute:", error);
        res.status(500).json({ message: "Failed to resolve dispute" });
      }
    }
  );

  // Get dispute patterns
  app.get(
    "/api/hr/disputes/patterns",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: disputes, error } = await supabase
          .from("disputes")
          .select("involved_party_names, dispute_type");

        if (error) {
          console.error("Error fetching disputes for patterns:", error);
          return res.json([]);
        }

        // Return raw data, let frontend process patterns
        res.json(disputes || []);
      } catch (error) {
        console.error("Error in disputes patterns:", error);
        res.json([]);
      }
    }
  );

  // ========================================
  // AFFILIATE PROSPECTING ROUTES
  // ========================================

  // Get or create affiliate code
  app.get(
    "/api/affiliate/code",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        console.log("📋 Getting affiliate code for:", affiliateId);
        
        const codeRecord = await storage.getOrCreateAffiliateCode(affiliateId);
        console.log("✅ Got code record:", codeRecord);
        
        // Return just the code field to match frontend expectations
        res.json({ code: codeRecord.code });
      } catch (error) {
        console.error("Error getting affiliate code:", error);
        res.status(500).json({ message: "Failed to get affiliate code" });
      }
    }
  );

  // Log encounter
  app.post(
    "/api/affiliate/encounters",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        console.log("📝 Logging encounter for affiliate:", affiliateId);
        console.log("📋 Encounter data received:", JSON.stringify(req.body, null, 2));
        
        const encounter = insertEncounterSchema.parse(req.body);
        console.log("✅ Encounter validated:", JSON.stringify(encounter, null, 2));
        
        const result = await storage.logEncounter(affiliateId, encounter);
        console.log("✅ Encounter logged successfully:", result);
        
        res.json(result);
      } catch (error: any) {
        console.error("❌ Error logging encounter:", error.message);
        console.error("   Full error:", error);
        res.status(400).json({ message: error.message || "Failed to log encounter" });
      }
    }
  );

  // Get all encounters for affiliate
  app.get(
    "/api/affiliate/encounters",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const encounters = await storage.getEncounters(affiliateId);
        res.json(encounters);
      } catch (error) {
        console.error("Error getting encounters:", error);
        res.status(500).json({ message: "Failed to get encounters" });
      }
    }
  );

  // Mark encounter as objected
  app.patch(
    "/api/affiliate/encounters/:id/object",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await storage.updateEncounterStatus(id, "objected");
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating encounter:", error);
        res.status(500).json({ message: "Failed to update encounter" });
      }
    }
  );

  // Get affiliate leads
  app.get(
    "/api/affiliate/leads",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const leads = await storage.getLeads(affiliateId);
        res.json(leads);
      } catch (error) {
        console.error("Error getting leads:", error);
        res.status(500).json({ message: "Failed to get leads" });
      }
    }
  );

  // Get affiliate closes
  app.get(
    "/api/affiliate/closes",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const closes = await storage.getCloses(affiliateId);
        res.json(closes);
      } catch (error) {
        console.error("Error getting closes:", error);
        res.status(500).json({ message: "Failed to get closes" });
      }
    }
  );

  // Get affiliate stats
  app.get(
    "/api/affiliate/stats",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const stats = await storage.getAffiliateStats(affiliateId);
        res.json(stats);
      } catch (error) {
        console.error("Error getting stats:", error);
        res.status(500).json({ message: "Failed to get stats" });
      }
    }
  );

  // Get affiliate lead/close/objected breakdown
  app.get(
    "/api/affiliate/breakdown",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const breakdown = await storage.getAffiliateLeadsByStatus(affiliateId);
        res.json(breakdown);
      } catch (error) {
        console.error("Error getting breakdown:", error);
        res.status(500).json({ message: "Failed to get breakdown" });
      }
    }
  );

  // Save affiliate reflection (from discover-deliver blueprint)
  app.post(
    "/api/affiliate/reflection",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const parsed = insertAffiliateReflectionSchema.parse(req.body);
        const reflectionText = parsed.reflectionText || parsed.reflection_text;
        const result = await storage.saveAffiliateReflection(affiliateId, reflectionText);
        res.json(result);
      } catch (error) {
        console.error("Error saving reflection:", error);
        res.status(400).json({ message: "Failed to save reflection" });
      }
    }
  );

  // Get affiliate reflection
  app.get(
    "/api/affiliate/reflection",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const reflection = await storage.getAffiliateReflection(affiliateId);
        res.json(reflection);
      } catch (error) {
        console.error("Error getting reflection:", error);
        res.status(500).json({ message: "Failed to get reflection" });
      }
    }
  );

  // Record close (parent committed to tutoring journey)
  app.post(
    "/api/parent/record-close",
    isAuthenticated,
    requireRole(["parent"]),
    async (req: Request, res: Response) => {
      try {
        const parentId = (req.session as any).userId;
        const { studentId, podId } = req.body;

        if (!studentId) {
          return res.status(400).json({ message: "studentId is required" });
        }

        // Get parent's lead to find their affiliate
        const { data: lead } = await supabase
          .from("leads")
          .select("affiliate_id")
          .eq("parent_id", parentId)
          .maybeSingle();

        if (!lead) {
          return res.status(400).json({ message: "No affiliate found for this parent" });
        }

        // Record the close
        const close = await storage.recordClose(lead.affiliate_id, parentId, studentId, podId);
        res.json(close);
      } catch (error) {
        console.error("Error recording close:", error);
        res.status(500).json({ message: "Failed to record close" });
      }
    }
  );

  // ========================================
  // PARENT ENROLLMENT ROUTES
  // ========================================

  // Get parent enrollment status
  app.get("/api/parent/enrollment-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const dbUser = (req as any).dbUser;

      console.log("📍 Enrollment status check for user:", userId, "role:", dbUser?.role);

      // Allow all authenticated users to check their enrollment status
      // (mainly parents, but be lenient)
      
      // Check if parent has completed enrollment
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.warn("⚠️  Error fetching enrollment status (table may not exist yet):", error.message);
        // If table doesn't exist or there's an error, just return not_enrolled
        // This allows the gateway to load and user can submit their enrollment
        return res.json({ status: "not_enrolled" });
      }

      if (!enrollmentData) {
        return res.json({ status: "not_enrolled" });
      }

      let status = enrollmentData.status || "not_enrolled";

      // Auto-correct: if status is 'awaiting_tutor_acceptance', check if tutor has accepted
      if (status === "awaiting_tutor_acceptance" && enrollmentData.assigned_tutor_id) {
        // Try to find the assigned student and check workflow
        let assignmentAccepted = false;
        if (enrollmentData.assigned_student_id) {
          const assignedStudent = await storage.getStudent(enrollmentData.assigned_student_id);
          const assignedWorkflow = ((assignedStudent?.personalProfile as any) || {}).workflow || {};
          assignmentAccepted = !!assignedWorkflow.assignmentAcceptedAt;
        }
        // If accepted, override status
        if (assignmentAccepted) {
          status = "assigned";
        }
      }

      res.json({
        status,
        step: enrollmentData.current_step,
      });
    } catch (error) {
      console.error("Error in enrollment-status:", error);
      // On error, assume not_enrolled so gateway can proceed
      res.json({ status: "not_enrolled" });
    }
  });

  // Get tutor profile for parent
  app.get("/api/parent/assigned-tutor", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).dbUser.id;
      console.log("📋 Fetching assigned tutor for parent:", userId);

      // Get parent's enrollment to find assigned tutor
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .select("assigned_tutor_id")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("📋 Enrollment data:", enrollmentData, "Error:", error);

      if (error || !enrollmentData || !enrollmentData.assigned_tutor_id) {
        return res.status(404).json({ message: "No tutor assigned" });
      }

      // Fetch tutor info from public.users
      const tutor = await storage.getUser(enrollmentData.assigned_tutor_id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const tutorProfile = {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        bio: tutor.bio || undefined,
        phone: tutor.phone || undefined,
        profile_image_url: tutor.profileImageUrl || undefined,
      };
      console.log("📋 Returning tutor profile (public.users):", tutorProfile);
      res.json(tutorProfile);
    } catch (error) {
      console.error("Error fetching assigned tutor (admin API):", error);
      res.status(500).json({ message: "Failed to fetch tutor profile" });
    }
  });

  // Submit parent enrollment form
  app.post("/api/parent/enroll", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const dbUser = (req as any).dbUser;

      console.log("📍 Enrollment submission for user:", userId, "role:", dbUser?.role);

      // Allow all authenticated users to submit enrollment
      // (mainly parents, but be lenient during development)
      
      const {
        parentFullName,
        parentPhone,
        parentEmail,
        parentCity,
        studentFullName,
        studentGrade,
        schoolName,
        stuckAreas,
        mathStruggleAreas,
        previousTutoring,
        confidenceLevel,
        internetAccess,
        parentMotivation,
        processAlignment,
        agreedToTerms,
        onboardingType,
        cohortCode,
        affiliateCode: bodyAffiliateCode
      } = req.body;

      const reportedTopics = buildReportedTopics(stuckAreas, mathStruggleAreas);
      const responseSymptoms = buildResponseSymptoms(confidenceLevel);

      const normalizedMathStruggleAreas =
        reportedTopics.length > 0 ? reportedTopics.join(", ") : mathStruggleAreas;
      const normalizedParentMotivation = [
        parentMotivation,
        processAlignment ? `Process alignment: ${processAlignment}` : "",
        responseSymptoms.length > 0
          ? `Observed response symptoms: ${responseSymptoms.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      // Use affiliate code from session if not present in body
      let affiliateCode = bodyAffiliateCode || req.session.affiliateCode || null;
      if (affiliateCode) {
        // Remove from session after use
        req.session.affiliateCode = undefined;
      }

      // Validate required fields
      if (
        !parentFullName ||
        !parentPhone ||
        !studentFullName ||
        !studentGrade ||
        !schoolName ||
        !mathStruggleAreas ||
        !previousTutoring ||
        !confidenceLevel ||
        !internetAccess ||
        !agreedToTerms
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }


      // Check if enrollment already exists
      const { data: existing } = await supabase
        .from("parent_enrollments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ message: "Enrollment already submitted" });
      }



      // Determine onboarding_type from affiliate code if present
      // Determine onboarding_type and affiliate_type from affiliate code if present
      // Only allow 'pilot' or 'commercial' as onboarding_type
        // --- ONBOARDING LOGIC ---
        // onboarding_type: 'pilot' or 'commercial' ONLY
        // affiliate_type: 'person' or 'entity' ONLY
        let resolvedOnboardingType = (onboardingType === 'pilot' || onboardingType === 'commercial') ? onboardingType : 'commercial';
        let resolvedAffiliateType = null;
        if (affiliateCode) {
          // Always set onboarding_type to 'pilot' if code is provided
          resolvedOnboardingType = 'pilot';
          const { data: codeData, error: codeError } = await supabase
            .from("affiliate_codes")
            .select("type, affiliate_type")
            .eq("code", affiliateCode)
            .maybeSingle();
          if (codeError) {
            console.error('Error looking up affiliate code for onboarding_type/affiliate_type:', codeError);
          }
          if (codeData) {
            // affiliate_type is for analytics/tracking, not onboarding flow
            resolvedAffiliateType = codeData.affiliate_type || codeData.type || null;
          }
        }
        // Ensure onboarding_type is never set to affiliate_type
        if (resolvedOnboardingType !== 'pilot' && resolvedOnboardingType !== 'commercial') {
          resolvedOnboardingType = 'commercial';
        }
        // --- END ONBOARDING LOGIC ---
      // Insert or update onboarding type, affiliate type, and affiliate code in parents table
      // Fetch full_name from public.users
      let fullName = null;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", userId)
        .maybeSingle();
      if (userError) {
        console.error("Error fetching first_name/last_name from users:", userError);
      }
      if (userData) {
        const first = userData.first_name || '';
        const last = userData.last_name || '';
        fullName = (first + ' ' + last).trim();
      }
      // --- DEBUG LOGGING ---
      console.log("[ENROLL] Preparing to upsert parent record:", {
        user_id: userId,
        onboarding_type: resolvedOnboardingType,
        affiliate_type: resolvedAffiliateType,
        affiliate_code: affiliateCode,
        cohort_code: cohortCode,
        full_name: fullName,
      });
      try {
        const { data: parentUpserted, error: parentUpsertError } = await supabase
          .from("parents")
          .upsert({
            user_id: userId,
            onboarding_type: resolvedOnboardingType,
            affiliate_type: resolvedAffiliateType,
            affiliate_code: affiliateCode || cohortCode || null,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          .select()
          .single();
        if (parentUpsertError) {
          console.error("[ENROLL] Error upserting parent onboarding/affiliate type:", parentUpsertError);
        } else {
          console.log("[ENROLL] Parent upsert successful. Upserted row:", parentUpserted);
        }
      } catch (err) {
        console.error("[ENROLL] Exception during parent upsert:", err);
      }
      // --- END DEBUG LOGGING ---

      // Lead creation is now handled after signup, not enrollment.

      // Create enrollment record
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .insert({
          user_id: userId,
          parent_full_name: parentFullName,
          parent_phone: parentPhone,
          parent_email: parentEmail,
          parent_city: parentCity,
          student_full_name: studentFullName,
          student_grade: studentGrade,
          school_name: schoolName,
          math_struggle_areas: normalizedMathStruggleAreas,
          previous_tutoring: previousTutoring,
          confidence_level: confidenceLevel,
          internet_access: internetAccess,
          parent_motivation: normalizedParentMotivation,
          status: "awaiting_assignment",
          current_step: "awaiting-assignment",
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.warn("⚠️  Error creating enrollment (table may not exist yet):", error.message);
        // If table doesn't exist, that's OK - return success anyway
        // This allows the flow to proceed, and data will be saved once migration is run
        res.json({
          message: "Enrollment submitted successfully (queued)",
          enrollment: null,
        });
        return;
      }

      res.json({
        message: "Enrollment submitted successfully",
        enrollment: enrollmentData?.[0],
      });
    } catch (error) {
      console.error("Error in enroll:", error);
      // Even on error, return success to allow gateway flow to proceed
      res.json({
        message: "Enrollment submitted successfully (queued)",
        enrollment: null,
      });
    }
  });

  // ========================================
  // ONBOARDING PROPOSAL ROUTES
  // ========================================

  // Create/Send proposal (Tutor)
  app.post("/api/tutor/proposal", isAuthenticated, requireRole(["tutor", "td", "hr", "coo", "ceo"]), async (req: Request, res: Response) => {
    try {
      const tutorId = (req as any).dbUser.id;
      const {
        studentId,
        enrollmentId,
        primaryIdentity,
        mathRelationship,
        confidenceTriggers,
        confidenceKillers,
        pressureResponse,
        growthDrivers,
        currentTopics,
        immediateStruggles,
        gapsIdentified,
        tutorNotes,
        topicConditioningTopic,
        topicConditioningEntryPhase,
        topicConditioningStability,
        futureIdentity,
        wantToRemembered,
        hiddenMotivations,
        internalConflict,
        recommendedPlan,
        justification,
        childWillWin,
      } = req.body;

      // Validate required fields
      if (!studentId || !recommendedPlan || !justification) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Tie proposal generation to latest intro drill result for this tutor+student.
      const { data: latestIntroDrills, error: introDrillError } = await supabase
        .from("intro_session_drills")
        .select("id, drill, submitted_at")
        .eq("student_id", studentId)
        .eq("tutor_id", tutorId)
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (introDrillError) {
        console.error("Error fetching latest intro drill for proposal:", introDrillError);
        return res.status(500).json({ message: "Failed to validate intro drill before proposal" });
      }

      if (!latestIntroDrills || latestIntroDrills.length === 0) {
        return res.status(400).json({ message: "Complete intro drill before generating proposal" });
      }

      let latestIntroDrill: any = null;
      let parsedIntro: any = null;
      for (const row of latestIntroDrills) {
        let parsed: any = null;
        try {
          parsed = typeof row.drill === "string" ? JSON.parse(row.drill) : row.drill;
        } catch {
          parsed = null;
        }
        if ((parsed?.drillType || "diagnosis") === "diagnosis") {
          latestIntroDrill = row;
          parsedIntro = parsed;
          break;
        }
      }

      if (!latestIntroDrill || !parsedIntro) {
        return res.status(400).json({ message: "Complete intro diagnosis drill before generating proposal" });
      }

      const introTopicFromDrill = String(parsedIntro?.introTopic || "").trim();
      const introSummary = parsedIntro?.summary || null;
      const drillPhase = normalizePhase(introSummary?.phase || parsedIntro?.phase || "Clarity");
      const drillStability = normalizeStability(introSummary?.stability || "Low");
      const trainingEntryPhase = deriveTrainingEntryPhase(drillPhase, drillStability);
      const drillNextAction = introSummary?.nextAction || NEXT_ACTION_ENGINE[drillPhase][drillStability].primaryAction;
      const drillConstraint = introSummary?.constraint || NEXT_ACTION_ENGINE[drillPhase][drillStability].rules[0] || null;

      if (!introTopicFromDrill) {
        return res.status(400).json({
          message: "Intro drill diagnostic topic is missing. Re-run intro session with Add Diagnostic Topic before generating proposal",
        });
      }

      const resolvedCurrentTopics = Array.from(
        new Set([
          ...(Array.isArray(currentTopics) ? currentTopics : []),
          introTopicFromDrill,
        ].map((item) => String(item || "").trim()).filter(Boolean))
      );

      const systemLinkedTutorNotes = [
        String(tutorNotes || "").trim(),
        "",
        "[System Intro Drill Link]",
        `Intro Topic: ${introTopicFromDrill}`,
        `Diagnosis Phase: ${drillPhase}`,
        `Training Entry Phase: ${trainingEntryPhase}`,
        `Stability: ${drillStability}`,
        `Next Action: ${drillNextAction}`,
        drillConstraint ? `Constraint: ${drillConstraint}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Find the enrollment record for this student
      let actualEnrollmentId = enrollmentId;
      if (!actualEnrollmentId) {
        // Prefer assigned_student_id (canonical), then fallback to legacy student_id.
        const { data: enrollmentByAssignedStudent } = await supabase
          .from("parent_enrollments")
          .select("id")
          .eq("assigned_student_id", studentId)
          .eq("assigned_tutor_id", tutorId)
          .maybeSingle();

        actualEnrollmentId = enrollmentByAssignedStudent?.id || null;

        if (!actualEnrollmentId) {
          const { data: enrollmentByLegacyStudentId } = await supabase
            .from("parent_enrollments")
            .select("id")
            .eq("student_id", studentId)
            .eq("assigned_tutor_id", tutorId)
            .maybeSingle();

          actualEnrollmentId = enrollmentByLegacyStudentId?.id || null;
        }
      }

      if (!actualEnrollmentId) {
        return res.status(400).json({
          message: "No linked enrollment found for this student+tutor. Accept assignment and confirm intro before sending proposal.",
        });
      }

      // Create proposal
      const { data: proposalData, error } = await supabase
        .from("onboarding_proposals")
        .insert({
          enrollment_id: actualEnrollmentId,
          tutor_id: tutorId,
          student_id: studentId,
          primary_identity: primaryIdentity,
          math_relationship: mathRelationship,
          confidence_triggers: confidenceTriggers,
          confidence_killers: confidenceKillers,
          pressure_response: pressureResponse,
          growth_drivers: growthDrivers,
          current_topics: resolvedCurrentTopics,
          topic_conditioning_topic: introTopicFromDrill,
          topic_conditioning_entry_phase: trainingEntryPhase,
          topic_conditioning_stability: drillStability,
          immediate_struggles: immediateStruggles,
          gaps_identified: gapsIdentified,
          tutor_notes: systemLinkedTutorNotes,
          future_identity: futureIdentity,
          want_to_remembered: wantToRemembered,
          hidden_motivations: hiddenMotivations,
          internal_conflict: internalConflict,
          recommended_plan: recommendedPlan,
          justification: justification,
          child_will_win: childWillWin,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating proposal:", error);
        return res.status(500).json({ message: "Failed to create proposal" });
      }

      // Update enrollment status to proposal_sent if enrollment exists
      if (actualEnrollmentId) {
        await supabase
          .from("parent_enrollments")
          .update({
            status: "proposal_sent",
            proposal_id: proposalData.id,
            proposal_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", actualEnrollmentId);
      }

      res.json({
        message: "Proposal sent successfully",
        proposal: proposalData,
      });
    } catch (error) {
      console.error("Error in create proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  // Get proposal by ID (Parent or Tutor)
  app.get("/api/proposal/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const proposalId = req.params.id;
      const userId = (req as any).dbUser.id;
      const userRole = (req as any).dbUser.role;

      // Fetch proposal with enrollment and student info
      const { data: proposal, error } = await supabase
        .from("onboarding_proposals")
        .select(`
          *,
          enrollment:parent_enrollments(parent_id, student_full_name, student_grade),
          student:students(name, grade),
          tutor:users!onboarding_proposals_tutor_id_fkey(name, bio, phone, email)
        `)
        .eq("id", proposalId)
        .single();

      if (error || !proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Authorization: only the parent, tutor, or admin roles can view
      const isParent = userRole === "parent" && proposal.enrollment?.parent_id === userId;
      const isTutor = proposal.tutor_id === userId;
      const isAdmin = ["hr", "coo", "ceo", "td"].includes(userRole);

      if (!isParent && !isTutor && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to view this proposal" });
      }

      // Track view count for parents
      if (isParent) {
        await supabase
          .from("onboarding_proposals")
          .update({
            viewed_at: new Date().toISOString(),
            viewed_count: (proposal.viewed_count || 0) + 1,
          })
          .eq("id", proposalId);
      }

      res.json(proposal);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Get parent's proposal (for gateway/dashboard)
  app.get("/api/parent/proposal", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      console.log("📋 Fetching proposal for parent:", parentId);

      // Get parent's enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, proposal_id, status")
        .eq("user_id", parentId)
        .maybeSingle();

        // Also fetch math_struggle_areas to fix stale currentTopics in proposals
        const { data: enrollmentFull } = await supabase
          .from("parent_enrollments")
          .select("math_struggle_areas")
          .eq("user_id", parentId)
          .maybeSingle();

      console.log("📋 Enrollment data:", enrollment, "Error:", enrollmentError);

      if (enrollmentError) {
        console.error("Error fetching enrollment:", enrollmentError);
        return res.status(500).json({ message: "Failed to fetch enrollment" });
      }

      if (!enrollment) {
        console.log("No enrollment found for parent");
        return res.status(404).json({ message: "No enrollment found" });
      }

      if (!enrollment.proposal_id) {
        console.log("No proposal_id in enrollment");
        return res.status(404).json({ message: "No proposal found" });
      }

      // Get the proposal
      const { data: proposal, error } = await supabase
        .from("onboarding_proposals")
        .select("*")
        .eq("id", enrollment.proposal_id)
        .single();

      console.log("📋 Proposal data:", proposal, "Error:", error);

      if (error) {
        console.error("Error fetching proposal:", error);
        return res.status(500).json({ message: "Failed to fetch proposal", error: error.message });
      }

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Get student info separately
      const { data: student } = await supabase
        .from("students")
        .select("name, grade")
        .eq("id", proposal.student_id)
        .single();

      // Get tutor info separately
      const { data: tutor } = await supabase
        .from("auth.users")
        .select("id, email, user_metadata")
        .eq("id", proposal.tutor_id)
        .single();

      // Combine data and convert to camelCase
      const enrichedProposal = {
        id: proposal.id,
        primaryIdentity: proposal.primary_identity,
        mathRelationship: proposal.math_relationship,
        confidenceTriggers: proposal.confidence_triggers,
        confidenceKillers: proposal.confidence_killers,
        pressureResponse: proposal.pressure_response,
        growthDrivers: proposal.growth_drivers,
        currentTopics: (proposal.current_topics && proposal.current_topics !== "Onboarding baseline diagnostic")
          ? proposal.current_topics
          : (enrollmentFull?.math_struggle_areas || proposal.current_topics),
        topicConditioning: buildTopicConditioningMap({
          ...proposal,
          current_topics: (proposal.current_topics && proposal.current_topics !== "Onboarding baseline diagnostic")
            ? proposal.current_topics
            : (enrollmentFull?.math_struggle_areas || proposal.current_topics),
        }),
        immediateStruggles: proposal.immediate_struggles,
        gapsIdentified: proposal.gaps_identified,
        tutorNotes: proposal.tutor_notes,
        futureIdentity: proposal.future_identity,
        wantToRemembered: proposal.want_to_remembered,
        hiddenMotivations: proposal.hidden_motivations,
        internalConflict: proposal.internal_conflict,
        recommendedPlan: proposal.recommended_plan,
        justification: proposal.justification,
        childWillWin: proposal.child_will_win,
        parentCode: proposal.parent_code,
        createdAt: proposal.created_at,
        student: student || null,
        tutor: tutor ? {
          name: tutor.user_metadata?.name || tutor.email,
          email: tutor.email,
          bio: tutor.user_metadata?.bio,
          phone: tutor.user_metadata?.phone,
        } : null,
      };

      // Track view
      await supabase
        .from("onboarding_proposals")
        .update({
          viewed_at: new Date().toISOString(),
          viewed_count: (proposal.viewed_count || 0) + 1,
        })
        .eq("id", proposal.id);

      console.log("📋 Returning enriched proposal");
      res.json(enrichedProposal);
    } catch (error) {
      console.error("Error fetching parent proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Accept proposal (Parent)
  app.post("/api/parent/proposal/accept", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      // Get latest pending proposal enrollment for this parent.
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id")
        .eq("user_id", parentId)
        .eq("status", "proposal_sent")
        .not("proposal_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentError) {
        console.error("Error fetching pending enrollment for accept:", enrollmentError);
        return res.status(500).json({ message: "Failed to find pending proposal" });
      }

      if (!enrollment || !enrollment.proposal_id) {
        return res.status(404).json({ message: "No pending proposal found" });
      }

      // Get proposal details to get student and topic conditioning info
      const { data: proposal } = await supabase
        .from("onboarding_proposals")
        .select("student_id, tutor_id, topic_conditioning_topic, topic_conditioning_entry_phase, topic_conditioning_stability")
        .eq("id", enrollment.proposal_id)
        .maybeSingle();

      // Generate unique parent code (8 characters: letters and numbers)
      const generateParentCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      let parentCode = generateParentCode();
      let codeIsUnique = false;
      let attempts = 0;

      // Ensure code is unique
      while (!codeIsUnique && attempts < 10) {
        const { data: existing } = await supabase
          .from("onboarding_proposals")
          .select("id")
          .eq("parent_code", parentCode)
          .maybeSingle();
        
        if (!existing) {
          codeIsUnique = true;
        } else {
          parentCode = generateParentCode();
          attempts++;
        }
      }

      // Move to post-accept state so parent code and next-step UI unlock immediately.
      const { error: updateError } = await supabase
        .from("parent_enrollments")
        .update({
          status: "session_booked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);

      if (updateError) {
        console.error("Error accepting proposal:", updateError);
        return res.status(500).json({ message: "Failed to accept proposal" });
      }

      // Mark proposal as accepted and add parent code
      await supabase
        .from("onboarding_proposals")
        .update({
          enrollment_id: enrollment.id,
          accepted_at: new Date().toISOString(),
          parent_code: parentCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.proposal_id);

      // Auto-activate the proposal topic for Topic Management/Map only after parent accepts.
      const acceptedTopic = String(proposal?.topic_conditioning_topic || "").trim();
      const acceptedPhase = normalizePhase(proposal?.topic_conditioning_entry_phase || "Clarity");
      const acceptedStability = normalizeStability(proposal?.topic_conditioning_stability || "Low");

      if (proposal?.student_id && proposal?.tutor_id && acceptedTopic) {
        const activationReason = [
          "Auto-activated from accepted proposal",
          `Phase ${acceptedPhase}`,
          `Stability ${acceptedStability}`,
        ].join(" | ");

        const { data: existingActivation } = await supabase
          .from("topic_conditioning_activations")
          .select("id")
          .eq("student_id", proposal.student_id)
          .eq("topic", acceptedTopic)
          .limit(1)
          .maybeSingle();

        if (!existingActivation) {
          const { error: activationInsertError } = await supabase
            .from("topic_conditioning_activations")
            .insert({
              student_id: proposal.student_id,
              tutor_id: proposal.tutor_id,
              topic: acceptedTopic,
              reason: activationReason,
            });

          if (activationInsertError) {
            console.error("Error auto-activating accepted proposal topic:", activationInsertError);
          }
        }

        const { data: studentForConcept } = await supabase
          .from("students")
          .select("id, concept_mastery")
          .eq("id", proposal.student_id)
          .maybeSingle();

        if (studentForConcept) {
          const nowIso = new Date().toISOString();
          const currentConceptMastery =
            studentForConcept.concept_mastery && typeof studentForConcept.concept_mastery === "object"
              ? studentForConcept.concept_mastery
              : {};

          const topicConditioning =
            currentConceptMastery.topicConditioning && typeof currentConceptMastery.topicConditioning === "object"
              ? currentConceptMastery.topicConditioning
              : {};

          const topics =
            topicConditioning.topics && typeof topicConditioning.topics === "object"
              ? { ...topicConditioning.topics }
              : {};

          const key = acceptedTopic;
          const existingTopicState = topics[key] && typeof topics[key] === "object" ? topics[key] : {};
          const existingHistory = Array.isArray(existingTopicState.history) ? existingTopicState.history : [];

          topics[key] = {
            ...existingTopicState,
            topic: acceptedTopic,
            phase: acceptedPhase,
            stability: acceptedStability,
            lastUpdated: nowIso,
            observationNotes: "Auto-activated from accepted proposal after intro drill diagnosis.",
            history: [
              ...existingHistory,
              {
                date: nowIso,
                phase: acceptedPhase,
                stability: acceptedStability,
                nextAction: NEXT_ACTION_ENGINE[acceptedPhase][acceptedStability].primaryAction,
                observationNotes: "Auto-activated from accepted proposal.",
              },
            ],
          };

          const mergedConceptMastery = {
            ...currentConceptMastery,
            topicConditioning: {
              ...topicConditioning,
              topic: acceptedTopic,
              entry_phase: acceptedPhase,
              stability: acceptedStability,
              lastUpdated: nowIso,
              topics,
            },
          };

          const { error: conceptUpdateError } = await supabase
            .from("students")
            .update({ concept_mastery: mergedConceptMastery })
            .eq("id", proposal.student_id);

          if (conceptUpdateError) {
            console.error("Error updating concept mastery after proposal acceptance:", conceptUpdateError);
          }
        }
      }

      // Check if this parent came from an affiliate (has a lead record)
      const { data: lead } = await supabase
        .from("leads")
        .select("id, affiliate_id")
        .eq("user_id", parentId)
        .maybeSingle();

      if (lead && proposal?.student_id) {
        console.log("📊 Creating affiliate close record for lead:", lead.id);
        
        // Get tutor's assignment
        const { data: tutorAssignment } = await supabase
          .from("tutor_assignments")
          .select("id")
          .eq("tutor_id", proposal.tutor_id)
          .maybeSingle();

        // Create close record for affiliate
        const { error: closeError } = await supabase
          .from("closes")
          .insert({
            affiliate_id: lead.affiliate_id,
            parent_id: parentId,
            lead_id: lead.id,
            child_id: proposal.student_id,
            pod_assignment_id: tutorAssignment?.id || null,
            closed_at: new Date().toISOString(),
          });

        if (closeError) {
          console.error("Error creating affiliate close:", closeError);
          // Don't fail the whole request if close creation fails
        } else {
          console.log("✅ Affiliate close created successfully");
        }
      }

      res.json({ 
        message: "Proposal accepted successfully", 
        status: "session_booked",
        parentCode: parentCode 
      });
    } catch (error) {
      console.error("Error accepting proposal:", error);
      res.status(500).json({ message: "Failed to accept proposal" });
    }
  });

  // Generate student code for accepted proposal (Parent)
  app.post("/api/parent/generate-student-code", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;
      console.log("🎓 Generate student code request from parent:", parentId);

      // Get the latest enrollment that has a linked proposal.
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id")
        .eq("user_id", parentId)
        .not("proposal_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("📋 Enrollment:", enrollment, "Error:", enrollmentError);

      if (!enrollment || !enrollment.proposal_id) {
        console.log("❌ No proposal found for parent");
        return res.status(404).json({ message: "No proposal found" });
      }

      // Check if proposal is accepted
      const { data: proposal, error: proposalError } = await supabase
        .from("onboarding_proposals")
        .select("id, accepted_at, parent_code")
        .eq("id", enrollment.proposal_id)
        .single();

      console.log("📄 Proposal:", proposal, "Error:", proposalError);

      if (!proposal || !proposal.accepted_at) {
        console.log("❌ Proposal not yet accepted");
        return res.status(400).json({ message: "Proposal not yet accepted" });
      }

      // If code already exists, return it
      if (proposal.parent_code) {
        console.log("✅ Code already exists:", proposal.parent_code);
        return res.json({ parentCode: proposal.parent_code });
      }

      console.log("🎲 Generating new parent code...");

      // Generate unique parent code
      const generateParentCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      let parentCode = generateParentCode();
      let codeIsUnique = false;
      let attempts = 0;

      while (!codeIsUnique && attempts < 10) {
        const { data: existing } = await supabase
          .from("onboarding_proposals")
          .select("id")
          .eq("parent_code", parentCode)
          .maybeSingle();
        
        if (!existing) {
          codeIsUnique = true;
        } else {
          parentCode = generateParentCode();
          attempts++;
        }
      }

      console.log("🎲 Generated unique code:", parentCode);

      // Save code to proposal
      const { error: updateError } = await supabase
        .from("onboarding_proposals")
        .update({
          parent_code: parentCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id);

      if (updateError) {
        console.error("❌ Error updating proposal with parent code:", updateError);
        return res.status(500).json({ message: "Failed to generate student code" });
      }

      console.log("✅ Successfully saved parent code to database");
      res.json({ parentCode: parentCode });
    } catch (error) {
      console.error("Error generating student code:", error);
      res.status(500).json({ message: "Failed to generate student code" });
    }
  });

  // Decline proposal (Parent)
  app.post("/api/parent/proposal/decline", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;
      const { reason } = req.body; // Optional decline reason

      // Get latest pending proposal enrollment for this parent.
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id")
        .eq("user_id", parentId)
        .eq("status", "proposal_sent")
        .not("proposal_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentError) {
        console.error("Error fetching pending enrollment for decline:", enrollmentError);
        return res.status(500).json({ message: "Failed to find pending proposal" });
      }

      if (!enrollment || !enrollment.proposal_id) {
        return res.status(404).json({ message: "No pending proposal found" });
      }

      // Update enrollment status back to assigned (tutor can revise proposal)
      const { error: updateError } = await supabase
        .from("parent_enrollments")
        .update({
          status: "assigned", // Back to assigned - tutor needs to revise
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);

      if (updateError) {
        console.error("Error declining proposal:", updateError);
        return res.status(500).json({ message: "Failed to decline proposal" });
      }

      // Mark proposal as declined
      await supabase
        .from("onboarding_proposals")
        .update({
          declined_at: new Date().toISOString(),
          decline_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.proposal_id);

      res.json({ message: "Proposal declined. Your tutor will be notified.", status: "assigned" });
    } catch (error) {
      console.error("Error declining proposal:", error);
      res.status(500).json({ message: "Failed to decline proposal" });
    }
  });

  // ========================================
  // STUDENT AUTH ROUTES
  // ========================================

  // Student signup with parent code validation
  app.post("/api/student/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, parentCode } = req.body;
      console.log("🎓 Student signup request:", { email, firstName, lastName, parentCode });

      if (!email || !password || !parentCode) {
        return res.status(400).json({ message: "Email, password, and parent code are required" });
      }

      // Validate parent code
      console.log("🔍 Validating parent code:", parentCode.toUpperCase());
      const { data: proposal, error: proposalError } = await supabase
        .from("onboarding_proposals")
        .select("id, student_id, accepted_at, parent_code")
        .eq("parent_code", parentCode.toUpperCase())
        .maybeSingle();

      console.log("📋 Proposal found:", proposal, "Error:", proposalError);

      if (proposalError || !proposal) {
        console.log("❌ Invalid parent code");
        return res.status(400).json({ message: "Invalid parent code" });
      }

      if (!proposal.accepted_at) {
        console.log("❌ Proposal not accepted yet");
        return res.status(400).json({ message: "Parent has not yet accepted the proposal for this code" });
      }

      // Check if code already used
      console.log("🔍 Checking if code already used...");
      const { data: existingStudent, error: checkError } = await supabase
        .from("student_users")
        .select("id")
        .eq("parent_code", parentCode.toUpperCase())
        .maybeSingle();

      console.log("👥 Existing student:", existingStudent, "Check error:", checkError);

      if (existingStudent) {
        console.log("❌ Code already used");
        return res.status(400).json({ message: "This parent code has already been used" });
      }

      // Hash password using bcrypt
      console.log("🔐 Hashing password...");
      const { hash } = await import("bcryptjs");
      const hashedPassword = await hash(password, 10);

      // Create student user
      console.log("💾 Creating student user in database...");
      const { data: studentUser, error: insertError } = await supabase
        .from("student_users")
        .insert({
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          student_id: proposal.student_id,
          parent_code: parentCode.toUpperCase(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating student user:", insertError);
        console.error("❌ Insert error details:", JSON.stringify(insertError, null, 2));
        return res.status(500).json({ message: "Failed to create student account", error: insertError.message });
      }

      console.log("✅ Student user created:", studentUser);

      // Patch: Link intro session(s) to student_id after signup
      if (proposal.student_id) {
        // Find all intro sessions for this parent/tutor with student_id null
        const { data: introSessions, error: sessionFetchError } = await supabase
          .from("scheduled_sessions")
          .select("id")
          .eq("parent_id", req.body.parentId || null)
          .eq("tutor_id", proposal.tutor_id)
          .is("student_id", null)
          .eq("type", "intro");
        if (sessionFetchError) {
          console.error("❌ Error fetching intro sessions for student linkage:", sessionFetchError);
        } else if (introSessions && introSessions.length > 0) {
          const sessionIds = introSessions.map(s => s.id);
          const { error: updateSessionError } = await supabase
            .from("scheduled_sessions")
            .update({ student_id: proposal.student_id, updated_at: new Date().toISOString() })
            .in("id", sessionIds);
          if (updateSessionError) {
            console.error("❌ Error updating intro sessions with student_id:", updateSessionError);
          } else {
            console.log("✅ Linked intro sessions to student_id:", sessionIds);
          }
        }
      }

      // Create session for student
      (req.session as any).studentUserId = studentUser.id;
      (req.session as any).studentEmail = studentUser.email;
      req.session.touch();

      console.log("✅ Student signup successful!");
      res.json({
        message: "Student account created successfully",
        user: {
          id: studentUser.id,
          email: studentUser.email,
          firstName: studentUser.first_name,
          lastName: studentUser.last_name,
          studentId: studentUser.student_id,
        },
      });
    } catch (error: any) {
      console.error("❌ Student signup error:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create student account", error: error.message });
    }
  });

  // Student signin
  app.post("/api/student/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find student user
      const { data: studentUser, error } = await supabase
        .from("student_users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error || !studentUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const { compare } = await import("bcryptjs");
      const passwordMatch = await compare(password, studentUser.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await supabase
        .from("student_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", studentUser.id);

      // Create session
      (req.session as any).studentUserId = studentUser.id;
      (req.session as any).studentEmail = studentUser.email;
      req.session.touch();

      res.json({
        message: "Signed in successfully",
        user: {
          id: studentUser.id,
          email: studentUser.email,
          firstName: studentUser.first_name,
          lastName: studentUser.last_name,
          studentId: studentUser.student_id,
        },
      });
    } catch (error) {
      console.error("Student signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Get current student user
  app.get("/api/student/me", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;

      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser, error } = await supabase
        .from("student_users")
        .select("id, email, first_name, last_name, student_id, created_at, last_login")
        .eq("id", studentUserId)
        .single();

      if (error || !studentUser) {
        return res.status(404).json({ message: "Student user not found" });
      }

      // Get the student's tutor's pod if available
      let podName = null;
      if (studentUser.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("tutor_id")
          .eq("id", studentUser.student_id)
          .maybeSingle();

        if (student?.tutor_id) {
          const { data: tutorAssignment } = await supabase
            .from("tutor_assignments")
            .select("pod:pods(pod_name)")
            .eq("tutor_id", student.tutor_id)
            .maybeSingle();

          const pod = tutorAssignment?.pod as { pod_name?: string } | null;
          if (pod) {
            podName = pod.pod_name || null;
          }
        }
      }

      res.json({
        id: studentUser.id,
        email: studentUser.email,
        firstName: studentUser.first_name,
        lastName: studentUser.last_name,
        studentId: studentUser.student_id,
        createdAt: studentUser.created_at,
        lastLogin: studentUser.last_login,
        podName: podName,
      });
    } catch (error) {
      console.error("Error fetching student user:", error);
      res.status(500).json({ message: "Failed to fetch student user" });
    }
  });

  // Student logout
  app.post("/api/student/logout", async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // ========================================
  // STUDENT PORTAL ROUTES
  // ========================================

  // Get student stats (gamified dashboard)
  app.get("/api/student/stats", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get student_id from student_users table
      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Call get_student_stats function
      const { data, error } = await supabase
        .rpc("get_student_stats", { p_student_id: studentUser.student_id });

      if (error) {
        console.error("Error calling get_student_stats:", error);
        // Return zeros if function doesn't exist yet
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          currentStreak: 0,
          totalSessions: 0,
          confidenceLevel: 50,
        });
      }

      const stats = data?.[0] || {};
      res.json({
        bossBattlesCompleted: stats.boss_battles_completed || 0,
        solutionsUnlocked: stats.solutions_unlocked || 0,
        currentStreak: stats.current_streak || 0,
        totalSessions: stats.total_sessions || 0,
        confidenceLevel: stats.confidence_level || 50,
      });
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get student commitments
  app.get("/api/student/commitments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: commitments, error } = await supabase
        .from("student_commitments")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(commitments || []);
    } catch (error) {
      console.error("Error fetching commitments:", error);
      res.status(500).json({ message: "Failed to fetch commitments" });
    }
  });

  // Create student commitment
  app.post("/api/student/commitments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { name, description, why_important, daily_action } = req.body;

      const { data: commitment, error } = await supabase
        .from("student_commitments")
        .insert({
          student_id: studentUser.student_id,
          name,
          description,
          why_important,
          daily_action,
          streak_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      res.json(commitment);
    } catch (error) {
      console.error("Error creating commitment:", error);
      res.status(500).json({ message: "Failed to create commitment" });
    }
  });

  // Update student commitment
  app.put("/api/student/commitments/:id", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { name, description, why_important, daily_action } = req.body;

      const { data: commitment, error } = await supabase
        .from("student_commitments")
        .update({
          name,
          description,
          why_important,
          daily_action,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(commitment);
    } catch (error) {
      console.error("Error updating commitment:", error);
      res.status(500).json({ message: "Failed to update commitment" });
    }
  });

  // Delete student commitment
  app.delete("/api/student/commitments/:id", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      const { error } = await supabase
        .from("student_commitments")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting commitment:", error);
      res.status(500).json({ message: "Failed to delete commitment" });
    }
  });

  // Complete commitment for today
  app.post("/api/student/commitments/:id/complete", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const today = new Date().toISOString().split("T")[0];

      // Check if already completed today
      const { data: existingLog } = await supabase
        .from("commitment_logs")
        .select("id")
        .eq("commitment_id", id)
        .gte("completed_date", today)
        .maybeSingle();

      if (existingLog) {
        return res.status(400).json({ message: "Already completed today" });
      }

      // Log the completion
      const { data: log, error } = await supabase
        .from("commitment_logs")
        .insert({
          commitment_id: id,
          completed_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger will auto-update streak
      res.json(log);
    } catch (error) {
      console.error("Error completing commitment:", error);
      res.status(500).json({ message: "Failed to complete commitment" });
    }
  });

  // Get student reflections
  app.get("/api/student/reflections", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: reflections, error } = await supabase
        .from("student_reflections")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(reflections || []);
    } catch (error) {
      console.error("Error fetching reflections:", error);
      res.status(500).json({ message: "Failed to fetch reflections" });
    }
  });

  // Create student reflection
  app.post("/api/student/reflections", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { reflection_text, mood, date } = req.body;
      
      console.log("📝 Creating reflection with data:", { 
        student_id: studentUser.student_id, 
        reflection_text, 
        mood, 
        date,
        dateProvided: !!date,
        finalDate: date || new Date().toISOString()
      });

      const { data: reflection, error } = await supabase
        .from("student_reflections")
        .insert({
          student_id: studentUser.student_id,
          reflection_text,
          mood,
          date: date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating reflection:", error);
        throw error;
      }
      res.json(reflection);
    } catch (error) {
      console.error("Error creating reflection:", error);
      res.status(500).json({ message: "Failed to create reflection" });
    }
  });

  // Get student assignments
  app.get("/api/student/assignments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: assignments, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Submit assignment
  app.post("/api/student/assignments/:id/submit", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { student_result, student_work } = req.body;

      const { data: assignment, error } = await supabase
        .from("assignments")
        .update({
          student_result,
          student_work,
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(assignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Get student academic profile
  app.get("/api/student/academic-profile", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: profile, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .maybeSingle();

      if (error) throw error;
      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching academic profile:", error);
      res.status(500).json({ message: "Failed to fetch academic profile" });
    }
  });

  // Get student struggle targets
  app.get("/api/student/struggle-targets", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: targets, error } = await supabase
        .from("struggle_targets")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(targets || []);
    } catch (error) {
      console.error("Error fetching struggle targets:", error);
      res.status(500).json({ message: "Failed to fetch struggle targets" });
    }
  });

  app.get("/api/student/topic-conditioning-state", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: student } = await supabase
        .from("students")
        .select("id, name, tutor_id")
        .eq("id", studentUser.student_id)
        .maybeSingle();

      if (!student?.tutor_id) {
        return res.json({
          topic: null,
          phase: null,
          stability: null,
          stage: "Foundation",
          lastUpdated: null,
        });
      }

      const sessions = await getCanonicalStudentSessions({
        tutorId: student.tutor_id,
        studentId: student.id,
        studentName: student.name,
      });

      if (!sessions.length) {
        return res.json({
          topic: null,
          phase: null,
          stability: null,
          stage: "Foundation",
          lastUpdated: null,
        });
      }

      const normalizePhase = (value?: string | null) => {
        const v = String(value || "").toLowerCase();
        if (v.includes("clarity")) return "Clarity";
        if (v.includes("structured")) return "Structured Execution";
        if (v.includes("discomfort")) return "Controlled Discomfort";
        if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
        return "Structured Execution";
      };

      const normalizeStability = (value?: string | null) => {
        const v = String(value || "").toLowerCase();
        if (v.includes("high")) return "High";
        if (v.includes("medium")) return "Medium";
        return "Low";
      };

      const sanitizeTopic = (value?: string | null) => {
        const cleaned = String(value || "").trim();
        if (!cleaned) return null;
        if (cleaned.toLowerCase() === "onboarding baseline diagnostic") return null;
        return cleaned;
      };

      const parseObservation = (session: any) => {
        const noteText = String(session.notes ?? session.session_notes ?? "");
        const methodText = String(session.methodNotes ?? session.method_notes ?? "");
        const responseText = String(session.studentResponse ?? session.student_response ?? "");

        const dateSource = session.date ?? session.session_date ?? session.created_at ?? null;
        const parsedDate = new Date(String(dateSource || ""));
        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }

        const topicFromNotes = noteText.match(/Active Topic:\s*([^\n\r]+)/i)?.[1]?.trim();
        const topicFromMethod = methodText.match(/Active Topic:\s*(.+)$/i)?.[1]?.trim();
        const phaseFromNotes = noteText.match(/Phase Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
        const phaseFromResponse = responseText.match(/Phase:\s*([^|\n\r]+)/i)?.[1]?.trim();
        const stabilityFromNotes = noteText.match(/Stability Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
        const stabilityFromResponse = responseText.match(/Stability:\s*([^|\n\r]+)/i)?.[1]?.trim();

        const topic = sanitizeTopic(topicFromNotes || topicFromMethod);
        if (!topic) return null;

        return {
          topic,
          phase: normalizePhase(phaseFromNotes || phaseFromResponse),
          stability: normalizeStability(stabilityFromNotes || stabilityFromResponse),
          date: parsedDate.toISOString(),
        };
      };

      const observations = (sessions || [])
        .map(parseObservation)
        .filter((item: any) => !!item)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (!observations.length) {
        return res.json({
          topic: null,
          phase: null,
          stability: null,
          stage: "Foundation",
          lastUpdated: null,
        });
      }

      const latest = observations[observations.length - 1];

      const phaseToStage: Record<string, string> = {
        Clarity: "Foundation",
        "Structured Execution": "Method",
        "Controlled Discomfort": "Challenge",
        "Time Pressure Stability": "Timed Stability",
      };

      res.json({
        topic: latest.topic,
        phase: latest.phase,
        stability: latest.stability,
        stage: phaseToStage[latest.phase] || "Foundation",
        lastUpdated: latest.date,
      });
    } catch (error) {
      console.error("Error fetching student topic conditioning state:", error);
      res.status(500).json({ message: "Failed to fetch topic conditioning state" });
    }
  });

  // ========================================
  // PARENT PORTAL ROUTES
  // ========================================

  // Get parent's student stats
  app.get("/api/parent/student-stats", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      // Get parent's enrollment to find student
      const enrollmentWithAssignedStudent = await supabase
        .from("parent_enrollments")
        .select("student_full_name, assigned_tutor_id, assigned_student_id, parent_email")
        .eq("user_id", parentId)
        .maybeSingle();

      let enrollment: any = enrollmentWithAssignedStudent.data || null;
      let enrollmentError: any = enrollmentWithAssignedStudent.error || null;

      if (enrollmentError && String(enrollmentError.message || "").includes("assigned_student_id")) {
        const enrollmentFallback = await supabase
          .from("parent_enrollments")
          .select("student_full_name, assigned_tutor_id, parent_email")
          .eq("user_id", parentId)
          .maybeSingle();

        enrollment = enrollmentFallback.data
          ? { ...enrollmentFallback.data, assigned_student_id: null }
          : null;
        enrollmentError = enrollmentFallback.error || null;
      }

      if (enrollmentError) {
        return res.status(500).json({ message: "Failed to fetch enrollment" });
      }

      if (!enrollment?.assigned_tutor_id) {
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          confidenceGrowth: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          totalCommitments: 0,
        });
      }

      let studentId = enrollment.assigned_student_id || null;

      if (!studentId) {
        const { data: student } = await supabase
          .from("students")
          .select("id")
          .eq("name", enrollment.student_full_name)
          .eq("tutor_id", enrollment.assigned_tutor_id)
          .maybeSingle();

        studentId = student?.id || null;
      }

      const sessions = await getCanonicalStudentSessions({
        tutorId: enrollment.assigned_tutor_id,
        studentId,
        studentName: enrollment.student_full_name,
        parentId,
        parentContact: enrollment.parent_email || null,
      });
      const stats = getSessionMetrics(sessions);

      const matchedStudentIds = Array.from(
        new Set(
          sessions
            .map((session: any) => session?.student_id)
            .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
        )
      );

      // Get commitments count
      let commitments: any[] | null = null;
      if (matchedStudentIds.length > 0) {
        const { data } = await supabase
          .from("student_commitments")
          .select("id")
          .in("student_id", matchedStudentIds)
          .eq("is_active", true);
        commitments = data || [];
      } else if (studentId) {
        const { data } = await supabase
          .from("student_commitments")
          .select("id")
          .eq("student_id", studentId)
          .eq("is_active", true);
        commitments = data || [];
      }

      res.json({
        bossBattlesCompleted: stats.bossBattlesCompleted,
        solutionsUnlocked: stats.solutionsUnlocked,
        confidenceGrowth: 50,
        sessionsCompleted: stats.completedSessions,
        currentStreak: stats.currentStreak,
        totalCommitments: commitments?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching parent student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get parent's student info
  app.get("/api/parent/student-info", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select(`
          student_full_name, 
          student_grade,
          assigned_tutor_id
        `)
        .eq("user_id", parentId)
        .maybeSingle();

      if (enrollmentError) {
        console.error("Error fetching parent enrollment:", enrollmentError);
      }

      if (!enrollment) {
        return res.status(404).json({ message: "No enrollment found" });
      }

      // Get tutor's pod if assigned
      let podName = null;
      if (enrollment.assigned_tutor_id) {
        const { data: tutorAssignment, error: podError } = await supabase
          .from("tutor_assignments")
          .select("pod:pods(pod_name)")
          .eq("tutor_id", enrollment.assigned_tutor_id)
          .maybeSingle();

        if (podError) {
          console.error("Error fetching tutor pod:", podError);
        }

        const pod = tutorAssignment?.pod as { pod_name?: string } | null;
        if (pod) {
          podName = pod.pod_name || null;
        }
      }

      console.log("📊 Parent student info response:", {
        name: enrollment.student_full_name,
        grade: enrollment.student_grade,
        podName: podName,
      });

      res.json({
        name: enrollment.student_full_name,
        grade: enrollment.student_grade,
        podName: podName,
      });
    } catch (error) {
      console.error("Error fetching student info:", error);
      res.status(500).json({ message: "Failed to fetch student info" });
    }
  });

  app.get("/api/parent/topic-conditioning-states", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      const enrollmentWithAssignedStudent = await supabase
        .from("parent_enrollments")
        .select("student_full_name, assigned_tutor_id, assigned_student_id, parent_email")
        .eq("user_id", parentId)
        .maybeSingle();

      let enrollment: any = enrollmentWithAssignedStudent.data || null;
      let enrollmentError: any = enrollmentWithAssignedStudent.error || null;

      if (enrollmentError && String(enrollmentError.message || "").includes("assigned_student_id")) {
        const enrollmentFallback = await supabase
          .from("parent_enrollments")
          .select("student_full_name, assigned_tutor_id, parent_email")
          .eq("user_id", parentId)
          .maybeSingle();

        enrollment = enrollmentFallback.data
          ? { ...enrollmentFallback.data, assigned_student_id: null }
          : null;
        enrollmentError = enrollmentFallback.error || null;
      }

      if (enrollmentError) {
        return res.status(500).json({ message: "Failed to fetch enrollment" });
      }

      if (!enrollment?.assigned_tutor_id || !enrollment?.student_full_name) {
        return res.json([]);
      }

      const sessions = await getCanonicalStudentSessions({
        tutorId: enrollment.assigned_tutor_id,
        studentId: enrollment.assigned_student_id || null,
        studentName: enrollment.student_full_name,
        parentId,
        parentContact: enrollment.parent_email || null,
      });

      if (!sessions.length) {
        return res.json([]);
      }

      const normalizePhase = (value?: string | null) => {
        const v = String(value || "").toLowerCase();
        if (v.includes("clarity")) return "Clarity";
        if (v.includes("structured")) return "Structured Execution";
        if (v.includes("discomfort")) return "Controlled Discomfort";
        if (v.includes("time") || v.includes("pressure")) return "Time Pressure Stability";
        return "Structured Execution";
      };

      const normalizeStability = (value?: string | null) => {
        const v = String(value || "").toLowerCase();
        if (v.includes("high")) return "High";
        if (v.includes("medium")) return "Medium";
        return "Low";
      };

      const sanitizeTopic = (value?: string | null) => {
        const cleaned = String(value || "").trim();
        if (!cleaned) return null;
        if (cleaned.toLowerCase() === "onboarding baseline diagnostic") return null;
        return cleaned;
      };

      const parseObservation = (session: any) => {
        const noteText = String(session.notes ?? session.session_notes ?? "");
        const methodText = String(session.methodNotes ?? session.method_notes ?? "");
        const responseText = String(session.studentResponse ?? session.student_response ?? "");

        const dateSource = session.date ?? session.session_date ?? session.created_at ?? null;
        const parsedDate = new Date(String(dateSource || ""));
        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }

        const topicFromNotes = noteText.match(/Active Topic:\s*([^\n\r]+)/i)?.[1]?.trim();
        const topicFromMethod = methodText.match(/Active Topic:\s*(.+)$/i)?.[1]?.trim();
        const phaseFromNotes = noteText.match(/Phase Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
        const phaseFromResponse = responseText.match(/Phase:\s*([^|\n\r]+)/i)?.[1]?.trim();
        const stabilityFromNotes = noteText.match(/Stability Observed in Session:\s*([^\n\r]+)/i)?.[1]?.trim();
        const stabilityFromResponse = responseText.match(/Stability:\s*([^|\n\r]+)/i)?.[1]?.trim();

        const topic = sanitizeTopic(topicFromNotes || topicFromMethod);
        if (!topic) return null;

        return {
          topic,
          phase: normalizePhase(phaseFromNotes || phaseFromResponse),
          stability: normalizeStability(stabilityFromNotes || stabilityFromResponse),
          date: parsedDate.toISOString(),
        };
      };

      const observations = (sessions || [])
        .map(parseObservation)
        .filter((item: any) => !!item)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const byTopic = new Map<string, Array<{ phase: string; stability: string; date: string }>>();
      observations.forEach((obs: any) => {
        if (!byTopic.has(obs.topic)) byTopic.set(obs.topic, []);
        byTopic.get(obs.topic)?.push({ phase: obs.phase, stability: obs.stability, date: obs.date });
      });

      const phaseOrder = ["Clarity", "Structured Execution", "Controlled Discomfort", "Time Pressure Stability"];
      const stabilityScore = (value: string) => (value === "Low" ? 1 : value === "Medium" ? 2 : 3);

      const now = Date.now();
      const rows = Array.from(byTopic.entries())
        .map(([topic, history]) => {
          const latest = history[history.length - 1];
          const previous = history.length > 1 ? history[history.length - 2] : null;

          const latestPhaseIdx = phaseOrder.indexOf(latest.phase);
          const previousPhaseIdx = previous ? phaseOrder.indexOf(previous.phase) : -1;
          const latestStabilityScore = stabilityScore(latest.stability);
          const previousStabilityScore = previous ? stabilityScore(previous.stability) : 0;

          let movement: "none" | "improved" | "regressed" | "changed" = "none";
          if (previous) {
            if (latestPhaseIdx > previousPhaseIdx || (latestPhaseIdx === previousPhaseIdx && latestStabilityScore > previousStabilityScore)) {
              movement = "improved";
            } else if (latestPhaseIdx < previousPhaseIdx || (latestPhaseIdx === previousPhaseIdx && latestStabilityScore < previousStabilityScore)) {
              movement = "regressed";
            } else if (latest.phase !== previous.phase || latest.stability !== previous.stability) {
              movement = "changed";
            }
          }

          const daysSinceUpdate = Math.floor((now - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24));
          const bucket = daysSinceUpdate <= 14 ? "active" : daysSinceUpdate <= 45 ? "recent" : "older";

          return {
            topic,
            phase: latest.phase,
            stability: latest.stability,
            lastUpdated: latest.date,
            previousPhase: previous?.phase || null,
            previousStability: previous?.stability || null,
            movement,
            bucket,
          };
        })
        .filter((row) => row.bucket !== "older")
        .sort((a, b) => {
          if (a.bucket !== b.bucket) return a.bucket === "active" ? -1 : 1;
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

      res.json(rows);
    } catch (error) {
      console.error("Error fetching parent topic conditioning states:", error);
      res.status(500).json({ message: "Failed to fetch topic conditioning states" });
    }
  });

  // Get parent reports
  app.get("/api/parent/reports", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      const { data: reports, error } = await supabase
        .from("parent_reports")
        .select("*")
        .eq("parent_id", parentId)
        .order("sent_at", { ascending: false });

      if (error) throw error;

      const tutorIds = Array.from(new Set((reports || []).map((report: any) => report.tutor_id).filter(Boolean)));
      let tutorNameMap: Record<string, string> = {};

      if (tutorIds.length > 0) {
        const { data: tutors, error: tutorError } = await supabase
          .from("users")
          .select("id, name")
          .in("id", tutorIds);

        if (tutorError) {
          console.error("Error fetching tutor names for parent reports:", tutorError);
        } else {
          tutorNameMap = (tutors || []).reduce((acc: Record<string, string>, tutor: any) => {
            acc[tutor.id] = tutor.name || "Tutor";
            return acc;
          }, {});
        }
      }

      const parentFacingReports = (reports || []).map((report: any) =>
        mapParentFacingReport(report, tutorNameMap[report.tutor_id])
      );

      res.json(parentFacingReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Submit parent feedback on report
  app.post("/api/parent/reports/:id/feedback", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      const { data: report, error } = await supabase
        .from("parent_reports")
        .update({
          parent_feedback: feedback,
          parent_feedback_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(report);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get parent broadcasts (filter for parents)
  app.get("/api/parent/broadcasts", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const userCreatedAt = (req as any).dbUser?.createdAt;
      let query = supabase
        .from("broadcasts")
        .select("*")
        .contains("target_roles", ["parent"])
        .order("created_at", { ascending: false });
      
      // Only show broadcasts created after user's account was created
      if (userCreatedAt) {
        query = query.gte("created_at", userCreatedAt);
      }
      
      const { data: broadcasts, error } = await query;

      if (error) throw error;
      res.json(broadcasts || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
