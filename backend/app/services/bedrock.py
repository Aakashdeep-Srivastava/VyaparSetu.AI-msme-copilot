import boto3
import json
from app.config import get_settings

class BedrockClient:
    def __init__(self):
        self.settings = get_settings()
        try:
            self.client = boto3.client(
                "bedrock-runtime",
                region_name=self.settings.aws_region,
                aws_access_key_id=self.settings.aws_access_key_id or None,
                aws_secret_access_key=self.settings.aws_secret_access_key or None,
            )
            self._available = True
        except Exception:
            self._available = False

    async def invoke_claude(self, prompt: str, system: str = "") -> str:
        if not self._available:
            return self._fallback_response(prompt)
        try:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2048,
                "system": system,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = self.client.invoke_model(
                modelId=self.settings.bedrock_model_id,
                body=json.dumps(body),
                contentType="application/json",
            )
            result = json.loads(response["body"].read())
            return result["content"][0]["text"]
        except Exception as e:
            print(f"Bedrock error: {e}")
            return self._fallback_response(prompt)

    async def get_embedding(self, text: str) -> list[float]:
        if not self._available:
            return [0.5] * 8  # fallback 8-dim vector
        try:
            body = {"inputText": text}
            response = self.client.invoke_model(
                modelId=self.settings.bedrock_embed_model_id,
                body=json.dumps(body),
                contentType="application/json",
            )
            result = json.loads(response["body"].read())
            embedding = result["embedding"]
            # Reduce to 8 dimensions for our simple matching
            if len(embedding) > 8:
                step = len(embedding) // 8
                embedding = [embedding[i * step] for i in range(8)]
            return embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            return [0.5] * 8

    def _fallback_response(self, prompt: str) -> str:
        """Return a reasonable fallback when Bedrock is unavailable."""
        return '{"note": "Bedrock unavailable, using cached demo data"}'

bedrock_client = BedrockClient()
