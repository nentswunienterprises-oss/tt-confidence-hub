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
import { supabase } from "./supabaseClient";
import { API_URL } from "./config";
export function authorizedGetJson(path) {
    return __awaiter(this, void 0, void 0, function () {
        var session, headers, fullUrl, res, text, contentType, text, origin_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    session = (_a.sent()).data.session;
                    headers = {};
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        headers.Authorization = "Bearer ".concat(session.access_token);
                        console.log("🔐 authorizedGetJson: using Supabase token");
                    }
                    else {
                        console.warn("⚠️ authorizedGetJson: no Supabase token, relying on cookies");
                    }
                    fullUrl = API_URL + path;
                    console.log("🔗 authorizedGetJson: GET", fullUrl);
                    return [4 /*yield*/, fetch(fullUrl, {
                            headers: headers,
                            credentials: "include",
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 3:
                    text = _a.sent();
                    throw new Error("".concat(res.status, ": ").concat(text));
                case 4:
                    contentType = res.headers.get("content-type") || "";
                    if (!!contentType.includes("application/json")) return [3 /*break*/, 6];
                    return [4 /*yield*/, res.text()];
                case 5:
                    text = _a.sent();
                    origin_1 = typeof window !== 'undefined' ? window.location.origin : 'server';
                    throw new Error("Invalid content-type from ".concat(fullUrl, " (origin ").concat(origin_1, "): ").concat(contentType, ". Body: ").concat(text.substring(0, 200)));
                case 6: return [4 /*yield*/, res.json()];
                case 7: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
