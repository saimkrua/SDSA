#!/bin/bash

# Set the base directory where the subdirectories are located
BASE_DIR=".."

# Apply MongoDB and RabbitMQ YAML files
kubectl apply -f "$BASE_DIR/mongodb/mongo-bitnami.yaml"
kubectl apply -f "$BASE_DIR/rabbitMQ/rabbitmq-persist.yaml"

# Define the list of subdirectories where the YAML files are located
DIRECTORIES=("client" "server" "kitchen")

# Loop through each directory
for dir in "${DIRECTORIES[@]}"; do
    # Navigate to the directory and apply the deployment and service YAML files
    echo "Deploying in $dir..."

    kubectl apply -f "$BASE_DIR/$dir/deployment.yaml"
    kubectl apply -f "$BASE_DIR/$dir/service.yaml"

    echo "Finished deploying in $dir."
done

# Apply ingress YAML file
kubectl apply -f ingress.yaml

echo "All deployments and services applied successfully."
