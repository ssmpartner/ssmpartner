---
name: News & Kommunikation System
description: Internes News/Blog-System im Portal mit Pflicht-Lesebestätigung, Dringend-Banner, Kommentaren und Statistik
type: feature
---
Internes News-System auf /portal mit Blog-Style Detailseite (/portal/news, /portal/news/:slug).
- Tabellen: news_posts, news_categories, news_visibility_roles, news_visibility_agencies, news_views, news_acknowledgements, news_comments, news_likes
- Sichtbarkeit pro News: 'all' | 'roles' | 'agencies' | 'mixed' (kombinierbar via Junction-Tables)
- is_important: blockierendes Popup (ImportantNewsModal) bei Portal-Öffnung mit Pflicht-Lesebestätigung
- is_urgent_banner: roter Banner oben im Portal (UrgentNewsBanner)
- is_highlight: hervorgehobene Top-Card auf News-Übersicht
- comments_enabled: pro Post togglebar; Superadmin kann moderieren (hide/delete)
- Statistik: Views (wer/wann), Acknowledgements, Likes, Kommentare-Anzahl pro Post
- Verwaltung: /admin/news mit 3 Tabs (Beiträge / Kategorien / Statistik)
- Helper-Function: public.can_view_news(post_id, user_id) für RLS visibility check
- Portal zeigt latest 10 News unter den App-Kacheln, "Alle anzeigen" → /portal/news