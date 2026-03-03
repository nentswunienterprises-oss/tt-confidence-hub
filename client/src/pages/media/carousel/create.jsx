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
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Download, Plus, Trash2, Type, Move, Group, ZoomIn, ZoomOut, Copy, Lock, Unlock, AlignLeft, AlignRight, AlignHorizontalJustifyCenter, Layers, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";
var TT_COLORS = [
    { id: "pink", value: "#FFF0F0", label: "Light Pink" },
    { id: "white", value: "#FFFFFF", label: "White" },
    { id: "red", value: "#E63946", label: "Red" },
    { id: "cream", value: "#FFF5ED", label: "Cream" },
];
var CANVAS_WIDTH = 1080;
var CANVAS_HEIGHT = 1080;
export default function CarouselCreate() {
    var _this = this;
    var navigate = useNavigate();
    var searchParams = useSearchParams()[0];
    var canvasRef = useRef(null);
    var pillar = searchParams.get("pillar") || "";
    var situation = searchParams.get("situation") || "";
    var audience = searchParams.get("audience") || "";
    var platform = searchParams.get("platform") || "";
    var loadId = searchParams.get("load");
    var carouselId = useState(loadId || "carousel-".concat(Date.now()))[0];
    var _a = useState([
        {
            id: "1",
            slideType: "hook",
            elements: [
                {
                    id: "text-1",
                    type: "text",
                    content: "THE\n<color:#E63946>MOMENT</color>\nA STUDENT\nACTUALLY\nFAILS",
                    x: 80,
                    y: 180,
                    fontSize: 120,
                    fontFamily: "Anton",
                    color: "#FFF0F0",
                    align: "left",
                    lineHeight: 140,
                },
                {
                    id: "icon-1",
                    type: "icon",
                    iconType: "arrow-circle",
                    x: CANVAS_WIDTH - 150,
                    y: 300,
                    size: 100,
                    color: "#E63946",
                    arrowColor: "#1A1A1A",
                },
            ],
        },
    ]), slides = _a[0], setSlides = _a[1];
    var _b = useState(0), currentSlideIndex = _b[0], setCurrentSlideIndex = _b[1];
    var _c = useState([]), selectedElementIds = _c[0], setSelectedElementIds = _c[1];
    var _d = useState(false), isDragging = _d[0], setIsDragging = _d[1];
    var _e = useState({ x: 0, y: 0 }), dragStart = _e[0], setDragStart = _e[1];
    var _f = useState(0.5), zoom = _f[0], setZoom = _f[1]; // 50% zoom to fit in viewport
    var _g = useState(true), showLayers = _g[0], setShowLayers = _g[1];
    var _h = useState(null), editingTextId = _h[0], setEditingTextId = _h[1];
    var _j = useState(""), editingText = _j[0], setEditingText = _j[1];
    var _k = useState(null), textSelection = _k[0], setTextSelection = _k[1];
    var _l = useState(false), colorsApplied = _l[0], setColorsApplied = _l[1];
    var _m = useState(null), hoveredElementId = _m[0], setHoveredElementId = _m[1];
    var _o = useState([slides]), history = _o[0], setHistory = _o[1];
    var _p = useState(0), historyIndex = _p[0], setHistoryIndex = _p[1];
    var _q = useState(Date.now()), lastSaved = _q[0], setLastSaved = _q[1];
    var _r = useState("The Moment"), carouselName = _r[0], setCarouselName = _r[1];
    var editInputRef = useRef(null);
    var currentSlide = slides[currentSlideIndex];
    // Load saved carousel if loadId provided
    useEffect(function () {
        if (loadId) {
            var saved = localStorage.getItem("tt-carousels");
            if (saved) {
                var carousels = JSON.parse(saved);
                var carousel = carousels.find(function (c) { return c.id === loadId; });
                if (carousel) {
                    setSlides(carousel.slides);
                    setCarouselName(carousel.name);
                }
            }
        }
    }, [loadId]);
    // Auto-save carousel
    useEffect(function () {
        var timeoutId = setTimeout(function () {
            var saved = localStorage.getItem("tt-carousels");
            var carousels = saved ? JSON.parse(saved) : [];
            var existingIndex = carousels.findIndex(function (c) { return c.id === carouselId; });
            var carouselData = {
                id: carouselId,
                name: carouselName,
                slides: slides,
                lastModified: Date.now(),
                pillar: pillar,
                situation: situation,
                audience: audience,
                platform: platform,
            };
            if (existingIndex >= 0) {
                carousels[existingIndex] = carouselData;
            }
            else {
                carousels.push(carouselData);
            }
            localStorage.setItem("tt-carousels", JSON.stringify(carousels));
        }, 2000); // Save 2 seconds after last change
        return function () { return clearTimeout(timeoutId); };
    }, [slides, carouselName, carouselId, pillar, situation, audience, platform]);
    // Load fonts
    useEffect(function () {
        var loadFonts = function () { return __awaiter(_this, void 0, void 0, function () {
            var antonFont, interFont;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        antonFont = new FontFace('Anton', 'url(https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8.woff2)');
                        interFont = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)');
                        return [4 /*yield*/, antonFont.load()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, interFont.load()];
                    case 2:
                        _a.sent();
                        document.fonts.add(antonFont);
                        document.fonts.add(interFont);
                        renderSlide();
                        return [2 /*return*/];
                }
            });
        }); };
        loadFonts();
    }, []);
    // Render slide on canvas whenever it changes
    useEffect(function () {
        renderSlide();
    }, [currentSlideIndex, slides, selectedElementIds, hoveredElementId, editingTextId, isDragging]);
    // Autosave to history (undo/redo)
    useEffect(function () {
        var timeoutId = setTimeout(function () {
            setHistory(function (prev) {
                var newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(JSON.parse(JSON.stringify(slides)));
                return newHistory.slice(-50); // Keep last 50 states
            });
            setHistoryIndex(function (prev) { return Math.min(prev + 1, 49); });
            setLastSaved(Date.now());
        }, 500);
        return function () { return clearTimeout(timeoutId); };
    }, [slides]);
    var exitEditMode = function () {
        if (editingTextId) {
            // Only update if no colors were applied (to avoid overwriting color tags)
            if (!colorsApplied) {
                updateElement(editingTextId, { content: editingText });
            }
            setEditingTextId(null);
            setEditingText("");
            setTextSelection(null);
            setColorsApplied(false);
        }
    };
    var applyColorToSelection = function (color) {
        if (!editingTextId || !textSelection)
            return;
        var start = textSelection.start, end = textSelection.end;
        if (start === end)
            return; // No selection
        // Get the current element to work with its actual content (which may have color tags)
        var element = currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.elements.find(function (el) { return el.id === editingTextId; });
        if (!element || element.type !== 'text')
            return;
        // Work with the element's actual content (with any existing tags)
        var currentContent = element.content;
        // Strip tags to find the position in clean text
        var cleanText = stripColorTags(currentContent);
        // Find where to insert the color tag in the actual content
        // This is a simplified approach - we'll rebuild from the clean text with the new color
        var before = cleanText.substring(0, start);
        var selected = cleanText.substring(start, end);
        var after = cleanText.substring(end);
        // Build new content with color tag
        var newContent = before + "<color:".concat(color, ">").concat(selected, "</color>") + after;
        // Update the element
        updateElement(editingTextId, { content: newContent });
        // Mark that we've applied colors
        setColorsApplied(true);
        // Update editingText to stay in sync (keep it clean for display)
        // Don't change editingText - keep it clean for continued editing
    };
    // Handle keyboard shortcuts
    useEffect(function () {
        var handleKeyDown = function (e) {
            if (e.key === "Escape" && editingTextId) {
                exitEditMode();
            }
            // Undo: Ctrl+Z
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey && historyIndex > 0) {
                e.preventDefault();
                setHistoryIndex(function (prev) { return prev - 1; });
                setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
            }
            // Redo: Ctrl+Shift+Z or Ctrl+Y
            if (((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) && historyIndex < history.length - 1) {
                e.preventDefault();
                setHistoryIndex(function (prev) { return prev + 1; });
                setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    }, [editingTextId, editingText, history, historyIndex]);
    var renderSlide = function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        // Clear canvas - Dark background
        ctx.fillStyle = "#1A1A1A";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        var slide = slides[currentSlideIndex];
        if (!slide)
            return;
        // Render all elements
        slide.elements.forEach(function (element) {
            // Show outline when element is selected
            var isSelected = selectedElementIds.includes(element.id);
            if (isSelected) {
                ctx.save();
                ctx.strokeStyle = '#E63946';
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.8;
                if (element.type === 'text') {
                    var lines = element.content.split('\n');
                    var height = lines.length * element.lineHeight;
                    var width = 700; // Wider to encompass full text
                    ctx.strokeRect(element.x - 15, element.y - element.fontSize - 10, width, height + 30);
                }
                else if (element.type === 'icon') {
                    ctx.beginPath();
                    ctx.arc(element.x, element.y, element.size / 2 + 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }
            // Render element
            if (element.type === "text") {
                renderTextElement(ctx, element);
            }
            else if (element.type === "icon") {
                renderIconElement(ctx, element);
            }
        });
        // Render hover state (subtle glow for non-selected elements)
        if (hoveredElementId && !selectedElementIds.includes(hoveredElementId)) {
            var hoveredEl = slide.elements.find(function (el) { return el.id === hoveredElementId; });
            if (hoveredEl) {
                ctx.save();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3;
                ctx.setLineDash([4, 4]);
                if (hoveredEl.type === 'text') {
                    var lines = hoveredEl.content.split('\n');
                    var height = lines.length * hoveredEl.lineHeight;
                    var width = 700;
                    ctx.strokeRect(hoveredEl.x - 15, hoveredEl.y - hoveredEl.fontSize - 10, width, height + 30);
                }
                else if (hoveredEl.type === 'icon') {
                    ctx.beginPath();
                    ctx.arc(hoveredEl.x, hoveredEl.y, hoveredEl.size / 2 + 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    };
    var renderTextElement = function (ctx, element) {
        ctx.font = "bold ".concat(element.fontSize, "px ").concat(element.fontFamily, ", sans-serif");
        ctx.textAlign = element.align;
        var lines = element.content.split("\n");
        var y = element.y;
        lines.forEach(function (line) {
            if (line.trim()) {
                renderColoredLine(ctx, line, element.x, y, element.color);
                y += element.lineHeight;
            }
        });
    };
    var renderIconElement = function (ctx, element) {
        if (element.iconType === "arrow-circle") {
            var radius = element.size / 2;
            // Circle
            ctx.fillStyle = element.color;
            ctx.beginPath();
            ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            // Arrow
            ctx.strokeStyle = element.arrowColor;
            ctx.lineWidth = 8;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(element.x - 15, element.y - 15);
            ctx.lineTo(element.x + 10, element.y);
            ctx.lineTo(element.x - 15, element.y + 15);
            ctx.stroke();
        }
    };
    var renderSelectionBox = function (ctx, element) {
        ctx.strokeStyle = "#E63946";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if (element.type === "text") {
            var lines = element.content.split("\n");
            var height = lines.length * element.lineHeight;
            var width = 600; // Approximate width
            ctx.strokeRect(element.x - 10, element.y - element.fontSize, width, height + 20);
        }
        else if (element.type === "icon") {
            var radius = element.size / 2;
            ctx.strokeRect(element.x - radius - 10, element.y - radius - 10, element.size + 20, element.size + 20);
        }
        ctx.setLineDash([]);
    };
    var renderColoredLine = function (ctx, line, x, y, defaultColor) {
        var segments = parseColoredText(line, defaultColor);
        var currentX = x;
        segments.forEach(function (segment) {
            ctx.fillStyle = segment.color;
            ctx.fillText(segment.text, currentX, y);
            currentX += ctx.measureText(segment.text).width;
        });
    };
    var parseColoredText = function (text, defaultColor) {
        var segments = [];
        var colorRegex = /<color:(#[0-9A-Fa-f]{6})>(.*?)<\/color>/g;
        var lastIndex = 0;
        var match;
        while ((match = colorRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({
                    text: text.substring(lastIndex, match.index),
                    color: defaultColor,
                });
            }
            segments.push({
                text: match[2],
                color: match[1],
            });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            segments.push({
                text: text.substring(lastIndex),
                color: defaultColor,
            });
        }
        return segments.length > 0 ? segments : [{ text: text, color: defaultColor }];
    };
    var wrapText = function (ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = "";
        words.forEach(function (word) {
            var testLine = currentLine ? "".concat(currentLine, " ").concat(word) : word;
            var metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            }
            else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    };
    // Canvas interaction handlers
    var getCanvasCoordinates = function (e) {
        var canvas = canvasRef.current;
        if (!canvas)
            return { x: 0, y: 0 };
        var rect = canvas.getBoundingClientRect();
        var scaleX = CANVAS_WIDTH / rect.width;
        var scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };
    var getElementAtPosition = function (x, y) {
        var slide = slides[currentSlideIndex];
        if (!slide)
            return null;
        // Check in reverse order (top to bottom)
        for (var i = slide.elements.length - 1; i >= 0; i--) {
            var element = slide.elements[i];
            if (element.type === "text") {
                var lines = element.content.split("\n");
                var height = lines.length * element.lineHeight;
                var width = 600; // Approximate
                if (x >= element.x - 10 &&
                    x <= element.x + width &&
                    y >= element.y - element.fontSize &&
                    y <= element.y + height) {
                    return element;
                }
            }
            else if (element.type === "icon") {
                var radius = element.size / 2;
                var distance = Math.sqrt(Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2));
                if (distance <= radius + 10) {
                    return element;
                }
            }
        }
        return null;
    };
    var handleCanvasMouseDown = function (e) {
        var coords = getCanvasCoordinates(e);
        var element = getElementAtPosition(coords.x, coords.y);
        // Exit edit mode when clicking canvas (anywhere)
        if (editingTextId) {
            exitEditMode();
            // If clicking empty space, also deselect
            if (!element) {
                setSelectedElementIds([]);
            }
            return;
        }
        if (element) {
            if (e.shiftKey && selectedElementIds.includes(element.id)) {
                // Deselect if already selected
                setSelectedElementIds(function (prev) { return prev.filter(function (id) { return id !== element.id; }); });
            }
            else if (e.shiftKey) {
                // Add to selection
                setSelectedElementIds(function (prev) { return __spreadArray(__spreadArray([], prev, true), [element.id], false); });
            }
            else if (!selectedElementIds.includes(element.id)) {
                // Select only this element
                setSelectedElementIds([element.id]);
            }
            setIsDragging(true);
            setDragStart(coords);
        }
        else {
            // Click on empty space - deselect all
            setSelectedElementIds([]);
        }
    };
    var stripColorTags = function (text) {
        return text.replace(/<color:#[0-9A-Fa-f]{6}>(.*?)<\/color>/g, '$1');
    };
    var handleCanvasMouseMove = function (e) {
        var coords = getCanvasCoordinates(e);
        // Update hover state
        if (!isDragging && !editingTextId) {
            var element = getElementAtPosition(coords.x, coords.y);
            setHoveredElementId((element === null || element === void 0 ? void 0 : element.id) || null);
        }
        if (!isDragging || selectedElementIds.length === 0)
            return;
        var deltaX = coords.x - dragStart.x;
        var deltaY = coords.y - dragStart.y;
        updateElementPositions(deltaX, deltaY);
        setDragStart(coords);
    };
    var handleCanvasMouseUp = function () {
        setIsDragging(false);
    };
    var updateElementPositions = function (deltaX, deltaY) {
        var newSlides = __spreadArray([], slides, true);
        var slide = newSlides[currentSlideIndex];
        slide.elements = slide.elements.map(function (element) {
            if (selectedElementIds.includes(element.id)) {
                if (element.type === "text" || element.type === "icon") {
                    return __assign(__assign({}, element), { x: element.x + deltaX, y: element.y + deltaY });
                }
            }
            return element;
        });
        setSlides(newSlides);
    };
    var updateElement = function (elementId, updates) {
        var newSlides = __spreadArray([], slides, true);
        var slide = newSlides[currentSlideIndex];
        slide.elements = slide.elements.map(function (element) {
            if (element.id === elementId) {
                return __assign(__assign({}, element), updates);
            }
            return element;
        });
        setSlides(newSlides);
    };
    var addTextElement = function () {
        var newElement = {
            id: "text-".concat(Date.now()),
            type: "text",
            content: "New Text",
            x: 200,
            y: 300,
            fontSize: (currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.slideType) === "hook" ? 120 : 56,
            fontFamily: (currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.slideType) === "hook" ? "Anton" : "Inter",
            color: "#FFF0F0",
            align: "left",
            lineHeight: (currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.slideType) === "hook" ? 140 : 75,
        };
        var newSlides = __spreadArray([], slides, true);
        newSlides[currentSlideIndex].elements.push(newElement);
        setSlides(newSlides);
        setSelectedElementIds([newElement.id]);
    };
    var addIconElement = function () {
        var newElement = {
            id: "icon-".concat(Date.now()),
            type: "icon",
            iconType: "arrow-circle",
            x: 500,
            y: 400,
            size: 100,
            color: "#E63946",
            arrowColor: "#1A1A1A",
        };
        var newSlides = __spreadArray([], slides, true);
        newSlides[currentSlideIndex].elements.push(newElement);
        setSlides(newSlides);
        setSelectedElementIds([newElement.id]);
    };
    var deleteSelectedElements = function () {
        var newSlides = __spreadArray([], slides, true);
        var slide = newSlides[currentSlideIndex];
        slide.elements = slide.elements.filter(function (element) { return !selectedElementIds.includes(element.id); });
        setSlides(newSlides);
        setSelectedElementIds([]);
    };
    var groupSelectedElements = function () {
        if (selectedElementIds.length < 2)
            return;
        var newGroup = {
            id: "group-".concat(Date.now()),
            type: "group",
            elementIds: __spreadArray([], selectedElementIds, true),
            x: 0,
            y: 0,
            zIndex: Math.max.apply(Math, slides[currentSlideIndex].elements.map(function (e) { return e.zIndex || 0; })) + 1,
        };
        var newSlides = __spreadArray([], slides, true);
        newSlides[currentSlideIndex].elements.push(newGroup);
        setSlides(newSlides);
    };
    var duplicateSelected = function () {
        var _a;
        if (selectedElementIds.length === 0)
            return;
        var newSlides = __spreadArray([], slides, true);
        var slide = newSlides[currentSlideIndex];
        var newElements = [];
        var newIds = [];
        selectedElementIds.forEach(function (id) {
            var element = slide.elements.find(function (el) { return el.id === id; });
            if (element && element.type !== "group") {
                var newId = "".concat(element.type, "-").concat(Date.now(), "-").concat(Math.random());
                var newElement = __assign(__assign({}, element), { id: newId, x: element.x + 20, y: element.y + 20 });
                newElements.push(newElement);
                newIds.push(newId);
            }
        });
        (_a = slide.elements).push.apply(_a, newElements);
        setSlides(newSlides);
        setSelectedElementIds(newIds);
    };
    var toggleLock = function (elementId) {
        var element = slides[currentSlideIndex].elements.find(function (el) { return el.id === elementId; });
        if (element && element.type !== "group") {
            updateElement(elementId, { locked: !element.locked });
        }
    };
    var toggleVisibility = function (elementId) {
        var element = slides[currentSlideIndex].elements.find(function (el) { return el.id === elementId; });
        if (element && element.type !== "group") {
            updateElement(elementId, { visible: element.visible === false ? true : false });
        }
    };
    var bringToFront = function () {
        if (selectedElementIds.length === 0)
            return;
        var maxZ = Math.max.apply(Math, slides[currentSlideIndex].elements.map(function (e) { return e.zIndex || 0; }));
        selectedElementIds.forEach(function (id) {
            updateElement(id, { zIndex: maxZ + 1 });
        });
    };
    var sendToBack = function () {
        if (selectedElementIds.length === 0)
            return;
        var minZ = Math.min.apply(Math, slides[currentSlideIndex].elements.map(function (e) { return e.zIndex || 0; }));
        selectedElementIds.forEach(function (id) {
            updateElement(id, { zIndex: minZ - 1 });
        });
    };
    var alignElements = function (alignment) {
        if (selectedElementIds.length === 0)
            return;
        var elements = slides[currentSlideIndex].elements.filter(function (el) { return selectedElementIds.includes(el.id) && el.type !== "group"; });
        if (elements.length === 0)
            return;
        switch (alignment) {
            case "left":
                var minX_1 = Math.min.apply(Math, elements.map(function (e) { return e.x; }));
                elements.forEach(function (e) { return updateElement(e.id, { x: minX_1 }); });
                break;
            case "center":
                var avgX_1 = elements.reduce(function (sum, e) { return sum + e.x; }, 0) / elements.length;
                elements.forEach(function (e) { return updateElement(e.id, { x: avgX_1 }); });
                break;
            case "right":
                var maxX_1 = Math.max.apply(Math, elements.map(function (e) { return e.x; }));
                elements.forEach(function (e) { return updateElement(e.id, { x: maxX_1 }); });
                break;
            case "top":
                var minY_1 = Math.min.apply(Math, elements.map(function (e) { return e.y; }));
                elements.forEach(function (e) { return updateElement(e.id, { y: minY_1 }); });
                break;
            case "middle":
                var avgY_1 = elements.reduce(function (sum, e) { return sum + e.y; }, 0) / elements.length;
                elements.forEach(function (e) { return updateElement(e.id, { y: avgY_1 }); });
                break;
            case "bottom":
                var maxY_1 = Math.max.apply(Math, elements.map(function (e) { return e.y; }));
                elements.forEach(function (e) { return updateElement(e.id, { y: maxY_1 }); });
                break;
        }
    };
    var applyColorToSelectedText = function (color) {
        var selectedElement = slides[currentSlideIndex].elements.find(function (el) { return el.id === selectedElementIds[0]; });
        if (selectedElement && selectedElement.type === "text") {
            var textarea = document.querySelector("textarea[data-element=\"".concat(selectedElement.id, "\"]"));
            if (!textarea)
                return;
            var start = textarea.selectionStart;
            var end = textarea.selectionEnd;
            if (start === end)
                return;
            var text = selectedElement.content;
            var selectedText = text.substring(start, end);
            var beforeText = text.substring(0, start);
            var afterText = text.substring(end);
            var newText = "".concat(beforeText, "<color:").concat(color, ">").concat(selectedText, "</color>").concat(afterText);
            updateElement(selectedElement.id, { content: newText });
        }
    };
    var removeColorFormatting = function () {
        var selectedElement = slides[currentSlideIndex].elements.find(function (el) { return el.id === selectedElementIds[0]; });
        if (selectedElement && selectedElement.type === "text") {
            var cleanText = selectedElement.content.replace(/<color:#[0-9A-Fa-f]{6}>(.*?)<\/color>/g, "$1");
            updateElement(selectedElement.id, { content: cleanText });
        }
    };
    var addSlide = function () {
        var newSlide = {
            id: Date.now().toString(),
            slideType: "content",
            elements: [
                {
                    id: "text-".concat(Date.now()),
                    type: "text",
                    content: "New Slide",
                    x: CANVAS_WIDTH / 2,
                    y: CANVAS_HEIGHT / 2,
                    fontSize: 56,
                    fontFamily: "Inter",
                    color: "#FFF0F0",
                    align: "center",
                    lineHeight: 75,
                },
            ],
        };
        setSlides(__spreadArray(__spreadArray([], slides, true), [newSlide], false));
        setCurrentSlideIndex(slides.length);
    };
    var deleteSlide = function () {
        if (slides.length === 1)
            return; // Can't delete last slide
        var newSlides = slides.filter(function (_, i) { return i !== currentSlideIndex; });
        setSlides(newSlides);
        setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    };
    var downloadSlide = function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var link = document.createElement("a");
        link.download = "tt-carousel-slide-".concat(currentSlideIndex + 1, ".png");
        link.href = canvas.toDataURL("image/png");
        link.click();
    };
    var downloadAll = function () {
        slides.forEach(function (_, index) {
            setCurrentSlideIndex(index);
            setTimeout(function () {
                downloadSlide();
            }, index * 500);
        });
    };
    return (<div className="h-screen flex flex-col bg-[#18181B]">
      {/* Top Header - Canva Style */}
      <div className="h-16 bg-[#18181B] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={function () { return navigate("/media/carousel/select"); }} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5"/>
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <input type="text" value={carouselName} onChange={function (e) { return setCarouselName(e.target.value); }} className="bg-transparent border-none text-white text-sm font-medium focus:outline-none focus:bg-white/5 px-2 py-1 rounded min-w-[200px]" placeholder="Carousel name"/>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-white/40 text-sm font-medium">
            Slide {currentSlideIndex + 1} / {slides.length}
          </div>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-[#2A2A2A] rounded px-1 py-0.5">
            <button onClick={function () {
            if (historyIndex > 0) {
                setHistoryIndex(function (prev) { return prev - 1; });
                setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
            }
        }} disabled={historyIndex === 0} className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg" title="Undo (Ctrl+Z)">
              ↶
            </button>
            <button onClick={function () {
            if (historyIndex < history.length - 1) {
                setHistoryIndex(function (prev) { return prev + 1; });
                setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
            }
        }} disabled={historyIndex === history.length - 1} className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg" title="Redo (Ctrl+Shift+Z)">
              ↷
            </button>
          </div>
          
          {/* Autosave indicator */}
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <span className="text-green-400">{Date.now() - lastSaved < 2000 ? '✓' : '⋯'}</span>
            {Date.now() - lastSaved < 2000 ? 'Saved' : 'Saving...'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={downloadSlide} variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2"/>
            Download
          </Button>
          <Button onClick={downloadAll} size="sm" className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0">
            Download All
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements & Tools */}
        <div className="w-20 bg-[#18181B] border-r border-white/10 flex flex-col items-center py-4 gap-3">
          <button onClick={addTextElement} className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all" title="Add Text">
            <Type className="w-5 h-5"/>
            <span className="text-[10px]">Text</span>
          </button>
          
          <button onClick={addIconElement} className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all" title="Add Icon">
            <Plus className="w-5 h-5"/>
            <span className="text-[10px]">Icon</span>
          </button>

          <div className="h-px w-8 bg-white/10 my-2"></div>

          <button onClick={function () { return setShowLayers(!showLayers); }} className={"w-12 h-12 flex flex-col items-center justify-center gap-1 rounded transition-all ".concat(showLayers ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5')} title="Layers">
            <Layers className="w-5 h-5"/>
            <span className="text-[10px]">Layers</span>
          </button>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
          {/* Canvas Toolbar */}
          <div className="h-14 bg-[#18181B] border-b border-white/10 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-lg p-1">
              <button onClick={function () { return setZoom(Math.max(0.1, zoom - 0.1)); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-all">
                <ZoomOut className="w-4 h-4"/>
              </button>
              <button onDoubleClick={function () { return setZoom(1); }} className="text-white text-sm w-16 text-center hover:text-[#E63946] transition-colors cursor-pointer" title="Double-click to reset to 100%">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={function () { return setZoom(Math.min(2, zoom + 0.1)); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-all">
                <ZoomIn className="w-4 h-4"/>
              </button>
            </div>

            {selectedElementIds.length > 0 && (<>
                <div className="h-6 w-px bg-white/10"></div>
                
                {/* Alignment Tools */}
                <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-lg p-1">
                  <button onClick={function () { return alignElements("left"); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Left">
                    <AlignLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={function () { return alignElements("center"); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Center">
                    <AlignHorizontalJustifyCenter className="w-4 h-4"/>
                  </button>
                  <button onClick={function () { return alignElements("right"); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Right">
                    <AlignRight className="w-4 h-4"/>
                  </button>
                </div>

                {/* Layer Order */}
                <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-lg p-1">
                  <button onClick={bringToFront} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded text-xs" title="Bring to Front">
                    ↑
                  </button>
                  <button onClick={sendToBack} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded text-xs" title="Send to Back">
                    ↓
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-lg p-1">
                  <button onClick={duplicateSelected} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Duplicate">
                    <Copy className="w-4 h-4"/>
                  </button>
                  <button onClick={deleteSelectedElements} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Delete">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </>)}
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <div style={{
            transform: "scale(".concat(zoom, ")"),
            transformOrigin: 'center',
        }} className="shadow-2xl relative">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-[#1A1A1A]" style={{
            cursor: editingTextId ? 'default' :
                isDragging ? 'grabbing' :
                    hoveredElementId ? 'grab' :
                        'default'
        }} onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onMouseLeave={function (e) {
            handleCanvasMouseUp();
            setHoveredElementId(null);
        }}/>
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="h-24 bg-[#18181B] border-t border-white/10 flex items-center gap-2 px-4 overflow-x-auto">
            {slides.map(function (slide, index) { return (<button key={slide.id} onClick={function () {
                setCurrentSlideIndex(index);
                setSelectedElementIds([]);
            }} className={"flex-shrink-0 w-20 h-16 border-2 rounded transition-all relative group ".concat(index === currentSlideIndex
                ? "border-[#E63946]"
                : "border-white/10 hover:border-white/30")}>
                <div className="w-full h-full bg-[#1A1A1A] rounded flex items-center justify-center">
                  <span className="text-white/40 text-xs">{index + 1}</span>
                </div>
                {slides.length > 1 && (<button onClick={function (e) {
                    e.stopPropagation();
                    if (index === currentSlideIndex && slides.length > 1) {
                        deleteSlide();
                    }
                }} className="absolute -top-2 -right-2 w-5 h-5 bg-[#E63946] rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                    <Trash2 className="w-3 h-3"/>
                  </button>)}
              </button>); })}
            <button onClick={addSlide} className="flex-shrink-0 w-20 h-16 border-2 border-dashed border-white/20 hover:border-white/40 rounded flex items-center justify-center transition-all">
              <Plus className="w-6 h-6 text-white/40"/>
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties & Layers */}
        <div className="w-80 bg-[#18181B] border-l border-white/10 flex flex-col">
          {/* Tabs */}
          <div className="h-12 border-b border-white/10 flex">
            <button onClick={function () { return setShowLayers(false); }} className={"flex-1 text-sm font-medium transition-all ".concat(!showLayers ? 'text-white border-b-2 border-[#E63946]' : 'text-white/60 hover:text-white')}>
              Properties
            </button>
            <button onClick={function () { return setShowLayers(true); }} className={"flex-1 text-sm font-medium transition-all ".concat(showLayers ? 'text-white border-b-2 border-[#E63946]' : 'text-white/60 hover:text-white')}>
              Layers ({(currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.elements.length) || 0})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showLayers ? (
        /* Layers Panel */
        <div className="p-4 space-y-2">
                {currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.elements.slice().sort(function (a, b) { return (b.zIndex || 0) - (a.zIndex || 0); }).map(function (element) { return (<button key={element.id} onClick={function () {
                    if (element.type !== "group" && !element.locked) {
                        setSelectedElementIds([element.id]);
                    }
                }} className={"w-full p-3 rounded flex items-center justify-between transition-all ".concat(selectedElementIds.includes(element.id)
                    ? 'bg-[#E63946]/20 border border-[#E63946]'
                    : 'bg-[#2A2A2A] hover:bg-[#333] border border-transparent')}>
                      <div className="flex items-center gap-3">
                        {element.type === "text" ? (<Type className="w-4 h-4 text-white/60"/>) : element.type === "icon" ? (<Move className="w-4 h-4 text-white/60"/>) : (<Group className="w-4 h-4 text-white/60"/>)}
                        <span className="text-sm text-white">
                          {element.type === "text"
                    ? stripColorTags(element.content.split("\n")[0]).substring(0, 20)
                    : element.type === "icon"
                        ? "Arrow Icon"
                        : "Group"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={function (e) {
                    e.stopPropagation();
                    toggleVisibility(element.id);
                }} className="text-white/40 hover:text-white">
                          {element.visible === false ? (<EyeOff className="w-4 h-4"/>) : (<Eye className="w-4 h-4"/>)}
                        </button>
                        <button onClick={function (e) {
                    e.stopPropagation();
                    toggleLock(element.id);
                }} className="text-white/40 hover:text-white">
                          {element.locked ? (<Lock className="w-4 h-4"/>) : (<Unlock className="w-4 h-4"/>)}
                        </button>
                      </div>
                    </button>); })}
              </div>) : (
        /* Properties Panel */
        <div className="p-4">
                {selectedElementIds.length === 0 ? (<div className="text-center py-12">
                    <Move className="w-12 h-12 mx-auto mb-4 text-white/20"/>
                    <p className="text-white/40 text-sm">Select an element to edit</p>
                  </div>) : selectedElementIds.length === 1 ? ((function () {
                var element = currentSlide === null || currentSlide === void 0 ? void 0 : currentSlide.elements.find(function (el) { return el.id === selectedElementIds[0]; });
                if (!element)
                    return null;
                if (element.type === "text") {
                    return (<div className="space-y-6">
                          {/* Edit Mode Toggle */}
                          {!editingTextId && (<button onClick={function () {
                                setEditingTextId(element.id);
                                setEditingText(stripColorTags(element.content));
                                setTimeout(function () { var _a; return (_a = editInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 50);
                            }} className="w-full h-10 bg-[#E63946] hover:bg-[#E63946]/90 text-white rounded font-medium transition-all">
                              Edit Text
                            </button>)}

                          {/* Text Editor */}
                          {editingTextId === element.id ? (<div className="space-y-4">
                              <div>
                                <h3 className="text-white text-sm font-medium mb-3">Edit Text</h3>
                                <textarea ref={editInputRef} value={editingText} onChange={function (e) {
                                setEditingText(e.target.value);
                                // Update element content in real-time
                                if (!colorsApplied) {
                                    updateElement(element.id, { content: e.target.value });
                                }
                            }} onSelect={function (e) {
                                var target = e.target;
                                setTextSelection({
                                    start: target.selectionStart,
                                    end: target.selectionEnd
                                });
                            }} className="w-full bg-[#2A2A2A] border border-white/10 text-white rounded p-3 min-h-[150px] resize-none outline-none focus:border-[#E63946] transition-all" style={{
                                fontFamily: element.fontFamily,
                                fontSize: '14px',
                                lineHeight: '20px',
                            }} spellCheck={false}/>
                              </div>

                              {/* Color Picker - Only shows when text is selected */}
                              {textSelection && textSelection.start !== textSelection.end && (<div>
                                  <h3 className="text-white text-sm font-medium mb-3">Apply Color to Selected Text</h3>
                                  <div className="grid grid-cols-4 gap-2">
                                    {TT_COLORS.map(function (color) { return (<button key={color.id} onClick={function () { return applyColorToSelection(color.value); }} className="h-12 rounded border-2 border-white/20 hover:border-white hover:scale-105 transition-all" style={{ backgroundColor: color.value }} title={color.label}/>); })}
                                  </div>
                                  <p className="text-xs text-white/40 mt-2">Highlight text then click a color</p>
                                </div>)}

                              <button onClick={exitEditMode} className="w-full h-10 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded font-medium transition-all">
                                Done Editing
                              </button>
                            </div>) : (<div>
                              <h3 className="text-white text-sm font-medium mb-3">Content Preview</h3>
                              <div className="bg-[#2A2A2A] border border-white/10 rounded p-3 text-white/60 text-sm min-h-[60px]">
                                {stripColorTags(element.content).substring(0, 100)}...
                              </div>
                            </div>)}

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Font Size: {element.fontSize}px</h3>
                            <Slider value={[element.fontSize]} onValueChange={function (_a) {
                        var val = _a[0];
                        return updateElement(element.id, { fontSize: val });
                    }} min={24} max={180} step={1} className="w-full"/>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Line Height: {element.lineHeight}px</h3>
                            <Slider value={[element.lineHeight]} onValueChange={function (_a) {
                        var val = _a[0];
                        return updateElement(element.id, { lineHeight: val });
                    }} min={30} max={250} step={1} className="w-full"/>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Position</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">X</label>
                                <Input type="number" value={Math.round(element.x)} onChange={function (e) { return updateElement(element.id, { x: parseInt(e.target.value) || 0 }); }} className="bg-[#2A2A2A] border-white/10 text-white"/>
                              </div>
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">Y</label>
                                <Input type="number" value={Math.round(element.y)} onChange={function (e) { return updateElement(element.id, { y: parseInt(e.target.value) || 0 }); }} className="bg-[#2A2A2A] border-white/10 text-white"/>
                              </div>
                            </div>
                          </div>
                        </div>);
                }
                else if (element.type === "icon") {
                    return (<div className="space-y-6">
                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Icon Size: {element.size}px</h3>
                            <Slider value={[element.size]} onValueChange={function (_a) {
                        var val = _a[0];
                        return updateElement(element.id, { size: val });
                    }} min={50} max={300} step={5} className="w-full"/>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Circle Color</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {TT_COLORS.map(function (color) { return (<button key={color.id} onClick={function () { return updateElement(element.id, { color: color.value }); }} className={"h-10 rounded border transition-all ".concat(element.color === color.value ? 'border-white ring-2 ring-[#E63946]' : 'border-white/20 hover:border-white/60')} style={{ backgroundColor: color.value }}/>); })}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Arrow Color</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {__spreadArray(__spreadArray([], TT_COLORS, true), [{ id: "dark", value: "#1A1A1A", label: "Dark" }], false).map(function (color) { return (<button key={color.id} onClick={function () { return updateElement(element.id, { arrowColor: color.value }); }} className={"h-10 rounded border transition-all ".concat(element.arrowColor === color.value ? 'border-white ring-2 ring-[#E63946]' : 'border-white/20 hover:border-white/60')} style={{ backgroundColor: color.value }}/>); })}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Position</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">X</label>
                                <Input type="number" value={Math.round(element.x)} onChange={function (e) { return updateElement(element.id, { x: parseInt(e.target.value) || 0 }); }} className="bg-[#2A2A2A] border-white/10 text-white"/>
                              </div>
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">Y</label>
                                <Input type="number" value={Math.round(element.y)} onChange={function (e) { return updateElement(element.id, { y: parseInt(e.target.value) || 0 }); }} className="bg-[#2A2A2A] border-white/10 text-white"/>
                              </div>
                            </div>
                          </div>
                        </div>);
                }
                return null;
            })()) : (<div className="text-center py-12">
                    <Group className="w-12 h-12 mx-auto mb-4 text-white/20"/>
                    <p className="text-white/40 text-sm">{selectedElementIds.length} elements selected</p>
                    <p className="text-white/30 text-xs mt-2">Use toolbar to align or group</p>
                  </div>)}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
