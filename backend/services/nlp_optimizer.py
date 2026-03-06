"""
SocialHub – Caption Optimizer (NLP, no paid API)
Rule-based system using spaCy + NLTK + custom datasets.
"""
from __future__ import annotations
import re
import random
from typing import Optional

# ── Tone configurations ───────────────────────────────────────────────────────
TONES: dict[str, dict] = {
    "professional": {
        "openers": [
            "Excited to share", "Proud to announce", "Delighted to present",
            "It's my pleasure to introduce", "Thrilled to reveal",
        ],
        "closers": [
            "What are your thoughts? Drop them below.",
            "Let's connect and discuss.",
            "Share your insights in the comments.",
            "Looking forward to your perspective.",
        ],
        "power_words": [
            "industry-leading", "cutting-edge", "strategic", "impactful",
            "transformative", "data-driven", "innovative", "results-oriented",
        ],
        "emojis": ["💡", "🎯", "📈", "✅", "🏆", "🌟", "💼"],
    },
    "viral": {
        "openers": [
            "🔥 This changes EVERYTHING →",
            "Nobody is talking about this...",
            "Stop scrolling. This is important.",
            "POV: You just discovered something wild",
            "I can't believe this actually works 👇",
        ],
        "closers": [
            "Like + save before this disappears! 🙏",
            "Tag someone who NEEDS to see this!",
            "Drop a 🔥 if you agree!",
            "Share this — your friends will thank you!",
        ],
        "power_words": ["insane", "game-changing", "mind-blowing", "legendary", "viral"],
        "emojis": ["🔥", "😱", "💥", "🤯", "👇", "⚡", "🚨"],
    },
    "marketing": {
        "openers": [
            "✨ Introducing", "🚀 Launching now:", "Big news →",
            "Say hello to", "The wait is finally over:",
        ],
        "closers": [
            "Link in bio 🔗",
            "Limited time only ⏰ — don't miss out!",
            "DM us to learn more!",
            "Shop now → link in bio",
        ],
        "power_words": ["exclusive", "limited", "premium", "must-have", "best-selling", "trusted"],
        "emojis": ["✨", "🚀", "🎁", "💎", "⭐", "🛒", "💫"],
    },
    "storytelling": {
        "openers": [
            "Three years ago, I made a decision that changed my life...",
            "Nobody believed me when I said this was possible.",
            "The day everything changed was unexpected.",
            "Here's a story that's worth a minute of your time:",
            "It started with a single, terrifying decision.",
        ],
        "closers": [
            "What's your story? Tell me below 👇",
            "Have you been through something similar? Share it.",
            "Save this for anyone who needs to hear it today.",
        ],
        "power_words": ["unforgettable", "life-changing", "raw", "honest", "real", "vulnerable"],
        "emojis": ["❤️", "🌟", "💫", "🙌", "✨", "🕊️"],
    },
    "casual": {
        "openers": [
            "okay so", "not gonna lie,", "real talk →",
            "honestly?", "lowkey obsessed with this:", "no cap,",
        ],
        "closers": [
            "lmk what you think 👀",
            "thoughts?? 💭",
            "who else can relate 😂",
            "drop your take ⬇️",
        ],
        "power_words": ["obsessed", "lowkey", "honestly", "no cap", "vibes"],
        "emojis": ["😂", "💀", "✨", "👀", "💯", "😭", "🙃"],
    },
}

