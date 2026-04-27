import sys
import os

# Add the shared library path so Jenkins (running as SYSTEM) can find the oci package
sys.path.insert(0, r"C:\ProgramData\oci_libs")

import oci
import yaml
import tempfile

def get_kubeconfig():
    """
    Downloads the full kubeconfig for the OKE cluster and writes it to a temp file.
    Prints the path to the temp file so the Jenkinsfile can use it.
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

        # Download the full kubeconfig content from OKE
        response = ce_client.create_kubeconfig(cluster_id)
        kubeconfig_content = response.data.text

        # Write to a temp file that kubectl can consume
        kubeconfig_path = os.path.join(tempfile.gettempdir(), "oke_kubeconfig")
        with open(kubeconfig_path, "w") as f:
            f.write(kubeconfig_content)

        # Print the path so Jenkins can capture it
        print(kubeconfig_path)

    except Exception as e:
        print(f"Error generating kubeconfig: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    get_kubeconfig()
