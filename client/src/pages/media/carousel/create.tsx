import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, Download, Plus, Trash2, Type, Move, Group, Ungroup,
  ZoomIn, ZoomOut, Copy, Lock, Unlock, AlignLeft, AlignCenter, AlignRight,
  AlignCenterVertical, AlignHorizontalJustifyCenter, Layers, Eye, EyeOff
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TextElement {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: "Anton" | "Inter";
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
}

interface IconElement {
  id: string;
  type: "icon";
  iconType: "arrow-circle";
  x: number;
  y: number;
  size: number;
  color: string;
  arrowColor: string;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
}

interface GroupElement {
  id: string;
  type: "group";
  elementIds: string[];
  x: number;
  y: number;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
}

type SlideElement = TextElement | IconElement | GroupElement;

interface CarouselSlide {
  id: string;
  slideType: "hook" | "content";
  elements: SlideElement[];
}

const TT_COLORS = [
  { id: "pink", value: "#FFF0F0", label: "Light Pink" },
  { id: "white", value: "#FFFFFF", label: "White" },
  { id: "red", value: "#E63946", label: "Red" },
  { id: "cream", value: "#FFF5ED", label: "Cream" },
] as const;

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

export default function CarouselCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const pillar = searchParams.get("pillar") || "";
  const situation = searchParams.get("situation") || "";
  const audience = searchParams.get("audience") || "";
  const platform = searchParams.get("platform") || "";
  const loadId = searchParams.get("load");

  const [carouselId] = useState<string>(loadId || `carousel-${Date.now()}`);
  const [slides, setSlides] = useState<CarouselSlide[]>([
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
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5); // 50% zoom to fit in viewport
  const [showLayers, setShowLayers] = useState(true);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [textSelection, setTextSelection] = useState<{start: number, end: number} | null>(null);
  const [colorsApplied, setColorsApplied] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<CarouselSlide[][]>([slides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [carouselName, setCarouselName] = useState("The Moment");
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const currentSlide = slides[currentSlideIndex];

  // Load saved carousel if loadId provided
  useEffect(() => {
    if (loadId) {
      const saved = localStorage.getItem("tt-carousels");
      if (saved) {
        const carousels = JSON.parse(saved);
        const carousel = carousels.find((c: any) => c.id === loadId);
        if (carousel) {
          setSlides(carousel.slides);
          setCarouselName(carousel.name);
        }
      }
    }
  }, [loadId]);

  // Auto-save carousel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const saved = localStorage.getItem("tt-carousels");
      const carousels = saved ? JSON.parse(saved) : [];
      
      const existingIndex = carousels.findIndex((c: any) => c.id === carouselId);
      const carouselData = {
        id: carouselId,
        name: carouselName,
        slides: slides,
        lastModified: Date.now(),
        pillar,
        situation,
        audience,
        platform,
      };
      
      if (existingIndex >= 0) {
        carousels[existingIndex] = carouselData;
      } else {
        carousels.push(carouselData);
      }
      
      localStorage.setItem("tt-carousels", JSON.stringify(carousels));
    }, 2000); // Save 2 seconds after last change
    
    return () => clearTimeout(timeoutId);
  }, [slides, carouselName, carouselId, pillar, situation, audience, platform]);

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      const antonFont = new FontFace('Anton', 'url(https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8.woff2)');
      const interFont = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)');
      
      await antonFont.load();
      await interFont.load();
      
      document.fonts.add(antonFont);
      document.fonts.add(interFont);
      
      renderSlide();
    };
    
    loadFonts();
  }, []);

  // Render slide on canvas whenever it changes
  useEffect(() => {
    renderSlide();
  }, [currentSlideIndex, slides, selectedElementIds, hoveredElementId, editingTextId, isDragging]);

  // Autosave to history (undo/redo)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(slides)));
        return newHistory.slice(-50); // Keep last 50 states
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
      setLastSaved(Date.now());
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [slides]);

  const exitEditMode = () => {
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

  const applyColorToSelection = (color: string) => {
    if (!editingTextId || !textSelection) return;
    
    const { start, end } = textSelection;
    if (start === end) return; // No selection
    
    // Get the current element to work with its actual content (which may have color tags)
    const element = currentSlide?.elements.find(el => el.id === editingTextId);
    if (!element || element.type !== 'text') return;
    
    // Work with the element's actual content (with any existing tags)
    const currentContent = element.content;
    
    // Strip tags to find the position in clean text
    const cleanText = stripColorTags(currentContent);
    
    // Find where to insert the color tag in the actual content
    // This is a simplified approach - we'll rebuild from the clean text with the new color
    const before = cleanText.substring(0, start);
    const selected = cleanText.substring(start, end);
    const after = cleanText.substring(end);
    
    // Build new content with color tag
    const newContent = before + `<color:${color}>${selected}</color>` + after;
    
    // Update the element
    updateElement(editingTextId, { content: newContent });
    
    // Mark that we've applied colors
    setColorsApplied(true);
    
    // Update editingText to stay in sync (keep it clean for display)
    // Don't change editingText - keep it clean for continued editing
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editingTextId) {
        exitEditMode();
      }
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey && historyIndex > 0) {
        e.preventDefault();
        setHistoryIndex(prev => prev - 1);
        setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) && historyIndex < history.length - 1) {
        e.preventDefault();
        setHistoryIndex(prev => prev + 1);
        setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTextId, editingText, history, historyIndex]);

  const renderSlide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas - Dark background
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const slide = slides[currentSlideIndex];
    if (!slide) return;

    // Render all elements
    slide.elements.forEach((element) => {
      // Show outline when element is selected
      const isSelected = selectedElementIds.includes(element.id);
      
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#E63946';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        
        if (element.type === 'text') {
          const lines = element.content.split('\n');
          const height = lines.length * element.lineHeight;
          const width = 700; // Wider to encompass full text
          ctx.strokeRect(element.x - 15, element.y - element.fontSize - 10, width, height + 30);
        } else if (element.type === 'icon') {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.size / 2 + 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
      
      // Render element
      if (element.type === "text") {
        renderTextElement(ctx, element);
      } else if (element.type === "icon") {
        renderIconElement(ctx, element);
      }
    });

    // Render hover state (subtle glow for non-selected elements)
    if (hoveredElementId && !selectedElementIds.includes(hoveredElementId)) {
      const hoveredEl = slide.elements.find(el => el.id === hoveredElementId);
      if (hoveredEl) {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.setLineDash([4, 4]);
        
        if (hoveredEl.type === 'text') {
          const lines = hoveredEl.content.split('\n');
          const height = lines.length * hoveredEl.lineHeight;
          const width = 700;
          ctx.strokeRect(hoveredEl.x - 15, hoveredEl.y - hoveredEl.fontSize - 10, width, height + 30);
        } else if (hoveredEl.type === 'icon') {
          ctx.beginPath();
          ctx.arc(hoveredEl.x, hoveredEl.y, hoveredEl.size / 2 + 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }
  };

  const renderTextElement = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    ctx.font = `bold ${element.fontSize}px ${element.fontFamily}, sans-serif`;
    ctx.textAlign = element.align;
    
    const lines = element.content.split("\n");
    let y = element.y;
    
    lines.forEach(line => {
      if (line.trim()) {
        renderColoredLine(ctx, line, element.x, y, element.color);
        y += element.lineHeight;
      }
    });
  };

  const renderIconElement = (ctx: CanvasRenderingContext2D, element: IconElement) => {
    if (element.iconType === "arrow-circle") {
      const radius = element.size / 2;
      
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

  const renderSelectionBox = (ctx: CanvasRenderingContext2D, element: TextElement | IconElement) => {
    ctx.strokeStyle = "#E63946";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    if (element.type === "text") {
      const lines = element.content.split("\n");
      const height = lines.length * element.lineHeight;
      const width = 600; // Approximate width
      ctx.strokeRect(element.x - 10, element.y - element.fontSize, width, height + 20);
    } else if (element.type === "icon") {
      const radius = element.size / 2;
      ctx.strokeRect(
        element.x - radius - 10,
        element.y - radius - 10,
        element.size + 20,
        element.size + 20
      );
    }
    
    ctx.setLineDash([]);
  };

  const renderColoredLine = (
    ctx: CanvasRenderingContext2D,
    line: string,
    x: number,
    y: number,
    defaultColor: string
  ) => {
    const segments = parseColoredText(line, defaultColor);
    let currentX = x;

    segments.forEach(segment => {
      ctx.fillStyle = segment.color;
      ctx.fillText(segment.text, currentX, y);
      currentX += ctx.measureText(segment.text).width;
    });
  };

  const parseColoredText = (text: string, defaultColor: string): Array<{ text: string; color: string }> => {
    const segments: Array<{ text: string; color: string }> = [];
    const colorRegex = /<color:(#[0-9A-Fa-f]{6})>(.*?)<\/color>/g;
    let lastIndex = 0;
    let match;

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

    return segments.length > 0 ? segments : [{ text, color: defaultColor }];
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Canvas interaction handlers
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getElementAtPosition = (x: number, y: number): SlideElement | null => {
    const slide = slides[currentSlideIndex];
    if (!slide) return null;

    // Check in reverse order (top to bottom)
    for (let i = slide.elements.length - 1; i >= 0; i--) {
      const element = slide.elements[i];
      
      if (element.type === "text") {
        const lines = element.content.split("\n");
        const height = lines.length * element.lineHeight;
        const width = 600; // Approximate
        
        if (
          x >= element.x - 10 &&
          x <= element.x + width &&
          y >= element.y - element.fontSize &&
          y <= element.y + height
        ) {
          return element;
        }
      } else if (element.type === "icon") {
        const radius = element.size / 2;
        const distance = Math.sqrt(
          Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2)
        );
        
        if (distance <= radius + 10) {
          return element;
        }
      }
    }
    
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const element = getElementAtPosition(coords.x, coords.y);
    
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
        setSelectedElementIds(prev => prev.filter(id => id !== element.id));
      } else if (e.shiftKey) {
        // Add to selection
        setSelectedElementIds(prev => [...prev, element.id]);
      } else if (!selectedElementIds.includes(element.id)) {
        // Select only this element
        setSelectedElementIds([element.id]);
      }
      
      setIsDragging(true);
      setDragStart(coords);
    } else {
      // Click on empty space - deselect all
      setSelectedElementIds([]);
    }
  };

  const stripColorTags = (text: string): string => {
    return text.replace(/<color:#[0-9A-Fa-f]{6}>(.*?)<\/color>/g, '$1');
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    
    // Update hover state
    if (!isDragging && !editingTextId) {
      const element = getElementAtPosition(coords.x, coords.y);
      setHoveredElementId(element?.id || null);
    }
    
    if (!isDragging || selectedElementIds.length === 0) return;
    
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;
    
    updateElementPositions(deltaX, deltaY);
    setDragStart(coords);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const updateElementPositions = (deltaX: number, deltaY: number) => {
    const newSlides = [...slides];
    const slide = newSlides[currentSlideIndex];
    
    slide.elements = slide.elements.map(element => {
      if (selectedElementIds.includes(element.id)) {
        if (element.type === "text" || element.type === "icon") {
          return {
            ...element,
            x: element.x + deltaX,
            y: element.y + deltaY,
          };
        }
      }
      return element;
    });
    
    setSlides(newSlides);
  };

  const updateElement = (elementId: string, updates: any) => {
    const newSlides = [...slides];
    const slide = newSlides[currentSlideIndex];
    
    slide.elements = slide.elements.map(element => {
      if (element.id === elementId) {
        return { ...element, ...updates };
      }
      return element;
    }) as SlideElement[];
    
    setSlides(newSlides);
  };

  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "New Text",
      x: 200,
      y: 300,
      fontSize: currentSlide?.slideType === "hook" ? 120 : 56,
      fontFamily: currentSlide?.slideType === "hook" ? "Anton" : "Inter",
      color: "#FFF0F0",
      align: "left",
      lineHeight: currentSlide?.slideType === "hook" ? 140 : 75,
    };
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements.push(newElement);
    setSlides(newSlides);
    setSelectedElementIds([newElement.id]);
  };

  const addIconElement = () => {
    const newElement: IconElement = {
      id: `icon-${Date.now()}`,
      type: "icon",
      iconType: "arrow-circle",
      x: 500,
      y: 400,
      size: 100,
      color: "#E63946",
      arrowColor: "#1A1A1A",
    };
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements.push(newElement);
    setSlides(newSlides);
    setSelectedElementIds([newElement.id]);
  };

  const deleteSelectedElements = () => {
    const newSlides = [...slides];
    const slide = newSlides[currentSlideIndex];
    
    slide.elements = slide.elements.filter(
      element => !selectedElementIds.includes(element.id)
    );
    
    setSlides(newSlides);
    setSelectedElementIds([]);
  };

  const groupSelectedElements = () => {
    if (selectedElementIds.length < 2) return;
    
    const newGroup: GroupElement = {
      id: `group-${Date.now()}`,
      type: "group",
      elementIds: [...selectedElementIds],
      x: 0,
      y: 0,
      zIndex: Math.max(...slides[currentSlideIndex].elements.map(e => e.zIndex || 0)) + 1,
    };
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements.push(newGroup);
    setSlides(newSlides);
  };

  const duplicateSelected = () => {
    if (selectedElementIds.length === 0) return;
    
    const newSlides = [...slides];
    const slide = newSlides[currentSlideIndex];
    const newElements: SlideElement[] = [];
    const newIds: string[] = [];
    
    selectedElementIds.forEach(id => {
      const element = slide.elements.find(el => el.id === id);
      if (element && element.type !== "group") {
        const newId = `${element.type}-${Date.now()}-${Math.random()}`;
        const newElement = {
          ...element,
          id: newId,
          x: element.x + 20,
          y: element.y + 20,
        };
        newElements.push(newElement as SlideElement);
        newIds.push(newId);
      }
    });
    
    slide.elements.push(...newElements);
    setSlides(newSlides);
    setSelectedElementIds(newIds);
  };

  const toggleLock = (elementId: string) => {
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type !== "group") {
      updateElement(elementId, { locked: !element.locked });
    }
  };

  const toggleVisibility = (elementId: string) => {
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type !== "group") {
      updateElement(elementId, { visible: element.visible === false ? true : false });
    }
  };

  const bringToFront = () => {
    if (selectedElementIds.length === 0) return;
    const maxZ = Math.max(...slides[currentSlideIndex].elements.map(e => e.zIndex || 0));
    selectedElementIds.forEach(id => {
      updateElement(id, { zIndex: maxZ + 1 });
    });
  };

  const sendToBack = () => {
    if (selectedElementIds.length === 0) return;
    const minZ = Math.min(...slides[currentSlideIndex].elements.map(e => e.zIndex || 0));
    selectedElementIds.forEach(id => {
      updateElement(id, { zIndex: minZ - 1 });
    });
  };

  const alignElements = (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (selectedElementIds.length === 0) return;
    
    const elements = slides[currentSlideIndex].elements.filter(
      el => selectedElementIds.includes(el.id) && el.type !== "group"
    ) as (TextElement | IconElement)[];
    
    if (elements.length === 0) return;
    
    switch (alignment) {
      case "left":
        const minX = Math.min(...elements.map(e => e.x));
        elements.forEach(e => updateElement(e.id, { x: minX }));
        break;
      case "center":
        const avgX = elements.reduce((sum, e) => sum + e.x, 0) / elements.length;
        elements.forEach(e => updateElement(e.id, { x: avgX }));
        break;
      case "right":
        const maxX = Math.max(...elements.map(e => e.x));
        elements.forEach(e => updateElement(e.id, { x: maxX }));
        break;
      case "top":
        const minY = Math.min(...elements.map(e => e.y));
        elements.forEach(e => updateElement(e.id, { y: minY }));
        break;
      case "middle":
        const avgY = elements.reduce((sum, e) => sum + e.y, 0) / elements.length;
        elements.forEach(e => updateElement(e.id, { y: avgY }));
        break;
      case "bottom":
        const maxY = Math.max(...elements.map(e => e.y));
        elements.forEach(e => updateElement(e.id, { y: maxY }));
        break;
    }
  };

  const applyColorToSelectedText = (color: string) => {
    const selectedElement = slides[currentSlideIndex].elements.find(
      el => el.id === selectedElementIds[0]
    );
    
    if (selectedElement && selectedElement.type === "text") {
      const textarea = document.querySelector(`textarea[data-element="${selectedElement.id}"]`) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) return;

      const text = selectedElement.content;
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);

      const newText = `${beforeText}<color:${color}>${selectedText}</color>${afterText}`;
      updateElement(selectedElement.id, { content: newText });
    }
  };

  const removeColorFormatting = () => {
    const selectedElement = slides[currentSlideIndex].elements.find(
      el => el.id === selectedElementIds[0]
    );
    
    if (selectedElement && selectedElement.type === "text") {
      const cleanText = selectedElement.content.replace(/<color:#[0-9A-Fa-f]{6}>(.*?)<\/color>/g, "$1");
      updateElement(selectedElement.id, { content: cleanText });
    }
  };

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      slideType: "content",
      elements: [
        {
          id: `text-${Date.now()}`,
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
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length === 1) return; // Can't delete last slide
    
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const downloadSlide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `tt-carousel-slide-${currentSlideIndex + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadAll = () => {
    slides.forEach((_, index) => {
      setCurrentSlideIndex(index);
      setTimeout(() => {
        downloadSlide();
      }, index * 500);
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#18181B]">
      {/* Top Header - Canva Style */}
      <div className="h-16 bg-[#18181B] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/media/carousel/select")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <input
            type="text"
            value={carouselName}
            onChange={(e) => setCarouselName(e.target.value)}
            className="bg-transparent border-none text-white text-sm font-medium focus:outline-none focus:bg-white/5 px-2 py-1 rounded min-w-[200px]"
            placeholder="Carousel name"
          />
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-white/40 text-sm font-medium">
            Slide {currentSlideIndex + 1} / {slides.length}
          </div>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-[#2A2A2A] rounded px-1 py-0.5">
            <button
              onClick={() => {
                if (historyIndex > 0) {
                  setHistoryIndex(prev => prev - 1);
                  setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
                }
              }}
              disabled={historyIndex === 0}
              className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={() => {
                if (historyIndex < history.length - 1) {
                  setHistoryIndex(prev => prev + 1);
                  setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
                }
              }}
              disabled={historyIndex === history.length - 1}
              className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all text-lg"
              title="Redo (Ctrl+Shift+Z)"
            >
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
          <Button
            onClick={downloadSlide}
            variant="outline"
            size="sm"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={downloadAll}
            size="sm"
            className="bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
          >
            Download All
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements & Tools */}
        <div className="w-20 bg-[#18181B] border-r border-white/10 flex flex-col items-center py-4 gap-3">
          <button
            onClick={addTextElement}
            className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all"
            title="Add Text"
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px]">Text</span>
          </button>
          
          <button
            onClick={addIconElement}
            className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all"
            title="Add Icon"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px]">Icon</span>
          </button>

          <div className="h-px w-8 bg-white/10 my-2"></div>

          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`w-12 h-12 flex flex-col items-center justify-center gap-1 rounded transition-all ${
              showLayers ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Layers"
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Layers</span>
          </button>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
          {/* Canvas Toolbar */}
          <div className="h-14 bg-[#18181B] border-b border-white/10 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-all"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onDoubleClick={() => setZoom(1)}
                className="text-white text-sm w-16 text-center hover:text-[#E63946] transition-colors cursor-pointer"
                title="Double-click to reset to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-all"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {selectedElementIds.length > 0 && (
              <>
                <div className="h-6 w-px bg-white/10"></div>
                
                {/* Alignment Tools */}
                <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-lg p-1">
                  <button onClick={() => alignElements("left")} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => alignElements("center")} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Center">
                    <AlignHorizontalJustifyCenter className="w-4 h-4" />
                  </button>
                  <button onClick={() => alignElements("right")} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Align Right">
                    <AlignRight className="w-4 h-4" />
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
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={deleteSelectedElements} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <div 
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
              className="shadow-2xl relative"
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-[#1A1A1A]"
                style={{
                  cursor: editingTextId ? 'default' : 
                          isDragging ? 'grabbing' : 
                          hoveredElementId ? 'grab' : 
                          'default'
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={(e) => {
                  handleCanvasMouseUp();
                  setHoveredElementId(null);
                }}
              />
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="h-24 bg-[#18181B] border-t border-white/10 flex items-center gap-2 px-4 overflow-x-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => {
                  setCurrentSlideIndex(index);
                  setSelectedElementIds([]);
                }}
                className={`flex-shrink-0 w-20 h-16 border-2 rounded transition-all relative group ${
                  index === currentSlideIndex
                    ? "border-[#E63946]"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="w-full h-full bg-[#1A1A1A] rounded flex items-center justify-center">
                  <span className="text-white/40 text-xs">{index + 1}</span>
                </div>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index === currentSlideIndex && slides.length > 1) {
                        deleteSlide();
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#E63946] rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            ))}
            <button
              onClick={addSlide}
              className="flex-shrink-0 w-20 h-16 border-2 border-dashed border-white/20 hover:border-white/40 rounded flex items-center justify-center transition-all"
            >
              <Plus className="w-6 h-6 text-white/40" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties & Layers */}
        <div className="w-80 bg-[#18181B] border-l border-white/10 flex flex-col">
          {/* Tabs */}
          <div className="h-12 border-b border-white/10 flex">
            <button
              onClick={() => setShowLayers(false)}
              className={`flex-1 text-sm font-medium transition-all ${
                !showLayers ? 'text-white border-b-2 border-[#E63946]' : 'text-white/60 hover:text-white'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setShowLayers(true)}
              className={`flex-1 text-sm font-medium transition-all ${
                showLayers ? 'text-white border-b-2 border-[#E63946]' : 'text-white/60 hover:text-white'
              }`}
            >
              Layers ({currentSlide?.elements.length || 0})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showLayers ? (
              /* Layers Panel */
              <div className="p-4 space-y-2">
                {currentSlide?.elements
                  .slice()
                  .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                  .map((element) => (
                    <button
                      key={element.id}
                      onClick={() => {
                        if (element.type !== "group" && !element.locked) {
                          setSelectedElementIds([element.id]);
                        }
                      }}
                      className={`w-full p-3 rounded flex items-center justify-between transition-all ${
                        selectedElementIds.includes(element.id)
                          ? 'bg-[#E63946]/20 border border-[#E63946]'
                          : 'bg-[#2A2A2A] hover:bg-[#333] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {element.type === "text" ? (
                          <Type className="w-4 h-4 text-white/60" />
                        ) : element.type === "icon" ? (
                          <Move className="w-4 h-4 text-white/60" />
                        ) : (
                          <Group className="w-4 h-4 text-white/60" />
                        )}
                        <span className="text-sm text-white">
                          {element.type === "text"
                            ? stripColorTags((element as TextElement).content.split("\n")[0]).substring(0, 20)
                            : element.type === "icon"
                            ? "Arrow Icon"
                            : "Group"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(element.id);
                          }}
                          className="text-white/40 hover:text-white"
                        >
                          {element.visible === false ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(element.id);
                          }}
                          className="text-white/40 hover:text-white"
                        >
                          {element.locked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              /* Properties Panel */
              <div className="p-4">
                {selectedElementIds.length === 0 ? (
                  <div className="text-center py-12">
                    <Move className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40 text-sm">Select an element to edit</p>
                  </div>
                ) : selectedElementIds.length === 1 ? (
                  (() => {
                    const element = currentSlide?.elements.find((el) => el.id === selectedElementIds[0]);
                    if (!element) return null;

                    if (element.type === "text") {
                      return (
                        <div className="space-y-6">
                          {/* Edit Mode Toggle */}
                          {!editingTextId && (
                            <button
                              onClick={() => {
                                setEditingTextId(element.id);
                                setEditingText(stripColorTags(element.content));
                                setTimeout(() => editInputRef.current?.focus(), 50);
                              }}
                              className="w-full h-10 bg-[#E63946] hover:bg-[#E63946]/90 text-white rounded font-medium transition-all"
                            >
                              Edit Text
                            </button>
                          )}

                          {/* Text Editor */}
                          {editingTextId === element.id ? (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-white text-sm font-medium mb-3">Edit Text</h3>
                                <textarea
                                  ref={editInputRef}
                                  value={editingText}
                                  onChange={(e) => {
                                    setEditingText(e.target.value);
                                    // Update element content in real-time
                                    if (!colorsApplied) {
                                      updateElement(element.id, { content: e.target.value });
                                    }
                                  }}
                                  onSelect={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    setTextSelection({
                                      start: target.selectionStart,
                                      end: target.selectionEnd
                                    });
                                  }}
                                  className="w-full bg-[#2A2A2A] border border-white/10 text-white rounded p-3 min-h-[150px] resize-none outline-none focus:border-[#E63946] transition-all"
                                  style={{
                                    fontFamily: element.fontFamily,
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                  }}
                                  spellCheck={false}
                                />
                              </div>

                              {/* Color Picker - Only shows when text is selected */}
                              {textSelection && textSelection.start !== textSelection.end && (
                                <div>
                                  <h3 className="text-white text-sm font-medium mb-3">Apply Color to Selected Text</h3>
                                  <div className="grid grid-cols-4 gap-2">
                                    {TT_COLORS.map((color) => (
                                      <button
                                        key={color.id}
                                        onClick={() => applyColorToSelection(color.value)}
                                        className="h-12 rounded border-2 border-white/20 hover:border-white hover:scale-105 transition-all"
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-white/40 mt-2">Highlight text then click a color</p>
                                </div>
                              )}

                              <button
                                onClick={exitEditMode}
                                className="w-full h-10 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded font-medium transition-all"
                              >
                                Done Editing
                              </button>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-white text-sm font-medium mb-3">Content Preview</h3>
                              <div className="bg-[#2A2A2A] border border-white/10 rounded p-3 text-white/60 text-sm min-h-[60px]">
                                {stripColorTags(element.content).substring(0, 100)}...
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Font Size: {element.fontSize}px</h3>
                            <Slider
                              value={[element.fontSize]}
                              onValueChange={([val]) => updateElement(element.id, { fontSize: val })}
                              min={24}
                              max={180}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Line Height: {element.lineHeight}px</h3>
                            <Slider
                              value={[element.lineHeight]}
                              onValueChange={([val]) => updateElement(element.id, { lineHeight: val })}
                              min={30}
                              max={250}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Position</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">X</label>
                                <Input
                                  type="number"
                                  value={Math.round(element.x)}
                                  onChange={(e) => updateElement(element.id, { x: parseInt(e.target.value) || 0 })}
                                  className="bg-[#2A2A2A] border-white/10 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">Y</label>
                                <Input
                                  type="number"
                                  value={Math.round(element.y)}
                                  onChange={(e) => updateElement(element.id, { y: parseInt(e.target.value) || 0 })}
                                  className="bg-[#2A2A2A] border-white/10 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (element.type === "icon") {
                      return (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Icon Size: {element.size}px</h3>
                            <Slider
                              value={[element.size]}
                              onValueChange={([val]) => updateElement(element.id, { size: val })}
                              min={50}
                              max={300}
                              step={5}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Circle Color</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {TT_COLORS.map((color) => (
                                <button
                                  key={color.id}
                                  onClick={() => updateElement(element.id, { color: color.value })}
                                  className={`h-10 rounded border transition-all ${
                                    element.color === color.value ? 'border-white ring-2 ring-[#E63946]' : 'border-white/20 hover:border-white/60'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Arrow Color</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {[...TT_COLORS, { id: "dark", value: "#1A1A1A", label: "Dark" }].map((color) => (
                                <button
                                  key={color.id}
                                  onClick={() => updateElement(element.id, { arrowColor: color.value })}
                                  className={`h-10 rounded border transition-all ${
                                    element.arrowColor === color.value ? 'border-white ring-2 ring-[#E63946]' : 'border-white/20 hover:border-white/60'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Position</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">X</label>
                                <Input
                                  type="number"
                                  value={Math.round(element.x)}
                                  onChange={(e) => updateElement(element.id, { x: parseInt(e.target.value) || 0 })}
                                  className="bg-[#2A2A2A] border-white/10 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/60 text-xs mb-1 block">Y</label>
                                <Input
                                  type="number"
                                  value={Math.round(element.y)}
                                  onChange={(e) => updateElement(element.id, { y: parseInt(e.target.value) || 0 })}
                                  className="bg-[#2A2A2A] border-white/10 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                ) : (
                  <div className="text-center py-12">
                    <Group className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40 text-sm">{selectedElementIds.length} elements selected</p>
                    <p className="text-white/30 text-xs mt-2">Use toolbar to align or group</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
