import logging
import re
import requests
from bs4 import BeautifulSoup
from typing import Any

logger = logging.getLogger(__name__)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def scrape_article(url: str) -> dict[str, Any]:
    try:
        resp = requests.get(url, headers=_HEADERS, timeout=15)
        resp.raise_for_status()

    except requests.exceptions.Timeout:
        logger.warning("scrape timeout | url=%s", url)
        raise ValueError("The website took too long to respond.")

    except requests.exceptions.ConnectionError as exc:
        logger.warning("scrape connection error | url=%s | exc=%s", url, exc)
        raise ValueError("Could not reach this website. Please check the URL.")

    except requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else "?"
        logger.warning("scrape HTTP %s | url=%s", status, url)
        if status == 403:
            raise ValueError("This website blocks automated article extraction.")
        if status == 404:
            raise ValueError("Article not found.")
        if status == 429:
            raise ValueError("This website is rate-limiting requests. Try again later.")
        if isinstance(status, int) and status >= 500:
            raise ValueError("The website is currently unavailable (server error).")
        raise ValueError(f"The website returned an unexpected error (HTTP {status}).")

    except requests.RequestException as exc:
        logger.warning("scrape request error | url=%s | exc=%s", url, exc)
        raise ValueError("Something went wrong while fetching this article.")

    soup = BeautifulSoup(resp.content, "lxml")

    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "figure"]):
        tag.decompose()

    title = _extract_title(soup)
    text = _extract_text(soup)

    if len(text) < 100:
        raise ValueError("Could not extract meaningful article content from this page.")

    truncated = text[:10_000]
    return {
        "title": title,
        "text": truncated,
        "url": url,
        "word_count": len(truncated.split()),
    }


def _extract_title(soup: BeautifulSoup) -> str:
    og = soup.find("meta", property="og:title")
    if og and og.get("content"):
        return og["content"].strip()
    h1 = soup.find("h1")
    if h1:
        return h1.get_text().strip()
    title = soup.find("title")
    return title.get_text().strip() if title else "Unknown Title"


def _extract_text(soup: BeautifulSoup) -> str:
    for selector in [
        soup.find("article"),
        soup.find("main"),
        soup.find("div", {"class": re.compile(r"content|article|post|story|body", re.I)}),
    ]:
        if selector:
            paras = selector.find_all("p")
            text = " ".join(p.get_text() for p in paras)
            if len(text) > 200:
                return _clean(text)

    paras = soup.find_all("p")
    return _clean(" ".join(p.get_text() for p in paras))


def _clean(text: str) -> str:
    text = re.sub(r"\[.*?\]", "", text)
    return re.sub(r"\s+", " ", text).strip()
