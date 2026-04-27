import sys
import os
import json
import tempfile

# Add the shared library path so Jenkins (running as SYSTEM) can find the oci package
sys.path.insert(0, r"C:\ProgramData\oci_libs")

import oci
import yaml
import requests
from oci.signer import Signer


def generate_oke_token(config, cluster_id):
    """
    Calls the OKE token endpoint with a signed request and returns the JWT bearer token.
    This is exactly what 'oci ce cluster generate-token' does internally.
    """
    signer = Signer(
        tenancy=config["tenancy"],
        user=config["user"],
        fingerprint=config["fingerprint"],
        private_key_file_location=config["key_file"]
    )

    endpoint = f"https://containerengine.{config['region']}.oraclecloud.com"
    url = f"{endpoint}/20180419/clusters/{cluster_id}/token"

    # Make a real signed GET request to the OKE token endpoint
    response = requests.get(url, auth=signer)

    if response.status_code != 200:
        raise Exception(f"Token endpoint returned HTTP {response.status_code}: {response.text}")

    # The response is an ExecCredential JSON:
    # {"apiVersion": "...", "kind": "ExecCredential", "status": {"token": "eyJ..."}}
    resp_json = response.json()
    token = resp_json.get("status", {}).get("token", "")

    if not token:
        raise Exception(f"No token in response: {json.dumps(resp_json)}")

    return token


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

    # Validate all required env vars are set
    for key, val in config.items():
        if not val:
            print(f"Error: Missing environment variable for '{key}'", file=sys.stderr)
            sys.exit(1)

    try:
        # 1. Get the real JWT bearer token from OKE
        token = generate_oke_token(config, cluster_id)

        # 2. Download the base kubeconfig structure
        ce_client = oci.container_engine.ContainerEngineClient(config)
        response = ce_client.create_kubeconfig(cluster_id)
        kubeconfig_yaml = yaml.safe_load(response.data.text)

        # 3. Remove the 'exec' plugin section and insert our real token
        if "users" in kubeconfig_yaml:
            for user_entry in kubeconfig_yaml["users"]:
                if "user" in user_entry:
                    user_entry["user"].pop("exec", None)
                    user_entry["user"]["token"] = token

        # 4. Write the self-contained kubeconfig to temp file
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
