resource "oci_containerengine_cluster" "travelnest_cluster" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.31.1"
  name               = "travelnest-cluster"
  vcn_id             = oci_core_vcn.travelnest_vcn.id
  endpoint_config {
    subnet_id            = oci_core_subnet.public_subnet.id
    is_public_ip_enabled = true
    nsg_ids              = [oci_core_network_security_group.oke_nsg.id]
  }
}

resource "oci_containerengine_node_pool" "travelnest_node_pool" {
  cluster_id         = oci_containerengine_cluster.travelnest_cluster.id
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.31.1"
  name               = "travelnest-nodes"
  node_shape         = "VM.Standard3.Flex"
  node_source_details {
    image_id    = data.oci_core_images.oracle_linux_8_x86.images[0].id
    source_type = "IMAGE"
    boot_volume_size_in_gbs = 50
  }
  node_config_details {
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.private_subnet.id
    }
    size = var.node_pool_size
  }
  node_shape_config {
    ocpus         = 2
    memory_in_gbs = 16
  }
}
