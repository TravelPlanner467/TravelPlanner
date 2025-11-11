import json
import os
import re
from flask import Blueprint, jsonify, request

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

        keywords = _extract_naive_keywords(title, description)
        return jsonify({
            'keywords': keywords,
            'count': len(keywords)
        }), 200
    except Exception as e:
        return jsonify({'error': 'KeywordSuggestionFailed', 'message': str(e)}), 500
