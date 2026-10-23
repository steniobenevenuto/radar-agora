import Parser from "rss-parser";
import { NextResponse } from "next/server";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
      ["source", "rssSource"],
    ],
  },
});

const GOOGLE_SEARCHES = [
  "Ceará notícias",
  "Fortaleza Ceará notícias",
  "Sobral Ceará notícias",
  "Juazeiro do Norte Ceará notícias",
  "Crato Ceará notícias",
  "Iguatu Ceará notícias",
  "Quixadá Ceará notícias",
  "Itapipoca Ceará notícias",
  "Canindé Ceará notícias",
  "Aracati Ceará notícias",
  "Tianguá Ceará notícias",
  "Crateús Ceará notícias",
  "Limoeiro do Norte Ceará notícias",
  "Camocim Ceará notícias",
  "Tauá Ceará notícias",
  "governo Ceará economia política",
];

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q=";
const FEED_PARAMS = "&hl=pt-BR&gl=BR&ceid=BR:pt-419";

const DIRECT_FEEDS = [
  {
    name: "O POVO",
    url: "https://www.opovo.com.br/rss/ultimas-noticias/",
  },
];

type RssImageFields = {
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string }; url?: string };
  mediaThumbnail?: { $?: { url?: string }; url?: string };
  content?: string;
  contentEncoded?: string;
  contentSnippet?: string;
  description?: string;
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  rssSource?: { $?: { url?: string }; _?: string };
};

