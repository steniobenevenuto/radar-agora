
"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news";
import NewsCard from "@/components/NewsCard";

const categories = [
  "Últimas notícias",
  "Ceará",
  "Fortaleza",
  "Interior",
  "Política",
  "Segurança",
  "Trânsito",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Serviços",
];

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState("Últimas notícias");

  useEffect(() => {
    let cancelled = false;
    let loading = false;

    async function loadNews() {
      if (loading) return;

      loading = true;

      try {
        const response = await fetch("/api/news", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as notícias.");
        }

        const data: { articles?: NewsItem[] } =
          await response.json();

        if (!Array.isArray(data.articles)) {
          throw new Error(
            "A resposta da API não contém uma lista de notícias."
          );
        }

        if (!cancelled) {
          setNewsItems(data.articles);
          setNewsError(false);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);

        if (!cancelled) {
          setNewsError(true);
        }
      } finally {
        loading = false;

        if (!cancelled) {
          setLoadingNews(false);
        }
      }
    }

    loadNews();

    const intervalId = window.setInterval(() => {
      loadNews();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const featuredNews =
    newsItems.find((item) => item.featured) ?? newsItems[0];

  const filteredNews =
    activeCategory === "Últimas notícias" ||
    activeCategory === "Ceará"
      ? newsItems
      : newsItems.filter(
          (item) => item.category === activeCategory
        );

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <div className="bg-[#10243a] px-4 py-2 text-center text-xs font-medium tracking-wide text-slate-200">
        RADAR AGORA • CEARÁ
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-6 md:flex-row md:items-center">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e53935] text-2xl font-black text-white">
              R
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                RADAR <span className="text-[#e53935]">AGORA</span>
              </h1>

              <p className="text-xs tracking-[0.18em] text-slate-500">
                NOTÍCIAS DE TODO O CEARÁ
              </p>
            </div>
          </a>

          <p className="text-sm text-slate-500">
            Informação local, com responsabilidade.
          </p>
        </div>

        <nav className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto whitespace-nowrap px-5 py-4">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  document
                    .getElementById("noticias")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-sm font-semibold transition hover:text-red-600 ${
                  activeCategory === category
                    ? "text-[#e53935]"
                    : "text-slate-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Espaço publicitário superior */}
      <div className="mx-auto max-w-7xl px-5 pt-7">
        <a
          href="#anuncie"
          className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center transition hover:border-red-300"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
            ESPAÇO PUBLICITÁRIO
          </span>

          <h2 className="text-lg font-extrabold sm:text-xl">
            Sua marca em destaque no Radar Agora
          </h2>

          <p className="text-sm text-slate-500">
            Divulgue sua empresa para o público do Ceará.
          </p>

          <span className="mt-2 text-sm font-bold text-red-600">
            Conheça nossos espaços →
          </span>
        </a>
      </div>

      {/* Destaque principal */}
      <section className="mx-auto max-w-7xl px-5 py-9">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-[#e53935]" />

          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Ceará em destaque
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe os acontecimentos em todo o estado.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <article className="flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl bg-[#10243a] p-6 text-white sm:min-h-[370px] sm:p-9">
            <span className="mb-3 text-xs font-bold tracking-widest text-red-300">
              {featuredNews
                ? "NOTÍCIA EM DESTAQUE"
                : "RADAR DO CEARÁ"}
            </span>

            <h3 className="max-w-2xl text-2xl font-black leading-tight sm:text-4xl">
              {loadingNews
                ? "Buscando as notícias do Ceará..."
                : featuredNews?.title ??
                  "As principais notícias do Ceará estarão aqui."}
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {featuredNews?.summary ??
                (loadingNews
                  ? "Estamos consultando as fontes de notícias."
                  : "Acompanhe informações, atualizações e notícias de interesse dos cearenses.")}
            </p>

            {featuredNews ? (
              <a
                href={featuredNews.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-bold text-white hover:text-red-300"
              >
                Ler notícia na fonte original →
              </a>
            ) : (
              <p className="mt-6 text-xs text-slate-400">
                {newsError
                  ? "Não foi possível consultar as notícias. Tente atualizar a página."
                  : loadingNews
                    ? "Carregando conteúdo..."
                    : "Novas notícias serão exibidas aqui assim que estiverem disponíveis."}
              </p>
            )}
          </article>

          <aside className="flex flex-col gap-4">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-red-600">
                RADAR DO CEARÁ
              </span>

              <h3 className="mt-3 text-lg font-extrabold">
                Notícias em um só lugar
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Informações sobre serviços, mobilidade, economia,
                política e cotidiano dos municípios cearenses.
              </p>

              {!loadingNews && (
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  {newsItems.length}{" "}
                  {newsItems.length === 1
                    ? "notícia disponível"
                    : "notícias disponíveis"}
                </p>
              )}
            </div>

            <a
              href="#anuncie"
              className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <span className="text-xs font-bold text-red-600">
                PUBLICIDADE LOCAL
              </span>

              <h3 className="mt-3 text-lg font-extrabold">
                Sua empresa pode aparecer aqui
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Conheça os espaços de divulgação para negócios do Ceará.
              </p>

              <span className="mt-4 inline-block text-sm font-bold text-red-600">
                Saiba mais →
              </span>
            </a>
          </aside>
        </div>
      </section>

      {/* Notícias recebidas pela API */}
      <section
        id="noticias"
        className="mx-auto max-w-7xl px-5 pb-12"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              {activeCategory === "Últimas notícias"
                ? "Últimas notícias"
                : activeCategory === "Ceará"
                  ? "Notícias do Ceará"
                  : activeCategory}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe os principais acontecimentos do Ceará.
            </p>
          </div>

          <span className="self-start rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
            {loadingNews
              ? "Carregando..."
              : `${filteredNews.length} ${
                  filteredNews.length === 1
                    ? "notícia"
                    : "notícias"
                }`}
          </span>
        </div>

        {loadingNews ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-slate-700">
              Carregando notícias do Ceará...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Estamos buscando as últimas atualizações.
            </p>
          </div>
        ) : newsError && newsItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-lg font-extrabold">
              Não conseguimos carregar as notícias
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Verifique sua conexão e tente novamente.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[#e53935] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <span className="text-2xl">📰</span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              {`Nenhuma notícia encontrada em ${activeCategory}`}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Tente outra categoria ou volte mais tarde para conferir
              novas publicações.
            </p>

            {activeCategory !== "Últimas notícias" && (
              <button
                type="button"
                onClick={() =>
                  setActiveCategory("Últimas notícias")
                }
                className="mt-5 text-sm font-bold text-red-600 hover:text-red-800"
              >
                Ver todas as notícias
              </button>
            )}
          </div>
        )}
      </section>

      {/* Chamada para anunciantes */}
      <section
        id="anuncie"
        className="mx-auto max-w-7xl px-5 pb-12"
      >
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-[#10243a] p-7 text-white sm:p-10 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-red-300">
              ANUNCIE NO RADAR AGORA
            </span>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Sua empresa merece ser vista.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Espaços publicitários para empresas e comerciantes do Ceará.
            </p>
          </div>

          <a
            href="https://wa.me/5585986828908?text=Ol%C3%A1%21%20Tenho%20interesse%20em%20anunciar%20minha%20empresa%20no%20Radar%20Agora%20Cear%C3%A1.%20Pode%20me%20passar%20as%20op%C3%A7%C3%B5es%20e%20valores%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-start rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            Anuncie conosco →
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 sm:flex-row">
          <div>
            <p className="font-black">
              RADAR <span className="text-red-600">AGORA</span>
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Portal de notícias do Ceará em desenvolvimento.
            </p>
          </div>

          <p className="self-start text-xs text-slate-400 sm:self-center">
            © 2026 Radar Agora. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
