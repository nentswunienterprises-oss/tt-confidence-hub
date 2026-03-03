var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
// TT Content Pillars
var PILLARS = [
    { id: "response-training", label: "Response Training", description: "How we condition execution under pressure" },
    { id: "pressure-environment", label: "Pressure Environment", description: "The arena where response breaks down" },
    { id: "calm-execution", label: "Calm Execution", description: "The behavioral outcome we train" },
    { id: "structure", label: "Structure", description: "The system that removes panic" },
];
// Situations (contexts for the message)
var SITUATIONS = [
    { id: "enrollment", label: "Enrollment", description: "Parent considering TT" },
    { id: "onboarding", label: "Onboarding", description: "New family joining" },
    { id: "progress", label: "Progress Update", description: "Mid-term status" },
    { id: "exam-prep", label: "Exam Preparation", description: "High-pressure period" },
    { id: "retention", label: "Retention", description: "Renewal or continued engagement" },
    { id: "referral", label: "Referral", description: "Existing family sharing TT" },
];
// Audiences
var AUDIENCES = [
    { id: "parent", label: "Parent", description: "Decision maker, seeks relief" },
    { id: "student", label: "Student", description: "Performer, needs structure" },
    { id: "tutor", label: "Tutor", description: "Operator, executes system" },
];
// Platforms
var PLATFORMS = [
    { id: "instagram", label: "Instagram", description: "Square or 4:5 format" },
    { id: "tiktok", label: "TikTok", description: "9:16 vertical format" },
];
export default function CarouselSelect() {
    var _a, _b, _c;
    var navigate = useNavigate();
    var _d = useState("pillar"), currentStep = _d[0], setCurrentStep = _d[1];
    var _e = useState({
        pillar: "",
        situation: "",
        audience: "",
        platform: "",
    }), selections = _e[0], setSelections = _e[1];
    var handleSelect = function (step, value) {
        setSelections(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[step] = value, _a)));
        });
        // Auto-advance to next step
        if (step === "pillar")
            setCurrentStep("situation");
        else if (step === "situation")
            setCurrentStep("audience");
        else if (step === "audience")
            setCurrentStep("platform");
        else if (step === "platform") {
            // All selections made, proceed to editor
            var params = new URLSearchParams({
                pillar: selections.pillar,
                situation: selections.situation,
                audience: selections.audience,
                platform: value,
            });
            navigate("/media/carousel/create?".concat(params.toString()));
        }
    };
    var handleBack = function () {
        if (currentStep === "situation")
            setCurrentStep("pillar");
        else if (currentStep === "audience")
            setCurrentStep("situation");
        else if (currentStep === "platform")
            setCurrentStep("audience");
        else
            navigate("/media");
    };
    var getStepData = function () {
        switch (currentStep) {
            case "pillar":
                return { title: "Select Pillar", items: PILLARS };
            case "situation":
                return { title: "Select Situation", items: SITUATIONS };
            case "audience":
                return { title: "Select Audience", items: AUDIENCES };
            case "platform":
                return { title: "Select Platform", items: PLATFORMS };
        }
    };
    var stepData = getStepData();
    return (<div className="min-h-screen bg-[#FFF5ED]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 bg-[#FFF5ED]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              <ChevronLeft className="w-5 h-5"/>
              Back
            </button>
            <div className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
              Step {["pillar", "situation", "audience", "platform"].indexOf(currentStep) + 1} of 4
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl tracking-tight text-[#1A1A1A] mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
            {stepData.title.toUpperCase()}
          </h1>
          <div className="h-1 w-16 bg-[#E63946]"></div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap gap-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          {selections.pillar && (<span className="text-[#1A1A1A]/60">
              {(_a = PILLARS.find(function (p) { return p.id === selections.pillar; })) === null || _a === void 0 ? void 0 : _a.label}
            </span>)}
          {selections.situation && (<>
              <span className="text-[#1A1A1A]/40">/</span>
              <span className="text-[#1A1A1A]/60">
                {(_b = SITUATIONS.find(function (s) { return s.id === selections.situation; })) === null || _b === void 0 ? void 0 : _b.label}
              </span>
            </>)}
          {selections.audience && (<>
              <span className="text-[#1A1A1A]/40">/</span>
              <span className="text-[#1A1A1A]/60">
                {(_c = AUDIENCES.find(function (a) { return a.id === selections.audience; })) === null || _c === void 0 ? void 0 : _c.label}
              </span>
            </>)}
        </div>

        {/* Selection Grid */}
        <div className="grid gap-4">
          {stepData.items.map(function (item) { return (<button key={item.id} onClick={function () { return handleSelect(currentStep, item.id); }} className="group w-full p-6 bg-white border-2 border-[#1A1A1A]/10 hover:border-[#E63946] transition-all text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xl font-bold text-[#1A1A1A] mb-1 group-hover:text-[#E63946] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.label}
                  </div>
                  <div className="text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.description}
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-[#1A1A1A]/20 group-hover:border-[#E63946] rounded-full flex items-center justify-center transition-colors">
                  <div className="w-3 h-3 bg-[#E63946] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </button>); })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#1A1A1A]/10">
          <p className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
            No blank states. Only trained responses.
          </p>
        </div>
      </div>
    </div>);
}
