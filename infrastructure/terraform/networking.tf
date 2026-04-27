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

# Service Gateway for private access to OCI Services
data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

resource "oci_core_service_gateway" "travelnest_sg" {
  compartment_id = var.compartment_ocid
  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
  vcn_id       = oci_core_vcn.travelnest_vcn.id
  display_name = "travelnest-sg"
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
  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.travelnest_sg.id
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
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.travelnest_vcn.id
  cidr_block                 = var.private_subnet_cidr
  route_table_id             = oci_core_route_table.private_rt.id
  display_name               = "private-subnet"
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

# EGRESS Rules - allow all outbound traffic so nodes can register
resource "oci_core_network_security_group_security_rule" "all_egress" {
  for_each = {
    jenkins = oci_core_network_security_group.jenkins_nsg.id
    oke     = oci_core_network_security_group.oke_nsg.id
    mysql   = oci_core_network_security_group.mysql_nsg.id
  }
  network_security_group_id = each.value
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}

# OKE Kubernetes API port
resource "oci_core_network_security_group_security_rule" "oke_k8s_api" {
  network_security_group_id = oci_core_network_security_group.oke_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range {
      min = 6443
      max = 6443
    }
  }
}

# Allow all intra-VCN traffic for OKE node communication
resource "oci_core_network_security_group_security_rule" "oke_internal" {
  network_security_group_id = oci_core_network_security_group.oke_nsg.id
  direction                 = "INGRESS"
  protocol                  = "all"
  source                    = var.vcn_cidr
  source_type               = "CIDR_BLOCK"
}

# Jenkins SSH
resource "oci_core_network_security_group_security_rule" "jenkins_ssh" {
  network_security_group_id = oci_core_network_security_group.jenkins_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

# Jenkins Web UI
resource "oci_core_network_security_group_security_rule" "jenkins_web" {
  network_security_group_id = oci_core_network_security_group.jenkins_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range {
      min = 8080
      max = 8080
    }
  }
}

# MySQL access from private subnet
resource "oci_core_network_security_group_security_rule" "mysql_access" {
  network_security_group_id = oci_core_network_security_group.mysql_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = var.private_subnet_cidr
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}
