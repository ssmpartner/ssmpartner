import { Link } from "react-router-dom";
import { Heart, MessageSquare, Eye, Pin, AlertTriangle } from "lucide-react";

export interface NewsCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  is_important: boolean;
  is_highlight: boolean;
  category?: { name: string; color: string } | null;
  _count?: { likes: number; comments: number; views: number };
}

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric" });
};

export const NewsCard = ({ news, variant = "default" }: { news: NewsCardData; variant?: "default" | "highlight" | "compact" }) => {
  const date = formatDate(news.published_at || news.created_at);

  if (variant === "highlight") {
    return (
      <Link
        to={`/portal/news/${news.slug}`}
        className="group relative block overflow-hidden rounded-3xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-[16/10] md:aspect-auto md:min-h-[320px] bg-muted overflow-hidden relative">
            {news.cover_image_url ? (
              <img src={news.cover_image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5" />
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                <Pin size={12} /> Highlight
              </span>
              {news.is_important && (
                <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  <AlertTriangle size={12} /> Wichtig
                </span>
              )}
            </div>
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                {news.category && (
                  <span className="font-semibold uppercase tracking-wide" style={{ color: news.category.color }}>
                    {news.category.name}
                  </span>
                )}
                <span>•</span>
                <span>{date}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                {news.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed line-clamp-3">{news.excerpt}</p>
            </div>
            <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {news._count?.views ?? 0}</span>
              <span className="inline-flex items-center gap-1.5"><Heart size={14} /> {news._count?.likes ?? 0}</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare size={14} /> {news._count?.comments ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/portal/news/${news.slug}`} className="group flex gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors">
        <div className="w-20 h-20 shrink-0 rounded-xl bg-muted overflow-hidden">
          {news.cover_image_url ? (
            <img src={news.cover_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {news.category && <span className="font-semibold" style={{ color: news.category.color }}>{news.category.name}</span>}
            <span>•</span>
            <span>{date}</span>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{news.title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/portal/news/${news.slug}`} className="group block overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[16/10] bg-muted overflow-hidden relative">
        {news.cover_image_url ? (
          <img src={news.cover_image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        {news.is_important && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-destructive text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            <AlertTriangle size={11} /> Wichtig
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          {news.category && <span className="font-semibold uppercase tracking-wide" style={{ color: news.category.color }}>{news.category.name}</span>}
          <span>•</span>
          <span>{date}</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">{news.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{news.excerpt}</p>
        {news.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {news.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Eye size={12} /> {news._count?.views ?? 0}</span>
          <span className="inline-flex items-center gap-1"><Heart size={12} /> {news._count?.likes ?? 0}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {news._count?.comments ?? 0}</span>
        </div>
      </div>
    </Link>
  );
};