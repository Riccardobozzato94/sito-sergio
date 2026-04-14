import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../App';

export default function Gallery() {
  const { t } = useLang();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: '/images/gallery-1.jpg', alt: 'Impasto artigianale — Panificio Da Sergio Chioggia' },
    { src: '/images/gallery-2.jpg', alt: 'Forno tradizionale — Panificio artigianale Chioggia' },
    { src: '/images/gallery-3.jpg', alt: 'Pane appena sfornato — Pane fresco Chioggia' },
    { src: '/images/gallery-4.jpg', alt: 'Dettaglio prodotto artigianale — Dolci tipici veneziani' },
    { src: '/images/gallery-5.jpg', alt: 'Preparazione impasto tradizionale — Panificio Da Sergio' },
    { src: '/images/gallery-6.jpg', alt: 'Interno del Panificio Da Sergio — Chioggia' },
  ];

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  return (
    <>
      {/* ═══ Gallery Grid ═══ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══ Section Title ═══ */}
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-wide">
              {t.gallery_title}
            </h2>
            <p className="text-white/65 mt-4 max-w-lg mx-auto text-sm sm:text-base">
              {t.gallery_subtitle}
            </p>
          </div>

          {/* ═══ Bento Grid Gallery ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[180px]">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className={`gallery-item bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2725] cursor-pointer group ${
                  i === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                aria-label={`Vedi immagine: ${img.alt}`}
              >
                <div className="relative w-full h-full">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="img-cover"
                    loading="lazy"
                    width="600"
                    height="400"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/0 group-hover:text-white/80 transition-all duration-300 group-hover:scale-100 scale-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Lightbox Modal ═══ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Galleria immagini"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[101] text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label={t.gallery_close}
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-[101] text-white/50 text-sm">
            {currentIndex + 1} {t.gallery_of} {images.length}
          </div>

          {/* Previous */}
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-6 z-[101] text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label={t.gallery_prev}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-6 z-[101] text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label={t.gallery_next}
          >
            <ChevronRight size={32} />
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Caption */}
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center">
            <p className="text-white/60 text-sm max-w-lg mx-auto px-4">
              {images[currentIndex].alt.split('—')[0].trim()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
