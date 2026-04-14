import { ShoppingCart, MessageCircle, Store } from 'lucide-react';
import { useLang } from '../App';

export default function HowToOrder() {
  const { t } = useLang();

  const steps = [
    {
      icon: <ShoppingCart size={28} />,
      title: t.howto_step1_title,
      desc: t.howto_step1_desc,
    },
    {
      icon: <MessageCircle size={28} />,
      title: t.howto_step2_title,
      desc: t.howto_step2_desc,
    },
    {
      icon: <Store size={28} />,
      title: t.howto_step3_title,
      desc: t.howto_step3_desc,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#0a0a0a] border-y border-[#2a2725]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ Section Title ═══ */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-wide">
            {t.howto_title}
          </h2>
          <p className="text-white/65 mt-4 max-w-lg mx-auto text-sm sm:text-base">
            {t.howto_subtitle}
          </p>
        </div>

        {/* ═══ Steps Grid ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center group reveal">
              {/* Icon circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                <span className="text-primary">{step.icon}</span>
              </div>

              {/* Step number */}
              <span className="text-primary/40 text-xs font-bold tracking-[0.25em] uppercase mb-2 block">
                Step {i + 1}
              </span>

              {/* Title */}
              <h3 className="font-heading text-xl sm:text-2xl text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ═══ Connector Lines (desktop) ═══ */}
        <div className="hidden md:block">
          {/* These are decorative SVG lines between steps */}
        </div>
      </div>
    </section>
  );
}
