import requests
from bs4 import BeautifulSoup


SPM_WEBSITES = [
    "https://academy.spm.industries/",
    "https://tech.spm.industries/"
]


def scrape_website(url):

    try:
        response = requests.get(url, timeout=10)

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        # Remove scripts and styles
        for tag in soup(["script", "style"]):
            tag.extract()

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        return text

    except Exception as e:
        return ""


def get_spm_information():

    website_text = ""

    for site in SPM_WEBSITES:
        website_text += scrape_website(site)
        website_text += "\n\n"

    return website_text

