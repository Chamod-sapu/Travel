# PowerShell script to generate RSA256 public/private keys using openssl
# Assuming openssl is installed and inPATH

echo "Generating private key..."
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

echo "Extracting public key..."
openssl rsa -pubout -in private.pem -out public.pem

echo "Converting private key to PKCS8 format (needed by Java)..."
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private.pem -out private_pkcs8.pem

echo "Generating base64 encoded strings for application properties..."
$privateKeyBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("private_pkcs8.pem"))
$publicKeyBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("public.pem"))

echo "Base64 Private Key for user-service (copy without spaces):"
echo $privateKeyBase64

echo ""
echo "Base64 Public Key for api-gateway (copy without spaces):"
echo $publicKeyBase64

echo "Keys generated successfully!"
