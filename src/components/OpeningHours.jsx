import { Clock } from 'lucide-react';
import { HOURS, BUSINESS } from '../lib/config';
import { useLang } from '../App';

export default function OpeningHours() {
  const { t } = useLang();

  const todayIndex = new Date().getDay();
  // JS getDay(): 0=Sunday, 1=Monday... Our HOURS: 0=Lunedì(Monday), 6=Domenica(Sunday)
  const mappedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <section id="orari" className="py-16 sm:py-20 lg:py-24 bg-bg-elevated border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* ═══ Left: Info ═══ */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-5">
              <Clock size={24} className="text-primary" />
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight">
                {t.hours_title}
              </h2>
            </div>
            <p className="text-text-muted mb-8 max-w-md text-sm sm:text-base">
              {t.hours_subtitle}
            </p>

            {/* Hours list */}
            <div className="space-y-3 max-w-sm mx-auto lg:mx-0">
              {HOURS.map((h, i) => {
                const isToday = i === mappedToday;
                const isOpen = h.hours !== 'Chiuso';
                return (
                  <div
                    key={h.day}
                    className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-300 ${
                      isToday
                        ? 'bg-primary/10 border border-primary/20'
                        : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                          {t.hours_today}
                        </span>
                      )}
                      <span className={`text-sm ${isToday ? 'text-text font-semibold' : 'text-text-muted'}`}>
                        {h.day}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isToday
                        ? 'text-primary'
                        : isOpen
                        ? 'text-text/80'
                        : 'text-text-dim'
                    }`}>
                      {isOpen ? h.hours : t.closed}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ Right: Visual card ═══ */}
          <div className="shrink-0">
            <div className="w-72 sm:w-80 lg:w-96 bg-bg-card rounded-2xl border border-border p-8 text-center shadow-2xl shadow-black/30">
              {/* Status indicator */}
              {(() => {
                const currentHour = new Date().getHours();
                const currentDay = new Date().getDay();
                const mappedDay = currentDay === 0 ? 6 : currentDay - 1;
                const todayHours = HOURS[mappedDay];
                const isCurrentlyOpen = todayHours && todayHours.hours !== 'Chiuso' && currentHour >= 10 && currentHour < 19;

                return (
                  <>
                    <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${isCurrentlyOpen ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                    <p className={`font-heading text-lg mb-1 ${isCurrentlyOpen ? 'text-green-400' : 'text-text-dim'}`}>
                      {isCurrentlyOpen ? t.hours_open : t.hours_closed}
                    </p>
                    {todayHours && todayHours.hours !== 'Chiuso' && (
                      <p className="text-text-dim text-xs">{todayHours.hours}</p>
                    )}
                  </>
                );
              })()}

              {/* Address */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-text-dim text-sm">{BUSINESS.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm mt-2 inline-block hover:underline"
                >
                  Vedi su Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
