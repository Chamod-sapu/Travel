resource "oci_containerengine_cluster" "travelnest_oke" {
  compartment_id     = var.compartment_id
  kubernetes_version = "v1.28.2" # Adjust if necessary
  name               = "cluster-cqbaye2dlia"
  vcn_id             = oci_core_vcn.travelnest_vcn.id
  
  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = oci_core_subnet.oke_subnet.id
  }
}

resource "oci_containerengine_node_pool" "oke_node_pool" {
  cluster_id         = oci_containerengine_cluster.travelnest_oke.id
  compartment_id     = var.compartment_id
  kubernetes_version = "v1.28.2"
  name               = "travelnest-nodes"
  node_shape         = "VM.Standard.E4.Flex"
  
  node_shape_config {
    memory_in_gbs = 16
    ocpus         = 2
  }

  node_source_details {
    image_id    = "ocid1.image.oc1.ap-mumbai-1.aaaaaaaakw52h2d52l5s2u6f2qyf2k" # Replace with actual node image OCID
    source_type = "IMAGE"
  }
}
