resource "oci_mysql_mysql_db_system" "travelnest_mysql" {
  admin_password      = var.mysql_admin_password
  admin_username      = var.mysql_admin_username
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  shape_name          = "MySQL.2"
  subnet_id           = oci_core_subnet.private_subnet.id
  display_name        = "travelnest-mysql"
  data_storage_size_in_gb = 50
  backup_policy {
    is_enabled        = true
    retention_in_days = 7
  }
  is_highly_available = false
  lifecycle { prevent_destroy = true }
}
