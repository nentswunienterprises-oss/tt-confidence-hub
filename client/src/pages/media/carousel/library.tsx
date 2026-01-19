import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2, Download } from "lucide-react";

interface SavedCarousel {
  id: string;
  name: string;
  slides: any[];
  lastModified: number;
  pillar?: string;
  situation?: string;
  audience?: string;
  platform?: string;
}

export default function CarouselLibrary() {
  const navigate = useNavigate();
  const [carousels, setCarousels] = useState<SavedCarousel[]>([]);

  useEffect(() => {
    loadCarousels();
  }, []);

  const loadCarousels = () => {
    const saved = localStorage.getItem("tt-carousels");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCarousels(parsed.sort((a: SavedCarousel, b: SavedCarousel) => b.lastModified - a.lastModified));
    }
  };

  const deleteCarousel = (id: string) => {
    const saved = localStorage.getItem("tt-carousels");
    if (saved) {
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter((c: SavedCarousel) => c.id !== id);
      localStorage.setItem("tt-carousels", JSON.stringify(filtered));
      loadCarousels();
    }
  };

  const openCarousel = (id: string) => {
    navigate(`/media/carousel/create?load=${id}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#FFF5ED]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 bg-[#FFF5ED]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/media")}
              className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <Button
              onClick={() => navigate("/media/carousel/select")}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              New Carousel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 
            className="text-5xl md:text-6xl tracking-tight text-[#1A1A1A] mb-2"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            CAROUSEL LIBRARY
          </h1>
          <div className="h-1 w-16 bg-[#E63946]"></div>
        </div>

        {/* Carousel List */}
        {carousels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#1A1A1A]/40 text-lg mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              No carousels saved yet.
            </p>
            <Button
              onClick={() => navigate("/media/carousel/select")}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Create Your First Carousel
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {carousels.map((carousel) => (
              <div
                key={carousel.id}
                className="group bg-white border-2 border-[#1A1A1A]/10 hover:border-[#E63946] transition-all p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => openCarousel(carousel.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#E63946] transition-colors"
                        style={{ fontFamily: 'Anton, sans-serif' }}
                      >
                        {carousel.name}
                      </div>
                      <div className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {carousel.slides.length} slide{carousel.slides.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span>Modified {formatDate(carousel.lastModified)}</span>
                      {carousel.pillar && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{carousel.pillar.replace('-', ' ')}</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => deleteCarousel(carousel.id)}
                    className="w-9 h-9 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#E63946] hover:bg-[#E63946]/10 rounded transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#1A1A1A]/10">
          <p className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
            All carousels auto-save as you work.
          </p>
        </div>
      </div>
    </div>
  );
}
