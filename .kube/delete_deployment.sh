#!/bin/bash

# Delete all deployments in the sdsa namespace
kubectl delete deployments --all -n sdsa

# Delete all services in the sdsa namespace
kubectl delete services --all -n sdsa

# Delete all ingress resources in the sdsa namespace
kubectl delete ingress --all -n sdsa

echo "All deployments, services, and ingress resources in the sdsa namespace have been deleted."
