import sys
import os

# Add the shared library path so Jenkins (running as SYSTEM) can find the oci package
sys.path.insert(0, r"C:\ProgramData\oci_libs")

import oci
import yaml
import tempfile

def get_kubeconfig():
    """
    Downloads the kubeconfig, removes the 'exec' section (which requires oci.exe),
    and inserts a static token instead.
    """
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
        ce_client = oci.container_engine.ContainerEngineClient(config)

        # 1. Download the raw kubeconfig content
        response = ce_client.create_kubeconfig(cluster_id)
        kubeconfig_yaml = yaml.safe_load(response.data.text)

        # 2. Generate a security token using the SDK
        token_response = ce_client.get_cluster_kubeconfig_token(cluster_id)
        token = token_response.data.token

        # 3. Modify the YAML to use the token instead of the 'oci' command
        # OCI kubeconfig usually has one user. We find it and replace 'exec' with 'token'.
        if 'users' in kubeconfig_yaml:
            for user_entry in kubeconfig_yaml['users']:
                if 'user' in user_entry:
                    # Remove the 'exec' block that causes the "oci not found" error
                    user_entry['user'].pop('exec', None)
                    # Insert the token we generated
                    user_entry['user']['token'] = token

        # 4. Write the "cleaned" kubeconfig to a temp file
        kubeconfig_path = os.path.join(tempfile.gettempdir(), "oke_kubeconfig_clean")
        with open(kubeconfig_path, "w") as f:
            yaml.dump(kubeconfig_yaml, f)

        # Print the path for Jenkins to capture
        print(kubeconfig_path)

    except Exception as e:
        print(f"Error generating clean kubeconfig: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    get_kubeconfig()
