# Configure keycloak on Geoportal-server

## Production
## install a keycloak server
- from https://www.keycloak.org/
- or utilize one from: (())

### Setting up keycloak server
- Log into the Keycloak console at https://{{keycloak_host}}:{{port}}/auth with the username and password specified in the docker file.
- Create a new realm eg ```Geoportal``` at https://{{keycloak_host}}:{{port}}/auth/admin/master/console/#/realms/master
- Create a new client eg```geoportal-client``` at https://{{keycloak_host}}:{{port}}/auth/admin/master/console/#/realms/Geoportal/clients with the root url as http://{{geoportal_host}}:8080/geoportal
- In the new role , add a valid redirect URI of the geoportal, eg https://{{gpt_host}}:{{gpt_port}}/*
- Create a roles ```ROLE_USER```, ```ROLE_PUBLISHER```,```ROLE_ADMIN``` in the ```geoportal-client``` client.
-- Turn on the composite flag for  ```ROLE_PUBLISHER```, select ``geoportal-client``` add role ```ROLE_USER```  
-- Turn on the composite flag for  ```ROLE_ADMIN```, select ``geoportal-client``` add role ```ROLE_PUBLISHER```
-- Roles can also created at the realm level, which can simplify the application management
- Create a new user eg ```testuser``` with the password eg ```password``` in the ```Geoportal``` realm. 
- Map the user eg ```testuser``` to the ```ROLE_USER``` client from the ```role-mappings```.
- Create a new user eg ```testpublisher``` with the password eg ```password``` in the ```Geoportal``` realm. 
- Map the user eg ```testpublisher``` to the ```ROLE_PUBLISHER``` client from the ```role-mappings```.
-- the publisher effective roles should include ``ROLE_USER``` and ```ROLE_PUBLISHER```

### Configure keycloak-authentication.xml
- Configure the following bean properties:
  - ```realmName``` :- ```Geoportal```
  - ```authorizeURL``` :- https://{{keycloak_host}}:{{port}}/auth/realms/{{realmName}}
  - ```client_id``` :- ```geoportal-client```
  - ```client_secrete``` :- ```secrete from {{clients/{{geportal_client}}/credentials```
  - ```rolePrefix``` :- ```ROLE_```
  - ```allUsersCanPublish``` :- ```true```
  - ```redirectUri``` :- ```HOST URL``` 

### Update app-security.xml
- Uncomment ```<beans:import resource="authentication-keycloak.xml"/>``` 
- comment out other  ```security imports``` eg ```<!-- <beans:import resource="authentication-simple.xml"/> -->```

## restart and test
- login testuser and testpublisher
## delete test users
- login to keycloack and delete testuser and testpublisher

## Notes
### Simplifying user management
If you are managing multiple applications as separate clients (eg Geoportal and Geoporal Harvester),
this can be a way to simplify application of appropriate roles.
1. Create a group, these are not Geoportal groups, they a collection of roles.
1. Add roles to that group.
1. Add user to group.

### Geoportal Groups
**[untested]**
- Create roles, without a ```ROLE``` prefix
- Create a group, 
-- if users in group and publish, add ```ROLE_PUBLISHER```, and added role from above
-- if users in group and publish, add ```ROLE_USER```, and added role from above


## Development testing 

### Setting up keycloak server
- ``` cd contrib/keycloak_docker```
- Run keycloak from the docker file ``` docker-compose up```
- Log into the Keycloak console at http://localhost:8843/auth with the username and password specified in the docker file.
- Create a new realm ```Geoportal``` at http://localhost:8843/auth/admin/master/console/#/realms/master
- Create a new client ```geoportal``` at http://localhost:8843/auth/admin/master/console/#/realms/Geoportal/clients with the root url as http://localhost:8080/geoportal
- In the new role , add a valid redirect URI of the geoportal, eg https://{{gpt_host}}:{{gpt_port}}/*
- Create a roles ```ROLE_USER```, ```ROLE_PUBLISHER```,```ROLE_ADMIN``` in the ```geoportal-client``` client.
-- Turn on the composite flag for  ```ROLE_PUBLISHER```, select ``geoportal-client``` add role ```ROLE_USER```  
-- Turn on the composite flag for  ```ROLE_ADMIN```, select ``geoportal-client``` add role ```ROLE_PUBLISHER```
-- Roles can also created at the realm level, which can simplify the application management
- Create a new user eg ```testuser``` with the password eg ```password``` in the ```Geoportal``` realm. 
- Map the user eg ```testuser``` to the ```ROLE_USER``` client from the ```role-mappings```.
- Create a new user eg ```testpublisher``` with the password eg ```password``` in the ```Geoportal``` realm. 
- Map the user eg ```testpublisher``` to the ```ROLE_PUBLISHER``` client from the ```role-mappings```.
-- the publisher effective roles should include ``ROLE_USER``` and ```ROLE_PUBLISHER```
- Create a new user eg ```gptadmin``` with the password eg ```password``` in the ```Geoportal``` realm. 
- Map the user eg ```gptadmin``` to the ```ROLE_ADMIN``` client from the ```role-mappings```.
-- the publisher effective roles should include ``ROLE_USER```, ```ROLE_PUBLISHER``` and ```ROLE_ADMIN```

### Configure keycloak-authentication.xml
- By default, the keycloak-authentication is configured with following bean properties:
  - ```realmName : geoportal```
  - ```authorizeURL : http://localhost:8843/auth/realms/geoportal/protocol/openid-connect/token```
  - ```client_id : geoportal-client```
  - ```client_secret : secret from {{clients/{{geportal_client}}/credentials```
  - ```rolePrefix : ROLE_```
  - ```allUsersCanPublish : true```
  - ```redirectUri : https://locahost:8081/geoportal```
  You should just need to set the ENVIRONMENT variable, kc_client_secret
  
### Update app-security.xml
- Uncomment ```<beans:import resource="authentication-keycloak.xml"/>``` and comment out other  ```security imports```
### Maven build and test
- Build a new war using the above changes and test the configuration with the user ```testuser``` and password ```password```.

### Variable for testing and production
Set the environment variables;
${kc_realmName:geoportal} variable KC_REALMNAME
${kc_realmUrl:https://locahost:8843/auth/realms/geoportal} variable KC_REALMURL
${kc_client_id:geoportal} variable KC_CLIENT_ID
${kc_client_secret:00000000-1111-2222-3333-99999999999} variable KC_CLIENT_SECRET
${kc_redirectUri:https://locahost:8081/geoportal} variable KC_REDIRECTURI

${gpt_publish:true} variable GPT_PUBLISH

# Dev
### Option 1: tomcat conf
1. Add the following to [Tomcat8]/conf/catalina.properties.      

```
# Keycloak for Geoportal
kc_realmName:geoportal
kc_realmUrl:https://locahost:8843/auth/realms/geoportal
kc_client_id:geoportal
kc_client_secret:00000000-1111-2222-3333-99999999999
kc_redirectUri:https://locahost:8081/geoportal
gpt_publish:true
```

### Option 2: Intellij Tomcat Startup/Stop 
In run/debug configuration, tomcat server>your configuration>Startup/Stop
Set the environment variables

### Option 3: Use environment variables

# Production/docker
### Option 1: Use environment variables
### Option 2: pass environment variables in docker-compose/kubernetes


# realm admin
https://{{host}}auth/realms/{{realm}}/console

https://iam.scigap.org/auth/realms/ddstudio/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=https%3A%2F%2Fiam.scigap.org%2Fauth%2Fadmin%2Fddstudio%2Fconsole%2F&state=0f24707f-7ae7-4521-8021-3d5dc47f0cb9&nonce=21e876a2-7a1a-4a77-8e24-67ad73339eea&response_mode=fragment&response_type=code&scope=openid