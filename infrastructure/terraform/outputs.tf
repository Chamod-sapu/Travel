output "jenkins_public_ip" { value = oci_core_instance.jenkins_server.public_ip }
output "bastion_public_ip" { value = oci_core_instance.bastion_host.public_ip }
output "mysql_private_ip" { value = oci_mysql_mysql_db_system.travelnest_mysql.ip_address }
output "oke_cluster_id" { value = oci_containerengine_cluster.travelnest_cluster.id }
output "vcn_id" { value = oci_core_vcn.travelnest_vcn.id }
output "private_subnet_id" { value = oci_core_subnet.private_subnet.id }
output "vault_id" { value = oci_kms_vault.travelnest_vault.id }
output "ocir_endpoint" { value = "${var.region}.ocir.io" }
