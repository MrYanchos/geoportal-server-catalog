package org.sciencegateways.geoportal.base.security;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.Val;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.json.JsonObject;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

/**
 * Authentication for Keycloak OAuth2.
 */
@Component
public class KeycloakAuthenticationProvider implements AuthenticationProvider {
    private static final Logger LOGGER = LoggerFactory.getLogger(KeycloakAuthenticationProvider.class);
    /*
     * Instance variables
     */
    private boolean allUsersCanPublish = false;
    private String realmName;
    private String authorizeURL;
    private String adminUserName;
    private String client_id;
    private String rolePrefix;
    private String adminPassword;
    private String createAccountUrl;
    private String geoportalAdministratorsGroupId;
    private String geoportalPublishersGroupId;

    /** True if all authenticated users shoudl have a Publisher role. */
    public boolean getallUsersCanPublish() {
        return allUsersCanPublish;
    }
    public void setallUsersCanPublish(boolean allUsersCanPublish){
        this.allUsersCanPublish=allUsersCanPublish;
    }

    /** True if all authenticated users should have a Publisher role. */
    public void setAllUsersCanPublish(boolean allUsersCanPublish) {
        this.allUsersCanPublish = allUsersCanPublish;
    }

    public String getrealmName() {
        return realmName;
    }

    public void setrealmName(String realmName) {
        this.realmName = realmName;
    }

    public String getAuthorizeURL() {
        return authorizeURL;
    }

    public void setAuthorizeURL(String authorizeURL) {
        this.authorizeURL = authorizeURL;
    }

    public String getadminUserName() {
        return adminUserName;
    }

    public void setadminUserName(String adminUserName) {
        this.adminUserName = adminUserName;
    }
    public String getadminPassword(){
        return adminPassword;
    }

    public void setadminPassword(String adminPassword){
        this.adminPassword=adminPassword;
    }
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

    public String getclient_id() {
        return client_id;
    }

    public void setclient_id(String client_id) {
        this.client_id = client_id;
    }
    public String getrolePrefix() {
        return rolePrefix;
      }
     
    public void setrolePrefix(String rolePrefix) {
        this.rolePrefix = rolePrefix;
      }
    /** The create account URL. */
    public String getCreateAccountUrl() {
        return createAccountUrl;
    }
    /** The create account URL. */
    public void setCreateAccountUrl(String createAccountUrl) {
        this.createAccountUrl = createAccountUrl;
    }

    private String getThisReferer() {
        try {
            return InetAddress.getLocalHost().getCanonicalHostName();
        } catch (UnknownHostException ex) {
            return "";
        }
    }

    /*
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
        String rest_url = this.getAuthorizeURL();
        HttpClient client = HttpClientBuilder.create().build();
        HttpPost post = new HttpPost(rest_url);
        try {
            List<BasicNameValuePair> urlParameters = new ArrayList<BasicNameValuePair>();
            urlParameters.add(new BasicNameValuePair("grant_type", "password"));
            urlParameters.add(new BasicNameValuePair("client_id", this.getclient_id()));
            urlParameters.add(new BasicNameValuePair("username", username));
            urlParameters.add(new BasicNameValuePair("password", password));
            post.setEntity(new UrlEncodedFormEntity(urlParameters));
        } catch (UnsupportedEncodingException exception) {
            throw new AuthenticationServiceException("Error in encoding the api parameters");
        }
        try {
            HttpResponse response = client.execute(post);
            int response_code=response.getStatusLine().getStatusCode();
            if(response_code==HttpStatus.SC_UNAUTHORIZED){
                throw new BadCredentialsException("Invalid credentials.");
            }
            else if(response_code==HttpStatus.SC_OK){
                JsonObject json_response = (JsonObject) JsonUtil.toJsonStructure(EntityUtils.toString(response.getEntity(), "UTF-8"));
                if (json_response.containsKey("access_token")){
                    access_token=json_response.getString("access_token");
                    
                
                }
                else{
                    throw new AuthenticationServiceException("Unable to get access token from the service");
                }
                if (access_token == null || access_token.length() == 0) {
                    throw new BadCredentialsException("Invalid credentials.");
                  }
                
            }

            else{
                throw new AuthenticationServiceException("Error communicating with the authentication service.");
            }
        } catch (IOException e) {
            throw new AuthenticationServiceException("Error in communicating with authentication service");
        }
          return access_token;
      }

      /*
        * Get the roles for a user.
        * @param username the username 
        * @param token the keycloak token
        * @param referer the HTTP referer
        * @return the roles
        * @throws AuthenticationException
       */
      private List<GrantedAuthority> executeGetRoles(String username, String token, String referer) 
       /*
       */
      throws AuthenticationException {
        List<GrantedAuthority> roles=new ArrayList<>();
        String pfx = Val.chkStr(this.getrolePrefix(),"").trim();
        roles.add(new SimpleGrantedAuthority(pfx+"ADMIN"));
        roles.add(new SimpleGrantedAuthority(pfx+"PUBLISH"));
        roles.add(new SimpleGrantedAuthority(pfx+"USER"));


        return roles;
        

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