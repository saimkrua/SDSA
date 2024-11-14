@echo off
rem Set the base directory where the subdirectories are located
set BASE_DIR=..

rem Define the list of subdirectories where the yaml files are located
set DIRECTORIES=client server kitchen kitchen-client rabbitMQ

rem Loop through each directory
for %%d in (%DIRECTORIES%) do (
    rem Navigate to the directory
    echo Deploying in %%d...

    rem Apply the deployment and service YAML files in each subdirectory
    kubectl apply -f %BASE_DIR%\%%d\deployment.yaml
    kubectl apply -f %BASE_DIR%\%%d\service.yaml

    echo Finished deploying in %%d.
)

@REM kubectl apply -f ingress.yaml
@REM kubectl port-forward svc/sdsa-client-service 3000:3000 -n sdsa
@REM kubectl port-forward svc/sdsa-kitchen-service 8000:8000 -n sdsa
@REM kubectl port-forward svc/sdsa-kitchen-client-service 3001:3001 -n sdsa

echo All deployments and services applied successfully.
pause