# ── Hashtag database ──────────────────────────────────────────────────────────
HASHTAG_DB: dict[str, list[str]] = {
    "general":    ["#trending", "#viral", "#explore", "#foryou", "#content",
                   "#creator", "#daily", "#motivation", "#inspo", "#lifestyle"],
    "business":   ["#entrepreneur", "#startup", "#business", "#success",
                   "#marketing", "#leadership", "#growth", "#innovation",
                   "#strategy", "#branding", "#hustle", "#mindset"],
    "tech":       ["#technology", "#ai", "#coding", "#developer", "#programming",
                   "#tech", "#softwareengineering", "#innovation", "#digital",
                   "#machinelearning", "#python", "#webdev"],
    "fitness":    ["#fitness", "#gym", "#workout", "#health", "#wellness",
                   "#fitfam", "#training", "#nutrition", "#bodybuilding",
                   "#sport", "#healthylifestyle", "#fitnessmotivation"],
    "food":       ["#food", "#foodie", "#recipe", "#cooking", "#yummy",
                   "#delicious", "#instafood", "#homemade", "#chef",
                   "#foodphotography", "#healthyfood", "#easyrecipe"],
    "travel":     ["#travel", "#wanderlust", "#adventure", "#explore",
                   "#vacation", "#trip", "#nature", "#photography",
                   "#travelgram", "#world", "#explore", "#roadtrip"],
    "fashion":    ["#fashion", "#style", "#ootd", "#outfit", "#clothes",
                   "#beauty", "#model", "#luxury", "#streetstyle",
                   "#aesthetic", "#fashionblogger", "#styleinspo"],
    "finance":    ["#finance", "#investing", "#money", "#wealth",
                   "#passiveincome", "#stockmarket", "#crypto",
                   "#personalfinance", "#financialfreedom", "#savings"],
    "education":  ["#education", "#learning", "#knowledge", "#students",
                   "#study", "#tips", "#howto", "#tutorial",
                   "#learneveryday", "#skills", "#growth"],
    "motivation": ["#motivation", "#mindset", "#success", "#inspire",
                   "#goals", "#positivity", "#dailymotivation",
                   "#hardwork", "#believe", "#growth"],
}

# Platform hashtag limits
PLATFORM_LIMITS = {
    "instagram": 30, "twitter": 3, "linkedin": 5,
    "tiktok": 10, "facebook": 8, "reddit": 5,
}

# Grammar fix rules
GRAMMAR_RULES = [
    (r"\bi\b",          "I"),
    (r"\bdont\b",       "don't"),
    (r"\bcant\b",       "can't"),
    (r"\bwont\b",       "won't"),
    (r"\bdidnt\b",      "didn't"),
    (r"\bhavent\b",     "haven't"),
    (r"\bisnt\b",       "isn't"),
    (r"\bwouldnt\b",    "wouldn't"),
    (r"\bcouldnt\b",    "couldn't"),
    (r"\bshouldnt\b",   "shouldn't"),
    (r"\.{4,}",         "..."),
    (r" {2,}",          " "),
]

ENGAGEMENT_HOOKS = [
    "What do you think? Drop a comment below 👇",
    "Save this for later! 🔖",
    "Share with someone who needs to see this!",
    "Double-tap if you agree ❤️",
    "Tag a friend who'd love this 👥",
    "Have you tried this? Tell me in the comments!",
]

KEYWORD_CATEGORIES = {
    "business":   ["business", "startup", "company", "profit", "revenue", "entrepreneur", "hustle"],
    "tech":       ["tech", "ai", "code", "software", "app", "digital", "data", "programming", "developer"],
    "fitness":    ["fitness", "gym", "workout", "health", "exercise", "muscle", "training", "diet"],
    "food":       ["food", "recipe", "eat", "cook", "restaurant", "meal", "delicious", "cooking"],
    "travel":     ["travel", "trip", "vacation", "journey", "explore", "adventure", "destination"],
    "fashion":    ["fashion", "style", "clothes", "outfit", "wear", "dress", "beauty"],
    "finance":    ["money", "invest", "stock", "crypto", "wealth", "finance", "trading", "profit"],
    "education":  ["learn", "study", "tutorial", "tips", "howto", "education", "knowledge"],
    "motivation": ["inspire", "goals", "success", "mindset", "believe", "achieve", "motivation"],
}


