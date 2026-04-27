import sys
import os
import json
import base64
from datetime import datetime, timezone
from urllib.parse import urlparse

# Add the shared library path
sys.path.insert(0, r"C:\ProgramData\oci_libs")

import oci
import yaml
import tempfile

def generate_oke_token(config, cluster_id):
    """
    Manually implements the OCI OKE token generation logic.
    Returns the string: OCI_TOKEN_VERSION_2.0.<base64_json>
    """
    # 1. Prepare the signer
    signer = oci.signer.Signer(
        tenancy=config["tenancy"],
        user=config["user"],
        fingerprint=config["fingerprint"],
        private_key_file_location=config["key_file"]
    )

    # 2. Build the request structure
    # OKE token is a signed GET request to the cluster's token endpoint
    endpoint = f"https://containerengine.{config['region']}.oraclecloud.com"
    path = f"/20180419/clusters/{cluster_id}/token"
    url = f"{endpoint}{path}"
    
    # We need to sign this specific request
    # OCI expects the token to be a JSON object containing the signed request headers
    # but the simplest version is the V2 token which is a specific format.
    
    import requests
    from oci.signer import Signer
    
    # We use OCI's internal request signing to get the headers
    # Kubectl OKE plugin expects a very specific format:
    # OCI_TOKEN_VERSION_2.0.<base64 encoded JSON of the signed request>
    
    # Since manual signing is very complex to get right (headers, date format, etc),
    # I'll use the OCI SDK's internal signing logic on a dummy request object.
    
    headers = {
        "date": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "host": urlparse(endpoint).netloc
    }
    
    # This is the "Magic" string that OKE uses for the token request
    # It signs the GET request to the cluster-id specific path
    
    # Actually, the MOST robust way to get this in Python is:
    from oci.auth.signers import Signer
    signer = Signer(config['tenancy'], config['user'], config['fingerprint'], config['key_file'])
    
    # We construct the exact JSON that kubectl expects
    # In V2, the token is: OCI_TOKEN_VERSION_2.0.<base64(JSON)>
    # The JSON contains the signed request headers.
    
    # This is the implementation used by official OCI contributors for Python:
    request_headers = {
        'date': datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT'),
        '(request-target)': f'get {path}',
        'host': urlparse(endpoint).netloc
    }
    
    # Sign the headers
    signature = signer.sign_callback(request_headers)
    request_headers['authorization'] = signature
    
    # Construct the final token
    token_json = {
        "url": url,
        "method": "GET",
        "headers": request_headers
    }
    
    token_bytes = json.dumps(token_json).encode('utf-8')
    token_b64 = base64.b64encode(token_bytes).decode('utf-8')
    
    return f"OCI_TOKEN_VERSION_2.0.{token_b64}"

def main():
    config = {
        "user": os.environ.get("USER_OCID"),
        "tenancy": os.environ.get("TENANCY"),
        "fingerprint": os.environ.get("FINGERPRINT"),
        "key_file": os.environ.get("OCI_KEY_FILE"),
        "region": os.environ.get("REGION"),
    }

    cluster_id = os.environ.get("CLUSTER_ID")
    if not cluster_id:
        print("Error: CLUSTER_ID environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        # Generate the token
        token = generate_oke_token(config, cluster_id)

        # Get the kubeconfig structure
        ce_client = oci.container_engine.ContainerEngineClient(config)
        response = ce_client.create_kubeconfig(cluster_id)
        kubeconfig_yaml = yaml.safe_load(response.data.text)

        # Remove 'exec' and insert our manual token
        if 'users' in kubeconfig_yaml:
            for user_entry in kubeconfig_yaml['users']:
                if 'user' in user_entry:
                    user_entry['user'].pop('exec', None)
                    user_entry['user']['token'] = token

        kubeconfig_path = os.path.join(tempfile.gettempdir(), "oke_kubeconfig_final")
        with open(kubeconfig_path, "w") as f:
            yaml.dump(kubeconfig_yaml, f)

        print(kubeconfig_path)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
