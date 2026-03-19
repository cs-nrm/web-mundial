import puppeteer from "puppeteer";

// Simple in-memory cache to avoid launching Puppeteer on every request.
const cache = {
  data: null,
  ts: 0,
};

const CACHE_TTL_MS = 1000 * 60 * 2; // 2 minutes

export async function fetchEnfoqueWithHeadlessBrowser(url) {
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    if (!response) {
      throw new Error("No response received from enfoque endpoint");
    }

    const status = response.status();
    if (status !== 200) {
      const text = await response.text();
      throw new Error(`Headless fetch returned status ${status}: ${text.slice(0, 200)}`);
    }

    const rawText = await response.text();
    const data = JSON.parse(rawText);

    cache.data = data;
    cache.ts = Date.now();

    return data;
  } finally {
    await browser.close();
  }
}
