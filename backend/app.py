from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
from html import unescape

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "https://asafafgin.github.io",
    "https://asafafgin.github.io/halacha-chat",
]}})

SEFARIA_SEARCH_URL = "https://www.sefaria.org/api/search-wrapper"
SEFARIA_TEXT_URL = "https://www.sefaria.org/api/texts/{}"
USER_AGENT = "HalachaChat/0.1 (+https://asafafgin.github.io/halacha-chat/)"

APPROVED_IMAGE_SOURCES = [
    {
        "keys": ["לולב", "נפרצו", "נפרדו"],
        "title": "איורי כתב יד הרמב״ם — נפרצו / נפרדו עליו",
        "image": "https://www.toraland.org.il/media/5265876/dekel2.jpg",
        "page": "https://www.toraland.org.il/%D7%94%D7%A6%D7%95%D7%9E%D7%97-%D7%95%D7%94%D7%97%D7%99-%D7%91%D7%9E%D7%A9%D7%A0%D7%AA-%D7%94%D7%A8%D7%9E%D7%91%D7%9D/%D7%96%D7%99%D7%94%D7%95%D7%99-%D7%94%D7%A6%D7%9E%D7%97%D7%99%D7%9D/%D7%93%D7%A7%D7%9C/",
        "site": "מכון התורה והארץ",
    }
]


def clean_html(value):
    if value is None:
        return ""
    if isinstance(value, list):
        value = " ".join(str(x) for x in value)
    text = re.sub(r"<[^>]+>", "", str(value))
    return unescape(text).strip()


def build_terms(question):
    terms = [re.sub(r"[?.,!]", " ", question).strip()]
    if re.search(r"לולב|נפרצו|נפרדו", question):
        terms += ["נפרצו עליו", "נפרדו עליו", "לולב"]
    if re.search(r"אתרוג|פיטם", question):
        terms += ["ניטל פיטם", "פיטם", "אתרוג"]
    if "חזזית" in question:
        terms += ["חזזית", "אתרוג חזזית"]
    if re.search(r"בלעט|בלעטל", question):
        terms += ["בלעטליך", "בלעטלאך", "אתרוג"]
    out = []
    for t in terms:
        if t and t not in out:
            out.append(t)
    return out[:5]


def source_matches(item, selected):
    if not selected:
        return True
    hay = " ".join([
        item.get("ref", ""),
        item.get("title", ""),
        item.get("path", ""),
    ]).lower()
    return any(str(name).lower() in hay for name in selected)


def search_sefaria(term):
    payload = {
        "query": term,
        "type": "text",
        "field": "naive_lemmatizer",
        "slop": 10,
        "size": 30,
        "source_proj": True,
    }
    r = requests.post(
        SEFARIA_SEARCH_URL,
        json=payload,
        timeout=20,
        headers={"User-Agent": USER_AGENT},
    )
    r.raise_for_status()
    data = r.json()
    hits = (((data or {}).get("hits") or {}).get("hits") or [])
    results = []
    for h in hits:
        s = h.get("_source") or {}
        path = s.get("path") or ""
        if isinstance(path, list):
            path = " / ".join(path)
        results.append({
            "ref": s.get("ref") or "",
            "heRef": s.get("heRef") or s.get("ref") or "",
            "title": s.get("title") or "",
            "path": path,
            "text": clean_html(
                s.get("exact")
                or s.get("naive_lemmatizer")
                or s.get("he")
                or s.get("content")
                or ""
            ),
        })
    return results


def fetch_exact_text(ref):
    if not ref:
        return None
    try:
        r = requests.get(
            SEFARIA_TEXT_URL.format(requests.utils.quote(ref, safe="")),
            params={"context": 0, "commentary": 0},
            timeout=20,
            headers={"User-Agent": USER_AGENT},
        )
        r.raise_for_status()
        d = r.json()
        he = d.get("he") or ""
        if isinstance(he, list):
            he = " ".join(str(x) for x in he)
        return {
            "text": clean_html(he),
            "heRef": d.get("heRef") or ref,
            "book": d.get("book") or "",
        }
    except Exception:
        return None


def approved_image(question):
    for item in APPROVED_IMAGE_SOURCES:
        if any(k in question for k in item["keys"]):
            return item
    return None


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "halacha-chat-api"})


@app.post("/api/search")
def api_search():
    body = request.get_json(silent=True) or {}
    question = str(body.get("question") or "").strip()
    selected = body.get("sources") or []

    if not question:
        return jsonify({"error": "חסרה שאלה"}), 400

    terms = build_terms(question)
    found = []
    seen = set()
    errors = []

    for term in terms:
        try:
            for item in search_sefaria(term):
                ref = item.get("ref")
                if not ref or ref in seen:
                    continue
                if not source_matches(item, selected):
                    continue
                seen.add(ref)
                exact = fetch_exact_text(ref)
                if exact:
                    item["text"] = exact.get("text") or item.get("text") or ""
                    item["heRef"] = exact.get("heRef") or item.get("heRef") or ref
                    item["book"] = exact.get("book") or item.get("title") or ""
                found.append(item)
                if len(found) >= 8:
                    break
        except Exception as e:
            errors.append(f"{term}: {type(e).__name__}")
        if len(found) >= 8:
            break

    return jsonify({
        "question": question,
        "terms": terms,
        "results": found,
        "image": approved_image(question),
        "errors": errors,
        "disclaimer": "מקורות לעיון והשוואה בלבד; האפליקציה אינה קובעת פסק סופי.",
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
