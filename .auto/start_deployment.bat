@echo off
rem Set the base directory where the subdirectories are located
set BASE_DIR=..

rem Define the list of subdirectories where the yaml files are located
set DIRECTORIES=client server kitchen rabbitMQ

rem Loop through each directory
for %%d in (%DIRECTORIES%) do (
    rem Navigate to the directory
    echo Deploying in %%d...

    rem Apply the deployment and service YAML files in each subdirectory
    kubectl apply -f %BASE_DIR%\%%d\deployment.yaml
    kubectl apply -f %BASE_DIR%\%%d\service.yaml

    echo Finished deploying in %%d.
)

kubectl apply -f ingress.yaml

echo All deployments and services applied successfully.
pause
