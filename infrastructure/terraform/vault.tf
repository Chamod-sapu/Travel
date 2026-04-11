resource "oci_kms_vault" "travelnest_vault" {
  compartment_id = var.compartment_ocid
  display_name   = "travelnest-vault"
  vault_type     = "DEFAULT"
  lifecycle { prevent_destroy = true }
}

resource "oci_kms_key" "master_key" {
  compartment_id = var.compartment_ocid
  display_name   = "travelnest-master-key"
  management_endpoint = oci_kms_vault.travelnest_vault.management_endpoint
  key_shape {
    algorithm = "AES"
    length    = 32 # AES-256
  }
}

resource "oci_vault_secret" "db_password" {
  compartment_id = var.compartment_ocid
  secret_content {
    content_type = "BASE64"
    name         = "db-password"
    content = base64encode(var.mysql_admin_password)
  }
  secret_name = "db-password"
  vault_id    = oci_kms_vault.travelnest_vault.id
  key_id      = oci_kms_key.master_key.id
}

# Same pattern for others
