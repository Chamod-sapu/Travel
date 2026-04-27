import sys
import os
import json
import base64
import tempfile

# Add the shared library path so Jenkins (running as SYSTEM) can find the oci package
sys.path.insert(0, r"C:\ProgramData\oci_libs")

import oci
import yaml
import requests
from oci.signer import Signer


def generate_oke_token(config, cluster_id):
    """
    Replicates exactly what 'oci ce cluster generate-token' does:
    1. Builds a GET request to the OKE token endpoint
    2. Signs it with the OCI signer
    3. Returns the Authorization header value — which IS the token
    """
    signer = Signer(
        tenancy=config["tenancy"],
        user=config["user"],
        fingerprint=config["fingerprint"],
        private_key_file_location=config["key_file"]
    )

    endpoint = f"https://containerengine.{config['region']}.oraclecloud.com"
    url = f"{endpoint}/20180419/clusters/{cluster_id}/token"

    # Build and sign a PreparedRequest (this is exactly what the OCI CLI does)
    req = requests.Request("GET", url)
    prepared = req.prepare()

    # The signer modifies the request in-place, adding Authorization + Date headers
    signer(prepared)

    # The Kubernetes token for OKE is the Authorization header value
    return prepared.headers.get("Authorization", "")


def main():
    config = {
        "user":        os.environ.get("USER_OCID"),
        "tenancy":     os.environ.get("TENANCY"),
        "fingerprint": os.environ.get("FINGERPRINT"),
        "key_file":    os.environ.get("OCI_KEY_FILE"),
        "region":      os.environ.get("REGION"),
    }

    cluster_id = os.environ.get("CLUSTER_ID")
    if not cluster_id:
        print("Error: CLUSTER_ID environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        # 1. Download the base kubeconfig
        ce_client = oci.container_engine.ContainerEngineClient(config)
        response = ce_client.create_kubeconfig(cluster_id)
        kubeconfig_yaml = yaml.safe_load(response.data.text)

        # 2. Generate the OKE auth token using manual request signing
        token = generate_oke_token(config, cluster_id)
        if not token:
            print("Error: Signer produced an empty Authorization header", file=sys.stderr)
            sys.exit(1)

        # 3. Remove the 'exec' section and replace with the static token
        if "users" in kubeconfig_yaml:
            for user_entry in kubeconfig_yaml["users"]:
                if "user" in user_entry:
                    user_entry["user"].pop("exec", None)
                    user_entry["user"]["token"] = token

        # 4. Write cleaned kubeconfig to a temp file
        kubeconfig_path = os.path.join(tempfile.gettempdir(), "oke_kubeconfig_final")
        with open(kubeconfig_path, "w") as f:
            yaml.dump(kubeconfig_yaml, f)

        # Print path for Jenkins to capture
        print(kubeconfig_path)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
