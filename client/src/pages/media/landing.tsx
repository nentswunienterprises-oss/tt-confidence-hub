import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MediaLanding() {
  return (
    <div className="min-h-screen bg-[#FFF5ED] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 
            className="text-6xl md:text-7xl tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            TT MEDIA
          </h1>
          <div className="h-1 w-24 bg-[#E63946]"></div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            This is not a design tool.
          </p>
          <p className="text-lg text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            This is a response system.
          </p>
          <p className="text-lg text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select situation. Execute format.
          </p>
        </div>

        {/* Stats/Info */}
        <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-[#1A1A1A]/10">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-[#E63946]" style={{ fontFamily: 'Anton, sans-serif' }}>
              0
            </div>
            <div className="text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Blank states
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-[#E63946]" style={{ fontFamily: 'Anton, sans-serif' }}>
              1
            </div>
            <div className="text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Correct structure
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-[#E63946]" style={{ fontFamily: 'Anton, sans-serif' }}>
              100%
            </div>
            <div className="text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Brand integrity
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="space-y-4">
          <Link to="/media/carousel/library">
            <Button 
              className="w-full h-14 text-lg bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Carousel Library
            </Button>
          </Link>
          <Link to="/media/carousel/select">
            <Button 
              className="w-full h-14 text-lg bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Create Carousel
            </Button>
          </Link>
          <p className="text-sm text-[#1A1A1A]/40 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            More formats coming. Not soon. When ready.
          </p>
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-[#1A1A1A]/10">
          <p className="text-sm text-[#1A1A1A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            No creativity theater.
            <br />
            No expressive freedom.
            <br />
            Controlled. Repeatable. Calm.
          </p>
        </div>
      </div>
    </div>
  );
}
