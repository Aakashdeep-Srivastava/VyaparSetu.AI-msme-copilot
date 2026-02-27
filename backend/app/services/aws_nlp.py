import boto3
from app.config import get_settings

class AWSNLPService:
    def __init__(self):
        self.settings = get_settings()
        self._translate_available = False
        self._comprehend_available = False
        try:
            self.translate_client = boto3.client(
                "translate",
                region_name=self.settings.aws_region,
                aws_access_key_id=self.settings.aws_access_key_id or None,
                aws_secret_access_key=self.settings.aws_secret_access_key or None,
            )
            self._translate_available = True
        except Exception:
            pass
        try:
            self.comprehend_client = boto3.client(
                "comprehend",
                region_name=self.settings.aws_region,
                aws_access_key_id=self.settings.aws_access_key_id or None,
                aws_secret_access_key=self.settings.aws_secret_access_key or None,
            )
            self._comprehend_available = True
        except Exception:
            pass

    async def translate(self, text: str, source_lang: str = "hi", target_lang: str = "en") -> str:
        """Translate text via AWS Translate. Returns original text on failure."""
        if not self._translate_available:
            return text
        try:
            response = self.translate_client.translate_text(
                Text=text,
                SourceLanguageCode=source_lang,
                TargetLanguageCode=target_lang,
            )
            return response["TranslatedText"]
        except Exception as e:
            print(f"Translate error: {e}")
            return text

    async def detect_language(self, text: str) -> str:
        """Detect language via Amazon Comprehend, with Devanagari heuristic fallback."""
        # Try Comprehend first
        if self._comprehend_available:
            try:
                response = self.comprehend_client.detect_dominant_language(Text=text)
                languages = response.get("Languages", [])
                if languages:
                    top = max(languages, key=lambda x: x["Score"])
                    return top["LanguageCode"]
            except Exception as e:
                print(f"Comprehend detect_language error: {e}")

        # Fallback: Devanagari script heuristic
        devanagari_range = range(0x0900, 0x097F + 1)
        devanagari_count = sum(1 for c in text if ord(c) in devanagari_range)
        if devanagari_count > 0:
            return "hi"

        # Extended heuristic: common Romanized Hindi patterns
        # (useful for Hinglish like "Main lakdi ka furniture banata hoon")
        hinglish_markers = [
            "hoon", "hain", "hai", "karta", "karti", "karte",
            "banata", "banati", "banate", "main", "mein", "hum",
            "aur", "ke liye", "ka ", "ki ", "ko ", "wala", "wali",
        ]
        text_lower = text.lower()
        marker_count = sum(1 for m in hinglish_markers if m in text_lower)
        if marker_count >= 2:
            return "hi"

        return "en"

aws_nlp = AWSNLPService()
