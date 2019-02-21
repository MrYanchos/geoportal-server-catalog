# Configure keycloak on Geoportal-server
## Setting up keycloak server
- Run keycloak from the docker file ``` docker-compose up```
- Log into the Keycloak console at http://localhost:8843/auth with the username and password specified in the docker file.
- Create a new realm ```Geoportal``` at http://localhost:8843/auth/admin/master/console/#/realms/master
- Create a new client ```geoportal``` at http://localhost:8843/auth/admin/master/console/#/realms/Geoportal/clients with the root url as http://localhost:8080/geoportal
- Create a role ```ROLE``` in the ```geoportal``` client.
- Create a new user ```testuser``` with the password ```password``` in the ```Geoportal``` realm. While doing so, disable ```Temporary password``` in ```credentials```
- Map the user ```testuser``` to the ```geoportal``` client from the ```role-mappings```.

## Configure keycloak-authentication.xml
- Configure the following bean properties:
  - ```realmName``` :- ```Geoportal```
  - ```authorizeURL``` :- http://localhost:8843/auth/realms/Geoportal/protocol/openid-connect/token
  - ```adminUserName``` :- ```admin```
  - ```adminPassword``` :- ```password```
  - ```client_id``` :- ```geoportal```
## Update app-security.xml
- Uncomment ```<beans:import resource="authentication-keycloak.xml"/>``` and comment out other  ```security imports```
## Maven build and test
- Build a new war using the above changes and test the configuration with the user ```testuser``` and password ```password```.
