resource "oci_mysql_mysql_db_system" "travelnest_mysql" {
  admin_password      = "Qwertyuiop@1234"
  admin_username      = "travelnest"
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  shape_name          = "MySQL.VM.Standard.E4.1.8GB"
  subnet_id           = oci_core_subnet.mysql_subnet.id
  display_name        = "travelnest-mysql"
  ip_address          = "10.0.10.140"
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}