# ── Public API ────────────────────────────────────────────────────────────────
def optimize_caption(
    text: str,
    tone: str = "professional",
    platform: Optional[str] = None,
    add_hashtags: bool = True,
    add_emoji: bool = True,
) -> dict:
    """Optimize a caption. Returns full result dict."""
    if not text or not text.strip():
        return {"error": "Empty caption provided"}

    original = text.strip()
    result   = original

    result = _fix_grammar(result)
    result = _clean_text(result)
    result = _apply_tone(result, tone, add_emoji)
    result = _add_hook(result)

    hashtags = _generate_hashtags(original, platform) if add_hashtags else []
    score    = _score(result, hashtags)

    return {
        "original":    original,
        "optimized":   result,
        "hashtags":    hashtags,
        "tone":        tone,
        "score":       score,
        "word_count":  len(result.split()),
        "char_count":  len(result),
        "suggestions": _suggestions(original, tone, platform),
    }


# ── Internal helpers ──────────────────────────────────────────────────────────
def _fix_grammar(text: str) -> str:
    for pattern, repl in GRAMMAR_RULES:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    text = re.sub(r"(?<=[.!?])\s+([a-z])", lambda m: " " + m.group(1).upper(), text)
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    return text.strip()


def _clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" +", " ", text)
    if text and text[-1] not in ".!?…":
        text += "."
    return text


def _apply_tone(text: str, tone: str, add_emoji: bool) -> str:
    cfg    = TONES.get(tone, TONES["professional"])
    opener = random.choice(cfg["openers"])
    closer = random.choice(cfg["closers"])

    # Only prepend opener if text doesn't already start dramatically
    first_word = text.lower().split()[0] if text.split() else ""
    skip_opener = first_word in {"i", "three", "nobody", "the", "it", "okay", "not"}

    if not skip_opener:
        text = f"{opener} — {text}"

    if closer.lower() not in text.lower():
        text += f"\n\n{closer}"

    if add_emoji:
        emojis = cfg.get("emojis", [])
        if emojis and not any(e in text for e in emojis):
            text += " " + random.choice(emojis)

    return text


def _add_hook(text: str) -> str:
    has_q   = "?" in text
    has_cta = any(kw in text.lower() for kw in ["comment", "share", "like", "save", "tag", "dm"])
    if not has_q and not has_cta:
        text += f"\n\n{random.choice(ENGAGEMENT_HOOKS)}"
    return text


def _detect_category(text: str) -> str:
    lower = text.lower()
    for cat, keywords in KEYWORD_CATEGORIES.items():
        if any(kw in lower for kw in keywords):
            return cat
    return "general"


def _generate_hashtags(text: str, platform: Optional[str]) -> list[str]:
    cat      = _detect_category(text)
    pool     = list(dict.fromkeys(HASHTAG_DB.get(cat, []) + HASHTAG_DB["general"] + HASHTAG_DB.get("motivation", [])))
    existing = re.findall(r"#\w+", text)
    combined = list(dict.fromkeys(existing[:5] + pool))
    limit    = PLATFORM_LIMITS.get(platform or "", 15)
    return combined[:limit]


def _score(text: str, hashtags: list[str]) -> int:
    score = 45
    if len(text) > 100:                                          score += 5
    if len(text) > 250:                                          score += 5
    if "?" in text:                                              score += 10
    if any(e in text for e in ["❤️","🔥","✨","🚀","💡","👇"]): score += 10
    if hashtags:                                                  score += min(len(hashtags) * 2, 15)
    if "\n" in text:                                             score += 5
    if len(text.split()) > 30:                                   score += 5
    return min(score, 100)


def _suggestions(text: str, tone: str, platform: Optional[str]) -> list[str]:
    tips = []
    if len(text) < 60:
        tips.append("💡 Write a longer caption (100+ chars) for better engagement.")
    if "#" not in text:
        tips.append("🏷️ Add relevant hashtags to boost discoverability.")
    if "?" not in text:
        tips.append("❓ End with a question to drive more comments.")
    if not any(e in text for e in ["😊","🔥","✨","❤️","👇","😂"]):
        tips.append("😊 Add 1–2 emojis — they increase click-through rate.")
    if platform == "instagram" and len(text.split()) < 20:
        tips.append("📷 Instagram captions of 125–150 words tend to perform best.")
    if platform == "linkedin" and tone != "professional":
        tips.append("💼 LinkedIn audiences respond better to a professional tone.")
    return tips
