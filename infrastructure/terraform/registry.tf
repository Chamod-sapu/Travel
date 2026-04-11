variable "services" {
  default = ["user-service", "flight-service", "hotel-service", "package-service", "payment-service", "notification-service", "api-gateway", "service-registry", "frontend"]
}

resource "oci_artifacts_container_repository" "repos" {
  for_each       = toset(var.services)
  compartment_id = var.compartment_ocid
  display_name   = "travelnest/${each.value}"
  is_public      = false
}
