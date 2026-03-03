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
import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import cors from 'cors';
// Only import Vite-related stuff in development
var isDev = process.env.NODE_ENV === 'development';
var app = express();
// CORS configuration - allow localhost for dev, same-origin in production
app.use(cors({
    origin: function (origin, callback) {
        var _a;
        if (!origin)
            return callback(null, true);
        var allowedOrigins = [
            'https://app.territorialtutoring.co.za',
            'https://api.territorialtutoring.co.za',
            'https://www.territorialtutoring.co.za',
        ];
        var isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        var isHttps = /^https:\/\//.test(origin);
        if (isLocal ||
            allowedOrigins.includes(origin) ||
            ((_a = origin === null || origin === void 0 ? void 0 : origin.endsWith) === null || _a === void 0 ? void 0 : _a.call(origin, '.vercel.app'))) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS: ".concat(origin)));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({
    limit: '50mb',
    verify: function (req, _res, buf) {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
// Log all incoming requests
app.use(function (req, res, next) {
    console.log("[".concat(new Date().toLocaleTimeString(), "] ").concat(req.method, " ").concat(req.path));
    next();
});
app.use(function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        if (path.startsWith("/api")) {
            var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
            if (capturedJsonResponse) {
                logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            console.log("[express] ".concat(logLine));
        }
    });
    next();
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server, portEnv, port, finalPort;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, registerRoutes(app)];
            case 1:
                server = _a.sent();
                app.use(function (err, _req, res, _next) {
                    var status = err.status || err.statusCode || 500;
                    var message = err.message || "Internal Server Error";
                    res.status(status).json({ message: message });
                    throw err;
                });
                portEnv = process.env.PORT;
                console.log("[express] PORT env value: \"".concat(portEnv, "\""));
                port = portEnv ? parseInt(portEnv, 10) : 5000;
                if (isNaN(port) || port < 0 || port > 65535) {
                    console.error("Invalid PORT: ".concat(portEnv, ", using 5000"));
                }
                finalPort = isNaN(port) ? 5000 : port;
                server.listen({
                    port: finalPort,
                    host: "0.0.0.0"
                }, function () {
                    console.log("[express] serving on port ".concat(finalPort));
                });
                return [2 /*return*/];
        }
    });
}); })();
