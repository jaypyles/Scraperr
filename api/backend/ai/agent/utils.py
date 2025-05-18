from lxml import html, etree
import re
from playwright.async_api import Page

from api.backend.models import CapturedElement


def convert_to_markdown(html_str: str):
    parser = html.HTMLParser()
    tree = html.fromstring(html_str, parser=parser)
    root = tree.getroottree()

    def format_attributes(el: etree._Element) -> str:
        """Convert element attributes into a string."""
        return " ".join(f'{k}="{v}"' for k, v in el.attrib.items())

    def is_visible(el: etree._Element) -> bool:
        style = el.attrib.get("style", "").lower()
        class_ = el.attrib.get("class", "").lower()

        # Check for visibility styles
        if "display: none" in style or "visibility: hidden" in style:
            return False
        if "opacity: 0" in style or "opacity:0" in style:
            return False
        if "height: 0" in style or "width: 0" in style:
            return False

        # Check for common hidden classes
        if any(
            hidden in class_
            for hidden in ["hidden", "invisible", "truncate", "collapse"]
        ):
            return False

        # Check for hidden attributes
        if el.attrib.get("hidden") is not None:
            return False
        if el.attrib.get("aria-hidden") == "true":
            return False

        # Check for empty or whitespace-only content
        if not el.text and len(el) == 0:
            return False

        return True

    def is_layout_or_decorative(el: etree._Element) -> bool:
        tag = el.tag.lower()

        # Layout elements
        if tag in {"nav", "footer", "header", "aside", "main", "section"}:
            return True

        # Decorative elements
        if tag in {"svg", "path", "circle", "rect", "line", "polygon", "polyline"}:
            return True

        # Check id and class for layout/decorative keywords
        id_class = " ".join(
            [el.attrib.get("id", ""), el.attrib.get("class", "")]
        ).lower()

        layout_keywords = {
            "sidebar",
            "nav",
            "header",
            "footer",
            "menu",
            "advert",
            "ads",
            "breadcrumb",
            "container",
            "wrapper",
            "layout",
            "grid",
            "flex",
            "row",
            "column",
            "section",
            "banner",
            "hero",
            "card",
            "modal",
            "popup",
            "tooltip",
            "dropdown",
            "overlay",
        }

        return any(keyword in id_class for keyword in layout_keywords)

    # Tags to ignore in the final markdown output
    included_tags = {
        "div",
        "span",
        "a",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "img",
        "button",
        "input",
        "textarea",
        "ul",
        "ol",
        "li",
        "table",
        "tr",
        "td",
        "th",
        "input",
        "textarea",
        "select",
        "option",
        "optgroup",
        "fieldset",
        "legend",
    }

    special_elements = []
    normal_elements = []

    for el in tree.iter():
        if el.tag is etree.Comment:
            continue

        tag = el.tag.lower()

        if tag not in included_tags:
            continue

        if not is_visible(el):
            continue

        if is_layout_or_decorative(el):
            continue

        path = root.getpath(el)
        attrs = format_attributes(el)
        attrs_str = f" {attrs}" if attrs else ""
        text = el.text.strip() if el.text else ""

        if not text and not attrs:
            continue

        # input elements
        if tag == "button":
            prefix = "🔘 **<button>**"
            special_elements.append(f"<!-- {path} -->\n{prefix} {text}")
        elif tag == "a":
            href = el.attrib.get("href", "")
            prefix = f"🔗 **<a href='{href}'>**"
            special_elements.append(f"<!-- {path} -->\n{prefix} {text}")
        elif tag == "input":
            input_type = el.attrib.get("type", "text")
            prefix = f"📝 **<input type='{input_type}'>**"
            special_elements.append(f"<!-- {path} -->\n{prefix}")
        else:
            prefix = f"**<{tag}{attrs_str}>**"

            if text:
                normal_elements.append(f"<!-- {path} -->\n{prefix} {text}")

    return "\n\n".join(normal_elements + special_elements)  # type: ignore


def parse_response(text: str) -> list[str]:
    xpaths = re.findall(r"<xpaths>(.*?)</xpaths>", text, re.DOTALL)
    results = []

    if xpaths:
        lines = xpaths[0].strip().splitlines()
        results = [
            line.strip().lstrip("-").strip()
            for line in lines
            if line.strip().startswith("-")
        ]

    print(results)

    return results


def parse_next_page(text: str) -> str | None:
    next_page = re.findall(r"<next_page>(.*?)</next_page>", text, re.DOTALL)

    if next_page:
        lines = next_page[0].strip().splitlines()
        next_page = [
            line.strip().lstrip("-").strip()
            for line in lines
            if line.strip().startswith("-")
        ]

    return next_page[0] if next_page else None


async def capture_elements(page: Page, xpaths: list[str]) -> list[CapturedElement]:
    captured_elements = []

    for xpath in xpaths:
        try:
            locator = page.locator(f"xpath={xpath}")
            count = await locator.count()

            for i in range(count):
                element_text = ""

                element_handle = await locator.nth(i).element_handle()

                if not element_handle:
                    continue

                text = await element_handle.text_content()

                if text:
                    element_text += text

                children = await element_handle.query_selector_all("*")
                for child in children:
                    child_text = await child.text_content()
                    if child_text:
                        element_text += child_text

                captured_elements.append(
                    CapturedElement(
                        name=xpath,
                        text=element_text,
                        xpath=xpath,
                    )
                )

        except Exception as e:
            print(f"Error processing xpath {xpath}: {e}")

    return captured_elements
