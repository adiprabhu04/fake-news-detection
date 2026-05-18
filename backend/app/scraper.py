import re
import requests
from bs4 import BeautifulSoup
from typing import Any

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
    except requests.RequestException as exc:
        raise ValueError(f"Could not fetch URL: {exc}") from exc

    soup = BeautifulSoup(resp.content, "lxml")

    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "figure"]):
        tag.decompose()

    title = _extract_title(soup)
    text = _extract_text(soup)

    if len(text) < 100:
        raise ValueError("Could not extract meaningful content from this URL")

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
