import json
import os
import re
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv

keywords_bp = Blueprint('keywords', __name__)

# Load a canonical keyword list if present (optional)
# Falls back to simple extraction when not found
PUBLIC_KEYWORDS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'keywords.json')

try:
    with open(PUBLIC_KEYWORDS_PATH, 'r') as f:
        CANONICAL_KEYWORDS = set(json.load(f))
except Exception:
    CANONICAL_KEYWORDS = set()

# Very small English stopword set to reduce noise
STOPWORDS = {
    'the','a','an','and','or','but','if','then','else','for','with','on','in','at','by','to','from','of','is','are','was','were','be','been','being','this','that','these','those','it','its','as','into','over','under','after','before','about','between','during','without','within','you','your','we','our'
}

WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z\-']+")

# Load environment variables once
load_dotenv()
USE_LLM = os.getenv('USE_LLM_KEYWORDS', 'false').lower() == 'true'
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai').lower()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')


def _tokenize(text: str):
    if not text:
        return []
    return [w.lower() for w in WORD_RE.findall(text)]


def _extract_naive_keywords(title: str, description: str):
    tokens = _tokenize(title) + _tokenize(description)
    tokens = [t for t in tokens if t not in STOPWORDS]

    # Prefer tokens found in canonical keywords when available
    scored = {}
    for t in tokens:
        score = 2 if t in CANONICAL_KEYWORDS else 1
        scored[t] = scored.get(t, 0) + score

    # Sort by score desc, then by shorter first (heuristic for single words)
    ranked = sorted(scored.items(), key=lambda kv: (-kv[1], len(kv[0]), kv[0]))
    # Deduplicate while preserving order
    seen = set()
    result = []
    for k, _ in ranked:
        if k not in seen:
            seen.add(k)
            result.append(k)
        if len(result) >= 5:
            break
    return result


def _extract_llm_keywords_openai(title: str, description: str):
    """Call OpenAI to extract up to 5 concise keywords.

    Returns list[str]; raises on hard failures so caller can fallback.
    """
    try:
        from openai import OpenAI
    except Exception as e:
        raise RuntimeError(f"OpenAI client not available: {e}")

    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = (
        "Extract up to 5 concise, lowercase keywords for indexing the following travel experience.\n"
        "Return strict JSON only in the form: {\"keywords\": [\"k1\",\"k2\",...]} with at most 5 items.\n"
        "Prefer domain-relevant terms (locations, activity types, features).\n"
        "Avoid duplicates and generic words.\n\n"
        f"Title: {title or ''}\n"
        f"Description: {description or ''}\n"
    )

    # Use a small, fast model name; adjust if environment uses a different base URL
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You extract keywords and respond with strict JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=128,
        )
        content = resp.choices[0].message.content if resp.choices else ''
    except Exception as e:
        raise RuntimeError(f"OpenAI request failed: {e}")

    # Try to parse strict JSON; if the model added text, attempt to locate a JSON object
    def _parse_keywords_json(text: str):
        try:
            obj = json.loads(text)
            kws = obj.get('keywords', [])
            if isinstance(kws, list):
                return [str(k).strip().lower() for k in kws][:5]
        except Exception:
            pass
        # Fallback: naive brace extraction
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                obj = json.loads(text[start:end+1])
                kws = obj.get('keywords', [])
                if isinstance(kws, list):
                    return [str(k).strip().lower() for k in kws][:5]
            except Exception:
                pass
        raise ValueError("Failed to parse JSON from LLM response")

    keywords = _parse_keywords_json(content)

    # Final clean-up and constraints
    cleaned = []
    seen = set()
    for k in keywords:
        k = k.strip().lower()
        if not k or k in STOPWORDS:
            continue
        if k in seen:
            continue
        seen.add(k)
        cleaned.append(k)
        if len(cleaned) >= 5:
            break
    return cleaned


def _extract_llm_keywords_anthropic(title: str, description: str):
    """Call Anthropic to extract up to 5 concise keywords.

    Returns list[str]; raises on hard failures so caller can fallback.
    """
    try:
        import anthropic
    except Exception as e:
        raise RuntimeError(f"Anthropic client not available: {e}")

    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    system = "You extract keywords and respond with strict JSON only."
    user = (
        "Extract up to 5 concise, lowercase keywords for indexing the following travel experience.\n"
        "Return strict JSON only in the form: {\"keywords\": [\"k1\",\"k2\",...]} with at most 5 items.\n"
        "Prefer domain-relevant terms (locations, activity types, features).\n"
        "Avoid duplicates and generic words.\n\n"
        f"Title: {title or ''}\n"
        f"Description: {description or ''}\n"
    )

    model = os.getenv('ANTHROPIC_MODEL', 'claude-3-5-haiku-latest')

    try:
        resp = client.messages.create(
            model=model,
            system=system,
            messages=[{"role": "user", "content": user}],
            max_tokens=128,
            temperature=0.2,
        )
        # Content is a list of blocks; we concatenate text blocks
        content_text = ""
        for block in getattr(resp, 'content', []) or []:
            if getattr(block, 'type', '') == 'text':
                content_text += getattr(block, 'text', '')
        content = content_text or ''
    except Exception as e:
        raise RuntimeError(f"Anthropic request failed: {e}")

    # Parse JSON similarly to OpenAI path
    def _parse_keywords_json(text: str):
        try:
            obj = json.loads(text)
            kws = obj.get('keywords', [])
            if isinstance(kws, list):
                return [str(k).strip().lower() for k in kws][:5]
        except Exception:
            pass
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                obj = json.loads(text[start:end+1])
                kws = obj.get('keywords', [])
                if isinstance(kws, list):
                    return [str(k).strip().lower() for k in kws][:5]
            except Exception:
                pass
        raise ValueError("Failed to parse JSON from LLM response")

    keywords = _parse_keywords_json(content)

    cleaned = []
    seen = set()
    for k in keywords:
        k = k.strip().lower()
        if not k or k in STOPWORDS:
            continue
        if k in seen:
            continue
        seen.add(k)
        cleaned.append(k)
        if len(cleaned) >= 5:
            break
    return cleaned


@keywords_bp.route('/suggest', methods=['POST'])
def suggest_keywords():
    """Suggest up to 5 keywords from provided title and description.

    Request JSON:
      - title: string
      - description: string

    Response JSON:
      { "keywords": ["k1","k2",...], "count": <n> }
    """
    try:
        data = request.get_json(silent=True) or {}
        title = data.get('title', '')
        description = data.get('description', '')

        if not (title or description):
            return jsonify({
                'error': 'InvalidInput',
                'message': 'Provide at least one of: title, description'
            }), 400
        keywords = []
        source = "heuristic"

        # Try LLM path if enabled
        if USE_LLM:
            try:
                if LLM_PROVIDER == 'openai' and OPENAI_API_KEY:
                    keywords = _extract_llm_keywords_openai(title, description)
                    source = "llm"
                elif LLM_PROVIDER == 'anthropic' and ANTHROPIC_API_KEY:
                    keywords = _extract_llm_keywords_anthropic(title, description)
                    source = "llm"
                else:
                    keywords = _extract_naive_keywords(title, description)
                    source = "heuristic"
            except Exception:
                # Fall back to heuristic on any error
                keywords = _extract_naive_keywords(title, description)
                source = "heuristic"
        else:
            keywords = _extract_naive_keywords(title, description)
            source = "heuristic"

        return jsonify({
            'keywords': keywords,
            'count': len(keywords),
            'source': source
        }), 200
    except Exception as e:
        return jsonify({'error': 'KeywordSuggestionFailed', 'message': str(e)}), 500
