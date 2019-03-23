package org.sciencegateways.geoportal.base.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

/**
 * Authentication for Keycloak OAuth2.
 */
@Component
public class KeycloakAuthenticationProvider implements AuthenticationProvider {
    private static final Logger LOGGER = LoggerFactory.getLogger(KeycloakAuthenticationProvider.class);
    ObjectMapper objectMapper = new ObjectMapper();
    /*
     * Instance variables
     */
    private boolean allUsersCanPublish = false;
    private String realmName;
    private String realmUrl;

    private String client_id;
    private String client_secret;
    private String rolePrefix;

    private String createAccountUrl;
    private boolean showMyProfileLink = false;


    private String redirectUri;
    private String geoportalAdministratorsGroupId;
    private String geoportalPublishersGroupId;

    private String authorizeTemplate = "%s/protocol/openid-connect/auth";
    private String authorizeLoginTemplate = "%s/protocol/openid-connect/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid email";

    private String tokenTemplate = "%s/protocol/openid-connect/token";
    private String registerTemplate = "%s/protocol/openid-connect/registrations?client_id=%s&redirect_uri=%s&response_type=code&scope=openid email";
    private String logoutTemplate = "%s/protocol/openid-connect/logout";
    private String userProfileTemplate = "%s/protocol/openid-connect/userinfo&auth_token=%s";

    /** True if all authenticated users shoudl have a Publisher role. */
    public boolean getAllUsersCanPublish() {
        return allUsersCanPublish;
    }

    /** True if all authenticated users should have a Publisher role. */
    public void setAllUsersCanPublish(boolean allUsersCanPublish) {
        this.allUsersCanPublish = allUsersCanPublish;
    }

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public String getRealmUrl() {
        return realmUrl;
    }

    public void setRealmUrl(String realmUrl) {
        this.realmUrl = realmUrl;
    }

    public String getLoginUrl() {
        return
                String.format(this.authorizeLoginTemplate, this.getRealmUrl(),this.getClient_id(), this.getRedirectUri());
    }

//    public void setRealmUrl(String realmUrl) {
//        this.realmUrl = realmUrl;
//    }

    /** The id of the ArcGIS group containing Geoportal administrators (optional). */
    public String getGeoportalAdministratorsGroupId() {
        return geoportalAdministratorsGroupId;
    }
    /** The id of the ArcGIS group containing Geoportal administrators (optional). */
    public void setGeoportalAdministratorsGroupId(String geoportalAdministratorsGroupId) {
        this.geoportalAdministratorsGroupId = geoportalAdministratorsGroupId;
    }

    /** The id of the ArcGIS group containing Geoportal publishers (optional). */
    public String getGeoportalPublishersGroupId() {
        return geoportalPublishersGroupId;
    }
    /** The id of the ArcGIS group containing Geoportal publishers (optional). */
    public void setGeoportalPublishersGroupId(String geoportalPublishersGroupId) {
        this.geoportalPublishersGroupId = geoportalPublishersGroupId;
    }

    public String getClient_id() {
        return client_id;
    }

    public void setClient_id(String client_id) {
        this.client_id = client_id;
    }

    public String getClient_secret() {
        return client_secret;
    }
    public void setClient_secret(String client_secret) {
        this.client_secret = client_secret;
    }
    public String getRolePrefix() {
        return rolePrefix;
      }
     
