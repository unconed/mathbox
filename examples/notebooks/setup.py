#!/usr/bin/python

from setuptools import find_packages, setup


def readme():
    try:
        with open("README.md") as f:
            return f.read()
    except Exception:
        return None


REQUIRED_PACKAGES = ["numpy", "jupyter"]

setup(
    name="mathbox-examples",
    version="0.0.1",
    description="Mathbox notebook examples.",
    long_description=readme(),
    long_description_content_type="text/markdown",
    python_requires=">=3.6.0",
    url="https://github.com/unconed/mathbox",
    install_requires=REQUIRED_PACKAGES,
)
