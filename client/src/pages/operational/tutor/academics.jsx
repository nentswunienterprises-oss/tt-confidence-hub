var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
// Grade Submission Form
var GradeSubmissionForm = function () {
    var _a = useState([]), grades = _a[0], setGrades = _a[1];
    var _b = useState(""), quarter = _b[0], setQuarter = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var _d = useState(""), success = _d[0], setSuccess = _d[1];
    var _e = useState(false), loading = _e[0], setLoading = _e[1];
    var handleGradeChange = function (idx, field, value) {
        var updated = __spreadArray([], grades, true);
        updated[idx][field] = value;
        setGrades(updated);
    };
    var addGrade = function () { return setGrades(__spreadArray(__spreadArray([], grades, true), [{ subject: "", grade: "" }], false)); };
    var removeGrade = function (idx) { return setGrades(grades.filter(function (_, i) { return i !== idx; })); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var validGrades, res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setSuccess("");
                    setLoading(true);
                    validGrades = grades.filter(function (g) { return g.subject.trim() && g.grade.trim(); });
                    if (!quarter) {
                        setError("Quarter required");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    if (validGrades.length === 0) {
                        setError("At least one grade required");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/tutor/grades", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ quarter: quarter, grades: validGrades }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (!res.ok) {
                        setError(data.message || "Error submitting grades");
                    }
                    else {
                        setSuccess("Grades submitted successfully");
                        setGrades([]);
                        setQuarter("");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    setError("Network error");
                    return [3 /*break*/, 5];
                case 5:
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-medium">Quarter</label>
        <input type="text" value={quarter} onChange={function (e) { return setQuarter(e.target.value); }} className="border rounded px-2 py-1 w-full" placeholder="e.g. Q1 2026"/>
      </div>
      <div>
        <label className="font-medium">Grades</label>
        {grades.map(function (g, idx) { return (<div key={idx} className="flex gap-2 mb-2">
            <input type="text" value={g.subject} onChange={function (e) { return handleGradeChange(idx, "subject", e.target.value); }} className="border rounded px-2 py-1 flex-1" placeholder="Subject name"/>
            <input type="text" value={g.grade} onChange={function (e) { return handleGradeChange(idx, "grade", e.target.value); }} className="border rounded px-2 py-1 w-24" placeholder="Grade"/>
            {grades.length > 1 && (<button type="button" onClick={function () { return removeGrade(idx); }} className="text-red-600">Remove</button>)}
          </div>); })}
        <button type="button" onClick={addGrade} className="mt-2 text-blue-600">Add Grade</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
        {loading ? "Submitting..." : "Submit Grades"}
      </button>
    </form>);
};
export default function TutorGradeMonitoring() {
    return (<DashboardLayout>
      <div className="space-y-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Subject Declaration (Tutor)</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectDeclarationForm />
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Grade Submission (Tutor)</CardTitle>
          </CardHeader>
          <CardContent>
            <GradeSubmissionForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>);
}
var SubjectDeclarationForm = function () {
    var _a = useState([""]), subjects = _a[0], setSubjects = _a[1];
    var _b = useState(""), academicYear = _b[0], setAcademicYear = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var _d = useState(""), success = _d[0], setSuccess = _d[1];
    var _e = useState(false), loading = _e[0], setLoading = _e[1];
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var trimmed, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setSuccess("");
                    setLoading(true);
                    trimmed = subjects.map(function (s) { return s.trim(); }).filter(Boolean);
                    if (!academicYear) {
                        setError("Academic year required");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    if (trimmed.length === 0) {
                        setError("At least one subject required");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    if (new Set(trimmed).size !== trimmed.length) {
                        setError("Duplicate subject names");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/tutor/subjects", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ subjects: trimmed, academicYear: academicYear }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (!res.ok) {
                        setError(data.message || "Error submitting subjects");
                    }
                    else {
                        setSuccess("Subjects declared and locked for academic year");
                        setSubjects([""]);
                        setAcademicYear("");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    setError("Network error");
                    return [3 /*break*/, 5];
                case 5:
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSubjectChange = function (idx, value) {
        var updated = __spreadArray([], subjects, true);
        updated[idx] = value;
        setSubjects(updated);
    };
    var addSubject = function () { return setSubjects(__spreadArray(__spreadArray([], subjects, true), [""], false)); };
    var removeSubject = function (idx) { return setSubjects(subjects.filter(function (_, i) { return i !== idx; })); };
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-medium">Academic Year</label>
        <input type="text" value={academicYear} onChange={function (e) { return setAcademicYear(e.target.value); }} className="border rounded px-2 py-1 w-full" placeholder="e.g. 2026"/>
      </div>
      <div>
        <label className="font-medium">Subjects</label>
        {subjects.map(function (subject, idx) { return (<div key={idx} className="flex gap-2 mb-2">
            <input type="text" value={subject} onChange={function (e) { return handleSubjectChange(idx, e.target.value); }} className="border rounded px-2 py-1 flex-1" placeholder="Subject name"/>
            {subjects.length > 1 && (<button type="button" onClick={function () { return removeSubject(idx); }} className="text-red-600">Remove</button>)}
          </div>); })}
        <button type="button" onClick={addSubject} className="mt-2 text-blue-600">Add Subject</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
        {loading ? "Submitting..." : "Declare Subjects"}
      </button>
    </form>);
};