    public void setRolePrefix(String rolePrefix) {
        this.rolePrefix = rolePrefix;
      }
    /** The create account URL. */
    public String getCreateAccountUrl() {
        return
            String.format(this.registerTemplate, this.getRealmUrl(),this.getClient_id(), this.getRedirectUri());
    }
    /** The create account URL. */
//    public void setCreateAccountUrl(String createAccountUrl) {
//        this.createAccountUrl = createAccountUrl;
//    }
    /** If true, show My Profile link. */
    public boolean getShowMyProfileLink() {
        return false; // for now
      //  return showMyProfileLink;
    }
    /** If true, show My Profile link. */
    public void setShowMyProfileLink(boolean showMyProfileLink) {
        this.showMyProfileLink = showMyProfileLink;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    private String getThisReferer() {
        try {
            return InetAddress.getLocalHost().getCanonicalHostName();
        } catch (UnknownHostException ex) {
            return "";
        }
    }

    /**
     * Get keycloak token
     * @param username username
     * @param password password
     * @param referer referer
     * @return token
     * @throws AuthenticationException
     */
    private String executeGetToken(String username, String password, String referer) throws AuthenticationException {

        String access_token = null;
        if (username == null || username.length() == 0 || password == null || password.length() == 0) {
            throw new BadCredentialsException("Invalid credentials.");
        }

        String rest_url = String.format(tokenTemplate,this.getRealmUrl() ) ;
        URL realmURL = null;
        try {
             realmURL = new URL (this.getRealmUrl());
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new AuthenticationServiceException("RealmURL is not a URL");
        }
        HttpHost targetHost = new HttpHost(realmURL.getHost(),realmURL.getPort(),realmURL.getProtocol());
        UsernamePasswordCredentials creds = new UsernamePasswordCredentials(this.getClient_id(), this.getClient_secret());
        CredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(
                new AuthScope(targetHost.getHostName(), AuthScope.ANY_PORT),
                creds);
// Create AuthCache instance
        AuthCache authCache = new BasicAuthCache();
// Generate BASIC scheme object and add it to the local auth cache
        BasicScheme basicAuth = new BasicScheme();
        authCache.put(targetHost, basicAuth);
        // Add AuthCache to the execution context
        HttpClientContext localContext = HttpClientContext.create();
        localContext.setAuthCache(authCache);

        HttpClient client = HttpClients.custom().setDefaultCredentialsProvider(credsProvider).build();
        HttpPost post = new HttpPost(rest_url);
        try {

            List<BasicNameValuePair> urlParameters = new ArrayList<BasicNameValuePair>();
            urlParameters.add(new BasicNameValuePair("grant_type", "password"));
            //urlParameters.add(new BasicNameValuePair("response_type", "id_token token"));
            //  urlParameters.add(new BasicNameValuePair("response_mode", "query"));
            //  urlParameters.add(new BasicNameValuePair("client_id", this.getClient_id()));
            //  urlParameters.add(new BasicNameValuePair("client_secret", this.getClient_secret()));
            urlParameters.add(new BasicNameValuePair("username", username));
            urlParameters.add(new BasicNameValuePair("password", password));
            urlParameters.add(new BasicNameValuePair("scope", ""));
            post.setEntity(new UrlEncodedFormEntity(urlParameters));
        } catch (UnsupportedEncodingException exception) {
            throw new AuthenticationServiceException("Error in encoding the api parameters");
        }
        try {
            HttpResponse response = client.execute(targetHost, post,localContext);
            // HttpResponse response = client.execute(post);
            int response_code=response.getStatusLine().getStatusCode();
            if(response_code== HttpStatus.SC_UNAUTHORIZED){
                throw new BadCredentialsException("Invalid credentials.");
            }
            else if(response_code== HttpStatus.SC_OK){
                // JsonObject json_response = (JsonObject) JsonUtil.toJsonStructure(EntityUtils.toString(response.getEntity(), "UTF-8"));
                JsonNode json_response = (JsonNode) objectMapper.readTree( EntityUtils.toString(response.getEntity()));

                if (json_response.has("access_token")){
                    access_token=json_response.get("access_token").asText();


                }
                else{
                    LOGGER.error("Unable to get access token:" + json_response.asText() );
                    throw new AuthenticationServiceException("Unable to get access token from KeyCloak");
                }
                if (access_token == null || access_token.length() == 0) {
                    LOGGER.info("Invalid credentials:" + json_response.asText());
                    throw new BadCredentialsException("Invalid credentials.");
                }

            }

            else{
                JsonNode json_response = (JsonNode) objectMapper.readTree(  EntityUtils.toString(response.getEntity()) );
                String message;
                if (json_response.has("error_description")) {
                    message = "error_description from KeyCloak."
                        + json_response.get("access_token").asText();
                }
                else{
                    message = "Error response from KeyCloak.";
                }

                LOGGER.warn("AuthenticationErrors:" + response.getStatusLine() +":" + message);
                throw new AuthenticationServiceException(message);
            }
        } catch (IOException e) {
            throw new AuthenticationServiceException("Error in communicating with KeyCloak");
        }
        return access_token;
    }


    /** Get the roles for a user.
     * @param username the username
     * @param token the access  token
     * @param referer the  referer
     * @return the roles
     * @throws AuthenticationException
     */
    private List<GrantedAuthority> executeGetRoles(String username, String token, String referer)
            throws AuthenticationException {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<GrantedAuthority>();
        Jwt jwtToken = JwtHelper.decode(token);
        String jwtClaims  = jwtToken.getClaims();
        try {
            JsonNode jwtClaimsJsonNode = new ObjectMapper().readTree(jwtClaims);
            // can't find a way to do //{{client_id}}/roles //geoportal/roles, so full path required.
            JsonNode roles=  jwtClaimsJsonNode.at("/resource_access/"+ this.getClient_id()+"/roles");
            if (roles.isArray()) {
                for (JsonNode role : roles) {

                    grantedAuthorities.add(new SimpleGrantedAuthority(role.asText()));
                }} else {
                LOGGER.warn("KeycloakAuthenticationProvider:executeGetRoles: no roles found");
                // should we throw an error here, or just let it be
                //"add roles to user:{{username}} for client_id:{{client_id}}"
            }
            roles=  jwtClaimsJsonNode.at("/realm_access/roles");
            if (roles.isArray()) {
                for (JsonNode role : roles) {

                    grantedAuthorities.add(new SimpleGrantedAuthority(role.asText()));
                }}

          if (  grantedAuthorities.isEmpty()) {
              LOGGER.warn("KeycloakAuthenticationProvider:executeGetRoles: no roles found");
              LOGGER.info("KeycloakAuthenticationProvider:executeGetRoles: add roles to user:"+username+" for client_id:"+this.getClient_id());
              // should we throw an error here, or just let it be
              //"add roles to user:{{username}} for client_id:{{client_id}}"
          }
        } catch (IOException ioex){
            LOGGER.error("KeycloakAuthenticationProvider:executeGetRoles: error decoding token: "+
                    token );
            throw  new AuthenticationCredentialsNotFoundException("error decoding roles from token");

        }
        return grantedAuthorities;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        LOGGER.debug("KeycloakAuthenticationProvider:authenticate");
        String username=authentication.getName();
        String password=authentication.getCredentials().toString();
        String referer=this.getThisReferer();
        String token=executeGetToken(username, password, referer);
        List<GrantedAuthority> roles=executeGetRoles(username, token, referer);
        return new UsernamePasswordAuthenticationToken(username, password, roles);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}