type NewsCandidate = {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl?: string;
  featured: boolean;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classifica pelo título, dando prioridade ao assunto principal.
 * Categorias de localização só são usadas quando não há um tema editorial
 * mais específico no título.
 */
function getCategory(title: string): string {
  const text = normalizeText(title);

  // Esportes
  if (
    /\b(futebol|ceara sc|ceara sporting club|fortaleza ec|fortaleza esporte clube|futsal|volei|basquete|esporte|esportes|campeonato|copa do brasil|serie a|serie b|sub-?20|tricolor|jogador|tecnico de futebol|semifinal|quartas de final|gol|partida|torcida|classificacao do campeonato|kitesurf|kite surf|kite fest|windsurf|vela esportiva)\b/.test(
      text,
    )
  ) {
    return "Esportes";
  }

  // Trânsito e mobilidade
  if (
    /\b(transito|engarrafamento|acidente de transito|rodovia|ce-\d{3}|mobilidade urbana|interditada|interdicao de via|buraco em via|cratera|colisao|congestionamento|onibus|metro|metrô|linha de transporte)\b/.test(
      text,
    )
  ) {
    return "Trânsito";
  }

  // Segurança pública
  if (
    /\b(policia|assalto|homicidio|violencia|seguranca publica|prisao|preso|suspeito|operacao policial|crime|criminoso|roubo|furto|trafico de drogas|morto a tiros|forcas de seguranca|organizacao criminosa|drogas apreendidas|investigacao policial)\b/.test(
      text,
    )
  ) {
    return "Segurança";
  }

  // Política
  if (
    /\b(politica|prefeitura|vereador|governador|eleicao|assembleia legislativa|deputado|camara municipal|senador|candidato|urna eletronica|tse|justica eleitoral|secretario de estado|gestao municipal|projeto de lei|lei aprovada)\b/.test(
      text,
    )
  ) {
    return "Política";
  }

  // Cultura e patrimônio: antes de Economia para evitar que "ferrovia" domine o assunto.
  if (
    /\\b(museu|visita mediada|patrimonio historico|patrimonio cultural|acessibilidade cultural|libras|exposicao|exposicoes|acervo|memoria ferroviaria|programacao cultural)\\b/.test(
      text,
    )
  ) {
    return "Entretenimento";
  }

  // Economia, infraestrutura, obras e negócios
  if (
    /\b(economia|emprego|comercio|empresa|salario|empreendedor|industria|agricultura|investimento|mercado de trabalho|contratacao|desemprego|construcao civil|inflacao|ferrovia|ferrovias|logistica|galpao|galpoes|porto|aeroporto|infraestrutura|obra|obras|rodovia|duplicacao|empreendimento|negocios|negócios|faturamento|exportacao|exportacoes|importacao|energia renovavel|energia solar|parque industrial|polo industrial|shopping|loja|varejo|turismo de negocios)\b/.test(
      text,
    )
  ) {
    return "Economia";
  }

  // Serviços públicos, saúde, educação e utilidade pública
  if (
    /\b(vacina|vacinacao|saude|hospital|medico|medica|escola|educacao|matricula|concurso publico|inscricoes|cursos tecnicos|gratuito|gratuita|servico publico|abastecimento de agua|falta de agua|energia eletrica|beneficio social|atendimento|documentos|calendario de pagamento|defesa civil|previsao do tempo|chuva|chuvas|alerta meteorologico)\b/.test(
      text,
    )
  ) {
    return "Serviços";
  }

  // Cultura e entretenimento: só depois de temas mais específicos
  if (
    /\b(show|festival|cinema|cultura|entretenimento|artista|musica|teatro|exposicao|espetaculo|museu|cantor|cantora|album|filme|serie de tv|programacao cultural|humorista|celebridade)\b/.test(
      text,
    )
  ) {
    return "Entretenimento";
  }

  // Localização: aplicada apenas se nenhuma categoria temática correspondeu
  if (
    /\b(fortaleza|grande fortaleza|regiao metropolitana de fortaleza)\b/.test(
      text,
    )
  ) {
    return "Fortaleza";
  }

  if (
    /\b(caucaia|maracanau|juazeiro do norte|sobral|crato|iguatu|quixada|itapipoca|caninde|aracati|crateus|tiangua|barbalha|eusebio|aquiraz|horizonte|pacajus|limoeiro do norte|camocim|taua|brejo santo|morada nova|baturite|ico|acopiara|boa viagem|cedro|coreau|icapui|ipueiras|itapaje|jaguaribe|massape|mombaca|nova russas|paracuru|pentecoste|santa quiteria|sao benedito|sao goncalo do amarante|tabuleiro do norte|tamboril|ubajara|varjota|vicosa do ceara|interior do ceara)\b/.test(
      text,
    )
  ) {
    return "Interior";
  }

  return "Ceará";
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

function normalizeTitle(title: string): string {
  return title.replace(/\s+-\s+[^-]+$/, "").trim();
}

function getSource(title: string, fallback = "Google Notícias"): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : fallback;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function absoluteUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const decoded = decodeHtml(value.trim());
  if (isHttpUrl(decoded)) return decoded;

  return undefined;
}

function getImageUrl(item: RssImageFields): string | undefined {
  const enclosureImage =
    item.enclosure?.type?.toLowerCase().startsWith("image/")
      ? item.enclosure.url
      : undefined;

  const candidates = [
    enclosureImage,
    item.mediaContent?.$?.url,
    item.mediaContent?.url,
    item.mediaThumbnail?.$?.url,
    item.mediaThumbnail?.url,
  ];

  for (const candidate of candidates) {
    const image = absoluteUrl(candidate);
    if (
      image &&
      !/logo|avatar|icon|sprite|pixel|placeholder|favicon/i.test(image)
    ) {
      return image;
    }
  }

  return undefined;
}

function getSummary(item: RssImageFields): string {
  const raw =
    item.contentSnippet ||
    item.content ||
    item.contentEncoded ||
    item.description ||
    "";

  const plain = decodeHtml(raw.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > 240
    ? `${plain.slice(0, 237).trim()}...`
    : plain ||
        "Acesse a publicação original para conferir os detalhes desta notícia.";
}

async function fetchFeed(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "RadarAgoraCeara/1.0",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Feed respondeu HTTP ${response.status}`);
  }

  return parser.parseString(await response.text());
}

export async function GET() {
  try {
    const feedTasks = [
      ...DIRECT_FEEDS.map(async (feed) => {
        const parsed = await fetchFeed(feed.url);

        return {
          name: feed.name,
          items: (parsed.items ?? []) as RssImageFields[],
        };
      }),
      ...GOOGLE_SEARCHES.map(async (query) => {
        const url =
          GOOGLE_NEWS_RSS + encodeURIComponent(query) + FEED_PARAMS;
        const parsed = await fetchFeed(url);

        return {
          name: "Google Notícias",
          items: (parsed.items ?? []) as RssImageFields[],
        };
      }),
    ];

    const settled = await Promise.allSettled(feedTasks);

    const successfulFeeds = settled
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<{
          name: string;
          items: RssImageFields[];
        }> => result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (successfulFeeds.length === 0) {
      throw new Error("Nenhuma fonte de notícias respondeu.");
    }

    const seen = new Set<string>();
    const uniqueArticles: NewsCandidate[] = [];

    for (const feed of successfulFeeds) {
      for (const item of feed.items) {
        if (!item.title || !item.link || !isHttpUrl(item.link)) continue;

        const sourceUrl = item.link.trim();
        const key = sourceUrl.toLowerCase();

        if (seen.has(key)) continue;
        seen.add(key);

        const originalTitle = item.title.trim();
        const rssSource = item.rssSource?._?.trim();

        uniqueArticles.push({
          id: sourceUrl,
          title: normalizeTitle(originalTitle),
          summary: getSummary(item),
          category: getCategory(normalizeTitle(originalTitle)),
          source: rssSource || getSource(originalTitle, feed.name),
          sourceUrl,
          publishedAt: item.isoDate || item.pubDate || "",
          ...(getImageUrl(item) ? { imageUrl: getImageUrl(item) } : {}),
          featured: false,
        });
      }
    }

    uniqueArticles.sort((a, b) => {
      const dateA = Date.parse(a.publishedAt);
      const dateB = Date.parse(b.publishedAt);

      return (
        (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0)
      );
    });

    // Janela móvel: retorna somente as 40 notícias mais recentes; as antigas deixam de aparecer na resposta.
    const finalArticles = uniqueArticles.slice(0, 40).map((article, index) => ({
      ...article,
      featured: index === 0,
    }));

    return NextResponse.json(
      {
        region: "Ceará",
        updatedAt: new Date().toISOString(),
        total: finalArticles.length,
        sourcesChecked: successfulFeeds.length,
        articles: finalArticles,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("Erro ao buscar notícias do Ceará:", error);

    return NextResponse.json(
      {
        error: "Não foi possível buscar as notícias do Ceará agora.",
        articles: [],
      },
      { status: 502 },
    );
  }
}
