const NEWS_API_ORG = "NEWS_API_ORG";
const GUARDIAN = "GUARDIAN";
const THE_NEWS_API = "THE_NEWS_API";

const NEWS_SOURCES = [GUARDIAN, NEWS_API_ORG, THE_NEWS_API];

export async function getAggregatedArticles({
  date,
  keyword,
  category,
  sources,
}) {
  const articlesGroups = await Promise.allSettled(
    NEWS_SOURCES.map((source) =>
      getAricles({ source, date, keyword, category, sources })
    )
  );

  const fulfilledArticles = articlesGroups
    .filter((a) => a.status === "fulfilled")
    .map((art) => art.value);

  const normalizedArticles = fulfilledArticles.map((articlesGroup, index) =>
    normalizeArticlesGroup({ source: NEWS_SOURCES[index], articlesGroup })
  );

  return normalizedArticles
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((art) => art.title !== "[Removed]");
}

function normalizeArticlesGroup({ source, articlesGroup = [] }) {
  switch (source) {
    case NEWS_API_ORG:
      return articlesGroup.map((article) => {
        return {
          source: NEWS_API_ORG,
          title: article.title,
          img: article.urlToImage,
          author: article.author,
          sourceUrl: article.url,
          date: new Date(article.publishedAt).toLocaleString(),
          timestamp: new Date(article.publishedAt).getTime(),
          newsSource: article.source.name,
        };
      });
    case GUARDIAN:
      return articlesGroup.map((article) => {
        return {
          source: GUARDIAN,
          title: article.webTitle,
          sourceUrl: article.webUrl,
          date: new Date(article.webPublicationDate).toLocaleString(),
          timestamp: new Date(article.webPublicationDate).getTime(),
          newsSource: "https://www.theguardian.com/",
        };
      });
    case THE_NEWS_API:
      return articlesGroup.map((article) => {
        return {
          source: THE_NEWS_API,
          title: article.title,
          img: article.image_url,
          sourceUrl: article.url,
          date: new Date(article.published_at).toLocaleString(),
          timestamp: new Date(article.published_at).getTime(),
          newsSource: article.source,
        };
      });
    default:
      return articlesGroup;
  }
}

async function getAricles({ source, date, keyword, category, sources }) {
  const shouldShowAllSources = sources.length === 0;

  switch (source) {
    case NEWS_API_ORG: {
      if (
        !shouldShowAllSources &&
        !sources.find((source) => source.source === NEWS_API_ORG)
      ) {
        return [];
      }

      const news_org_url = new URL(`https://newsapi.org/v2/top-headlines`);
      const news_org_params = news_org_url.searchParams;

      news_org_params.set("apiKey", process.env.REACT_APP_NEWS_API_ORG_KEY);

      const activeSources = sources.filter(
        (source) => source.source === NEWS_API_ORG
      );

      if (activeSources.length === 0 && !keyword && !date && !category) {
        news_org_params.set("country", "us");
      }

      if (activeSources.length > 0) {
        news_org_params.set(
          "sources",
          activeSources.map((s) => s.id).join(",")
        );
      } else if (category) {
        news_org_params.set("category", category);
      }

      if (keyword) {
        news_org_params.set("q", keyword);
      }

      if (date) {
        news_org_params.set("from", date);
      }

      news_org_params.set("limit", "10");

      const resp = await fetch(news_org_url.href);
      const news = await resp.json();

      return news.articles;
    }

    case GUARDIAN: {
      if (
        sources.length > 0 &&
        !sources.find((source) => source.source === GUARDIAN)
      )
        return [];

      const guardian_url = new URL("https://content.guardianapis.com/search");
      const guardian_url_params = guardian_url.searchParams;

      guardian_url_params.set(
        "api-key",
        process.env.REACT_APP_GUARDIAN_API_KEY
      );

      if (date) {
        guardian_url_params.set("from-date", date);
      }

      if (keyword) {
        let newKeyword = category ? `${keyword} AND ${category}` : keyword;
        guardian_url_params.set("q", newKeyword);
      }

      const resp = await fetch(guardian_url.href);
      const { response } = await resp.json();
      return response.results;
    }

    case THE_NEWS_API: {
      if (
        !shouldShowAllSources &&
        !sources.find((source) => source.source === THE_NEWS_API)
      ) {
        return [];
      }

      const the_news_api_url = new URL(
        "https://api.thenewsapi.com/v1/news/all"
      );
      const the_news_api_url_params = the_news_api_url.searchParams;

      const activeSources = sources.filter(
        (source) => source.source === THE_NEWS_API
      );

      the_news_api_url_params.set(
        "api_token",
        process.env.REACT_APP_THE_NEWS_API_KEY
      );

      if (date) {
        the_news_api_url_params.set("published_after", date);
      }

      if (keyword) {
        the_news_api_url_params.set("search", keyword);
      }

      if (category) {
        the_news_api_url_params.set("categories", category);
      }

      if (activeSources.length > 0) {
        the_news_api_url_params.set(
          "source_id",
          activeSources.map((s) => s.domain).join(",")
        );
      }

      the_news_api_url_params.set("limit", 10);
      the_news_api_url_params.set("language", "en");

      const resp = await fetch(the_news_api_url.href);
      const news = await resp.json();
      return news.data;
    }

    default:
      return;
  }
}

async function getNewsSources(source) {
  switch (source) {
    case NEWS_API_ORG:
      const news_org_url = new URL(
        `https://newsapi.org/v2/top-headlines/sources`
      );
      const news_org_params = news_org_url.searchParams;
      news_org_params.set("apiKey", process.env.REACT_APP_NEWS_API_ORG_KEY);

      news_org_params.set("limit", "10");

      const resp = await fetch(news_org_url.href);
      const news = await resp.json();

      return news.sources.map((source) => {
        return { source: NEWS_API_ORG, id: source.id, domain: source.url };
      });

    case GUARDIAN:
      return [
        {
          source: GUARDIAN,
          id: "guardian",
          domain: "https://www.theguardian.com/",
        },
      ];

    case THE_NEWS_API:
      const the_news_api_url = new URL(
        "https://api.thenewsapi.com/v1/news/sources"
      );
      const the_news_api_url_params = the_news_api_url.searchParams;
      the_news_api_url_params.set(
        "api_token",
        process.env.REACT_APP_THE_NEWS_API_KEY
      );

      the_news_api_url_params.set("limit", 10);
      the_news_api_url_params.set("language", "en");

      const resp2 = await fetch(the_news_api_url.href);
      const sources = await resp2.json();
      return sources.data.map((dataItem) => {
        return {
          source: THE_NEWS_API,
          id: dataItem.domain,
          domain: dataItem.source_id,
        };
      });
    default:
      return;
  }
}

export async function fetchNewsSources() {
  const sourcesGroups = await Promise.allSettled(
    NEWS_SOURCES.map((source) => getNewsSources(source))
  );

  const fulfilledSourceGroups = sourcesGroups
    .filter((a) => a.status === "fulfilled")
    .map((art) => art.value);

  return fulfilledSourceGroups.flat();
}
