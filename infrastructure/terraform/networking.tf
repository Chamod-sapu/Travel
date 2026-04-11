resource "oci_core_vcn" "travelnest_vcn" {
  compartment_id = var.compartment_ocid
  display_name   = "travelnest-vcn"
  cidr_block     = var.vcn_cidr
}

resource "oci_core_internet_gateway" "travelnest_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "travelnest-igw"
}

resource "oci_core_nat_gateway" "travelnest_nat" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "travelnest-nat"
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "public-rt"
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.travelnest_igw.id
  }
}

resource "oci_core_route_table" "private_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "private-rt"
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.travelnest_nat.id
  }
}

resource "oci_core_subnet" "public_subnet" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  cidr_block     = var.public_subnet_cidr
  route_table_id = oci_core_route_table.public_rt.id
  display_name   = "public-subnet"
}

resource "oci_core_subnet" "private_subnet" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  cidr_block     = var.private_subnet_cidr
  route_table_id = oci_core_route_table.private_rt.id
  display_name   = "private-subnet"
  prohibit_public_ip_on_vnic = true
}

resource "oci_core_network_security_group" "jenkins_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "jenkins-nsg"
}
resource "oci_core_network_security_group" "mysql_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "mysql-nsg"
}
resource "oci_core_network_security_group" "oke_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "oke-nsg"
}
resource "oci_core_network_security_group" "lb_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.travelnest_vcn.id
  display_name   = "lb-nsg"
}

# Add Security Group Rules
resource "oci_core_network_security_group_security_rule" "jenkins_ssh" {
  network_security_group_id = oci_core_network_security_group.jenkins_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range { min = 22, max = 22 }
  }
}
resource "oci_core_network_security_group_security_rule" "jenkins_web" {
  network_security_group_id = oci_core_network_security_group.jenkins_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range { min = 8080, max = 8080 }
  }
}
resource "oci_core_network_security_group_security_rule" "mysql_access" {
  network_security_group_id = oci_core_network_security_group.mysql_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = var.private_subnet_cidr
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range { min = 3306, max = 3306 }
  }
}
resource "oci_core_network_security_group_security_rule" "oke_intra" {
  network_security_group_id = oci_core_network_security_group.oke_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = var.vcn_cidr
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range { min = 6443, max = 6443 }
  }
}
