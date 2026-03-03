import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2 } from "lucide-react";
export default function CarouselLibrary() {
    var navigate = useNavigate();
    var _a = useState([]), carousels = _a[0], setCarousels = _a[1];
    useEffect(function () {
        loadCarousels();
    }, []);
    var loadCarousels = function () {
        var saved = localStorage.getItem("tt-carousels");
        if (saved) {
            var parsed = JSON.parse(saved);
            setCarousels(parsed.sort(function (a, b) { return b.lastModified - a.lastModified; }));
        }
    };
    var deleteCarousel = function (id) {
        var saved = localStorage.getItem("tt-carousels");
        if (saved) {
            var parsed = JSON.parse(saved);
            var filtered = parsed.filter(function (c) { return c.id !== id; });
            localStorage.setItem("tt-carousels", JSON.stringify(filtered));
            loadCarousels();
        }
    };
    var openCarousel = function (id) {
        navigate("/media/carousel/create?load=".concat(id));
    };
    var formatDate = function (timestamp) {
        var date = new Date(timestamp);
        var now = new Date();
        var diff = now.getTime() - date.getTime();
        var minutes = Math.floor(diff / 60000);
        var hours = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return "".concat(minutes, "m ago");
        if (hours < 24)
            return "".concat(hours, "h ago");
        if (days < 7)
            return "".concat(days, "d ago");
        return date.toLocaleDateString();
    };
    return (<div className="min-h-screen bg-[#FFF5ED]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 bg-[#FFF5ED]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button onClick={function () { return navigate("/media"); }} className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              <ChevronLeft className="w-5 h-5"/>
              Back
            </button>
            <Button onClick={function () { return navigate("/media/carousel/select"); }} className="bg-[#E63946] hover:bg-[#E63946]/90 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              New Carousel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl tracking-tight text-[#1A1A1A] mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
            CAROUSEL LIBRARY
          </h1>
          <div className="h-1 w-16 bg-[#E63946]"></div>
        </div>

        {/* Carousel List */}
        {carousels.length === 0 ? (<div className="text-center py-20">
            <p className="text-[#1A1A1A]/40 text-lg mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              No carousels saved yet.
            </p>
            <Button onClick={function () { return navigate("/media/carousel/select"); }} className="bg-[#E63946] hover:bg-[#E63946]/90 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create Your First Carousel
            </Button>
          </div>) : (<div className="grid gap-4">
            {carousels.map(function (carousel) { return (<div key={carousel.id} className="group bg-white border-2 border-[#1A1A1A]/10 hover:border-[#E63946] transition-all p-6">
                <div className="flex items-start justify-between gap-4">
                  <button onClick={function () { return openCarousel(carousel.id); }} className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#E63946] transition-colors" style={{ fontFamily: 'Anton, sans-serif' }}>
                        {carousel.name}
                      </div>
                      <div className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {carousel.slides.length} slide{carousel.slides.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span>Modified {formatDate(carousel.lastModified)}</span>
                      {carousel.pillar && (<>
                          <span>•</span>
                          <span className="capitalize">{carousel.pillar.replace('-', ' ')}</span>
                        </>)}
                    </div>
                  </button>
                  
                  <button onClick={function () { return deleteCarousel(carousel.id); }} className="w-9 h-9 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#E63946] hover:bg-[#E63946]/10 rounded transition-all" title="Delete">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>); })}
          </div>)}

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#1A1A1A]/10">
          <p className="text-sm text-[#1A1A1A]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
            All carousels auto-save as you work.
          </p>
        </div>
      </div>
    </div>);
}
