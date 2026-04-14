import { Wheat, Hand, Timer, Flame } from 'lucide-react';
import { BUSINESS } from '../lib/config';
import { useLang } from '../App';

export default function About() {
  const { t } = useLang();
  const yearsOfTradition = new Date().getFullYear() - 1977;

  const values = [
    {
      icon: <Wheat size={24} />,
      title: t.about_value1_title,
      desc: t.about_value1_desc,
    },
    {
      icon: <Hand size={24} />,
      title: t.about_value2_title,
      desc: t.about_value2_desc,
    },
    {
      icon: <Flame size={24} />,
      title: t.about_value3_title,
      desc: t.about_value3_desc,
    },
  ];

  const processSteps = [
    { icon: <Wheat size={20} />, label: t.about_process_step1 },
    { icon: <Hand size={20} />, label: t.about_process_step2 },
    { icon: <Timer size={20} />, label: t.about_process_step3 },
    { icon: <Flame size={20} />, label: t.about_process_step4 },
  ];

  return (
    <section id="chi-siamo" className="py-16 sm:py-20 lg:py-24 bg-[#111111] border-y border-[#2a2725]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ Section Title ═══ */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-wide">
            {t.about_title}
          </h2>
          <p className="text-white/65 mt-4 max-w-lg mx-auto text-sm sm:text-base">
            {t.about_subtitle}
          </p>
        </div>

        {/* ═══ Years Badge ═══ */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-bg-card border border-[#2a2725] rounded-2xl px-8 py-4">
            <span className="font-heading text-4xl sm:text-5xl text-primary font-bold">{yearsOfTradition}</span>
            <span className="text-white/60 text-sm leading-tight text-left">{t.products_tradition}</span>
          </div>
        </div>

        {/* ═══ Story + Photo ═══ */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16">

          {/* Story */}
          <div className="flex-1 text-center lg:text-left">
            <h3 className="font-heading text-2xl sm:text-3xl text-white mb-6">
              {t.about_story_title}
            </h3>
            <div className="space-y-4 text-white/70 text-sm sm:text-base leading-relaxed">
              <p>{t.about_story_p1}</p>
              <p>{t.about_story_p2}</p>
              <p>{t.about_story_p3}</p>
            </div>
          </div>

          {/* Store Photo */}
          <div className="shrink-0">
            <div className="w-72 sm:w-80 lg:w-96 aspect-[4/3] bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2725] shadow-2xl shadow-black/30">
              <img
                src="/images/storefront.jpg"
                alt={`Esterno del ${BUSINESS.name} — ${BUSINESS.address}`}
                className="img-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width="400"
                height="300"
              />
            </div>
          </div>
        </div>

        {/* ═══ Values Grid ═══ */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl sm:text-3xl text-white text-center mb-8">
            {t.about_values_title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-bg-card rounded-2xl border border-[#2a2725] p-6 sm:p-8 text-center hover:border-primary/20 transition-all duration-300 reveal"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {v.icon}
                </div>
                <h4 className="font-heading text-xl text-white mb-3">{v.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Process Steps ═══ */}
        <div>
          <h3 className="font-heading text-2xl sm:text-3xl text-white text-center mb-8">
            {t.about_process_title}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    {step.icon}
                  </div>
                  <span className="text-white/70 text-xs sm:text-sm text-center max-w-[120px]">
                    {step.label}
                  </span>
                </div>
                {i < processSteps.length - 1 && (
                  <div className="hidden sm:block w-8 lg:w-16 h-px bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Quote ═══ */}
        <div className="mt-16 pt-10 border-t border-[#2a2725]/30">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block mb-5">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-primary/30">
                <path d="M10 25C10 18 14 12 22 12C26 12 28 14 28 18C28 22 26 24 22 24C20 24 18 23 17 22C16 24 14 26 10 25Z" fill="currentColor"/>
                <path d="M26 25C26 18 30 12 38 12C40 12 40 14 40 18C40 22 38 24 34 24C32 24 30 23 29 22C28 24 26 26 26 25Z" fill="currentColor"/>
              </svg>
            </div>
            <blockquote className="font-heading text-xl sm:text-2xl lg:text-3xl text-white/90 leading-relaxed italic mb-6">
              {t.quote_text}
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-primary/50" />
              <p className="text-primary font-heading text-base font-semibold">
                {t.quote_author}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
