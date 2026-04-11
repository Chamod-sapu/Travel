resource "oci_core_vcn" "travelnest_vcn" {
  compartment_id = var.compartment_id
  display_name   = "travelnest-vcn"
  cidr_block     = "10.0.0.0/16"
}

resource "oci_core_internet_gateway" "travelnest_igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "travelnest-igw"
}

resource "oci_core_subnet" "oke_subnet" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  cidr_block     = "10.0.1.0/24"
  display_name   = "oke-subnet"
}

resource "oci_core_subnet" "mysql_subnet" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  cidr_block     = "10.0.10.0/24"
  display_name   = "mysql-subnet"
  prohibit_public_ip_on_vnic = true
}
