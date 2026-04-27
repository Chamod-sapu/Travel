import oci
import os
import sys

def get_token():
    # Load configuration from environment variables (passed by Jenkins)
    config = {
        "user": os.environ.get("USER_OCID"),
        "tenancy": os.environ.get("TENANCY"),
        "fingerprint": os.environ.get("FINGERPRINT"),
        "key_file": os.environ.get("OCI_KEY_FILE"),
        "region": os.environ.get("REGION")
    }
    
    cluster_id = os.environ.get("CLUSTER_ID")
    if not cluster_id:
        print("Error: CLUSTER_ID environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        # Initialize the Container Engine client
        ce_client = oci.container_engine.ContainerEngineClient(config)
        
        # Generate the authentication token
        # This is exactly what 'oci ce cluster generate-token' does
        response = ce_client.get_cluster_kubeconfig_content(cluster_id, token_version="2.0.0")
        
        # The token is actually embedded in the response if we use the right call
        # But even better: we can use the 'get_token' functionality of the SDK
        # In modern OCI SDKs, we use the signer to create the token string
        from oci.signer import Signer
        signer = Signer(
            tenancy=config["tenancy"],
            user=config["user"],
            fingerprint=config["fingerprint"],
            private_key_file_location=config["key_file"]
        )
        
        # OKE Token is a signed string of the cluster ID
        import base64
        from datetime import datetime, timedelta
        
        # This is a bit complex to re-implement exactly, 
        # so let's use the most direct SDK method.
        # Actually, the SDK has a dedicated method for this:
        token = ce_client.get_cluster_kubeconfig_token(cluster_id).data.token
        print(token)
        
    except Exception as e:
        print(f"Error generating token: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    get_token()
