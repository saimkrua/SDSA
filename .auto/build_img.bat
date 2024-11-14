@echo off
setlocal

rem Set the base directory for the project (one level up)
set BASE_DIR=%~dp0../

rem Build client image
echo Building client image...
cd /d "%BASE_DIR%client"
docker build -t papongun/sdsa-client .
docker image push papongun/sdsa-client

rem Build server image
echo Building server image...
cd /d "%BASE_DIR%server"
docker build -t papongun/sdsa-server .
docker image push papongun/sdsa-server

rem Build kitchen image
echo Building kitchen image...
cd /d "%BASE_DIR%kitchen"
docker build -t papongun/sdsa-kitchen .
docker image push papongun/sdsa-kitchen

rem Build kitchen-client image
echo Building kitchen-client image...
cd /d "%BASE_DIR%kitchen-client"
docker build -t papongun/sdsa-kitchen-client .
docker image push papongun/sdsa-kitchen-client

echo All images have been built successfully.

endlocal
pause
