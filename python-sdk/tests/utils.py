import os
from dotenv import load_dotenv

load_dotenv()


def get_environment_variable(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise ValueError(f"Missing environment variable: {key}")
    return value
