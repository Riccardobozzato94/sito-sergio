import { Star, ExternalLink, Quote } from 'lucide-react';
import { getSortedReviews, REVIEW_LINKS } from '../lib/reviews';
import { useLang } from '../App';

export default function Reviews() {
  const { t } = useLang();
  const reviews = getSortedReviews(6);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-bg-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ Section Title ═══ */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight">
            {t.reviews_title}
          </h2>
          <p className="text-text-muted mt-3 max-w-md mx-auto text-sm sm:text-base">
            {t.reviews_subtitle}
          </p>
        </div>

        {/* ═══ Platform Links ═══ */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 sm:mb-14">
          {/* TripAdvisor */}
          <a
            href={REVIEW_LINKS.tripadvisor}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-bg-card border border-border rounded-xl px-5 py-3 hover:border-[#34e0a1]/40 transition-all duration-300 group"
          >
            <span className="text-[#34e0a1] font-bold text-xs uppercase tracking-wider">TripAdvisor</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((s) => (
                <Star key={s} size={12} className="text-[#34e0a1] fill-[#34e0a1]" />
              ))}
              <Star size={12} className="text-[#34e0a1] fill-[#34e0a1] opacity-40" />
            </div>
            <ExternalLink size={12} className="text-text-dim group-hover:text-[#34e0a1] transition-colors" />
          </a>

          {/* Google */}
          <a
            href={REVIEW_LINKS.google}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-bg-card border border-border rounded-xl px-5 py-3 hover:border-[#4285f4]/40 transition-all duration-300 group"
          >
            <span className="text-[#4285f4] font-bold text-xs uppercase tracking-wider">Google</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} className="text-[#4285f4] fill-[#4285f4]" />
              ))}
            </div>
            <ExternalLink size={12} className="text-text-dim group-hover:text-[#4285f4] transition-colors" />
          </a>
        </div>

        {/* ═══ Reviews Grid ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="review-card rounded-2xl p-5 sm:p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Header: Author + Rating */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h4 className="text-text font-semibold text-base truncate">{review.author}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={review.source === 'Google' ? 'badge-google' : 'badge-tripadvisor'}>
                      {review.source}
                    </span>
                    <span className="text-text-dim text-xs">{review.date}</span>
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0 ml-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={
                        s <= review.rating
                          ? 'text-primary fill-primary'
                          : 'text-border'
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Snippet */}
              <div className="mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-primary text-sm font-medium italic leading-relaxed">
                  <Quote size={13} className="inline mr-1 -mt-0.5 opacity-50" />
                  {review.snippet}
                </p>
              </div>

              {/* Full text */}
              <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* ═══ CTA to external reviews ═══ */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 sm:mt-12">
          <a
            href={REVIEW_LINKS.tripadvisor}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 border border-border text-text-dim px-6 py-3 rounded-xl text-sm hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            {t.reviews_see_all_ta}
            <ExternalLink size={14} />
          </a>
          <a
            href={REVIEW_LINKS.google}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 border border-border text-text-dim px-6 py-3 rounded-xl text-sm hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            {t.reviews_see_all_google}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
