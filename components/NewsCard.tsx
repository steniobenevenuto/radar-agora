
"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/news";

type NewsCardProps = {
  item: NewsItem;
};

export default function NewsCard({ item }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);

  const publishedDate = new Date(item.publishedAt);

  const formattedDate = Number.isNaN(publishedDate.getTime())
    ? ""
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(publishedDate);

  const hasImage = Boolean(item.imageUrl) && !imageError;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ler notícia: ${item.title}`}
        className="relative block aspect-[16/9] overflow-hidden bg-[#10243a]"
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#10243a] to-[#1b3c5b] text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e53935] text-2xl font-black">
              R
            </div>

            <span className="mt-3 text-lg font-black tracking-wide">
              RADAR <span className="text-red-400">AGORA</span>
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-slate-300">
              NOTÍCIAS DO CEARÁ
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-md bg-[#e53935] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
          {item.category}
        </span>
      </a>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-extrabold leading-snug text-slate-900">
          {item.title}
        </h2>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {item.summary}
        </p>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            {item.source}
            {formattedDate ? ` · ${formattedDate}` : ""}
          </p>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-bold text-red-600 hover:text-red-800"
          >
            Ler notícia completa →
          </a>
        </div>
      </div>
    </article>
  );
}
