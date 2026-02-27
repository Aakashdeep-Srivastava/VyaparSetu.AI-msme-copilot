from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # AWS
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    # Bedrock
    bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    bedrock_embed_model_id: str = "amazon.titan-embed-text-v2:0"

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # App
    app_env: str = "development"
    demo_cache_enabled: bool = True

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
