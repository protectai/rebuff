from setuptools import setup, find_packages

setup(
    name="rebuff",
    version="0.0.5",
    packages=find_packages(),
    install_requires=[
        "pydantic>=1",
        "requests<3,>=2",
        "openai>=1",
        "pinecone-client>=2",
        "langchain>=0.0.100",
        "langchain_openai>=0.0.2",
        "tiktoken>=0.5",
    ],
    extras_require={
        "dev": [
            "pytest",
            "pytest-rerunfailures",
            "black>=23.0,<24",
            "flake8>=6.0,<7",
            "isort>=5.0,<6",
            "mypy>=1.0,<2",
        ],
    },
    test_suite="tests",
)
