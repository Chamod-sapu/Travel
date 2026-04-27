data "oci_identity_availability_domains" "ads" { compartment_id = var.compartment_ocid }
data "oci_core_images" "oracle_linux_8_x86" {
  compartment_id = var.compartment_ocid
  operating_system = "Oracle Linux"
  operating_system_version = "8"
  shape = "VM.Standard.E4.Flex"
}

data "oci_core_images" "oracle_linux_8_arm" {
  compartment_id = var.compartment_ocid
  operating_system = "Oracle Linux"
  operating_system_version = "8"
  shape = "VM.Standard.A1.Flex"
}

resource "oci_core_instance" "jenkins_server" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  shape               = "VM.Standard.A1.Flex"
  shape_config {
    memory_in_gbs = 24
    ocpus         = 4
  }
  source_details {
    source_id   = data.oci_core_images.oracle_linux_8_arm.images[0].id
    source_type = "image"
    boot_volume_size_in_gbs = 50
  }
  create_vnic_details {
    subnet_id = oci_core_subnet.public_subnet.id
    nsg_ids   = [oci_core_network_security_group.jenkins_nsg.id]
  }
  metadata = {
    ssh_authorized_keys = var.jenkins_ssh_public_key
    user_data = base64encode(<<EOF
#!/bin/bash
dnf install -y java-17-openjdk git maven docker ansible oraclelinux-developer-release-el8
dnf install -y python39-oci-cli
systemctl enable docker && systemctl start docker
EOF
    )
  }
  display_name = "travelnest-jenkins"
}

resource "oci_core_instance" "bastion_host" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  shape               = "VM.Standard.E2.1.Micro" # Always Free
  source_details {
    source_id   = data.oci_core_images.oracle_linux_8_x86.images[0].id
    source_type = "image"
    boot_volume_size_in_gbs = 50
  }
  create_vnic_details {
    subnet_id = oci_core_subnet.public_subnet.id
  }
  metadata = {
    ssh_authorized_keys = var.bastion_ssh_public_key
    user_data = base64encode(<<EOF
#!/bin/bash
dnf update -y
EOF
    )
  }
  display_name = "travelnest-bastion"
}
