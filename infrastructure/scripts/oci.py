import sys
import os

# Ensure the shared libraries are accessible
sys.path.insert(0, r"C:\ProgramData\oci_libs")

from oci_cli.cli import cli

if __name__ == "__main__":
    cli()
