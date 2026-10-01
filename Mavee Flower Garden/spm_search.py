"""Read visible text from this folder's website for the chat assistant."""

from html.parser import HTMLParser
from pathlib import Path


class _VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self._ignored_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() in {"script", "style", "noscript"}:
            self._ignored_depth += 1

    def handle_endtag(self, tag):
        if tag.lower() in {"script", "style", "noscript"} and self._ignored_depth:
            self._ignored_depth -= 1

    def handle_data(self, data):
        text = " ".join(data.split())
        if text and not self._ignored_depth:
            self.parts.append(text)


def get_farm_information():
    """Return readable page text to ground chat answers in the website."""
    page = Path(__file__).with_name("index.html")
    if not page.exists():
        return "Mavee Flower Garden is located in Batticaloa, Sri Lanka."

    parser = _VisibleText()
    parser.feed(page.read_text(encoding="utf-8"))
    return " ".join(parser.parts)[:12000]
