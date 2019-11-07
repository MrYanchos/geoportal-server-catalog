/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.cinergi.collection.collection.rest;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.util.ItemUtil;
import com.esri.geoportal.lib.elastic.util.AccessUtil;

//import org.elasticsearch.action.DocWriteResponse.Result;
//import org.elasticsearch.action.delete.DeleteResponse;

import java.util.Random;
import javax.json.*;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import net.dongliu.requests.*;
import net.dongliu.requests.body.Part;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.InputStreamBody;
import org.apache.http.impl.client.CloseableHttpClient;

import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.client.HttpClients;


import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Delete an item.
 */
public class publishToSuaveRequest {
        //extends AppRequest {

  /** Instance variables. */
  private String collectionJson;
  public Object appUser;
  private AsyncResponse asyncResponse;
  private Response response;

  /** Constructor. */
  public publishToSuaveRequest() {
    super();
  }

  public publishToSuaveRequest(AsyncResponse asyncResponse, Object appUser) {
    this.asyncResponse = asyncResponse;
    this.appUser = appUser;
  }

  /** The item collectionJson. */
  public String getJson() {
    return collectionJson;
  }
  /** The item collectionJson. */
  public void setJson(String id) {
    this.collectionJson = id;
  }
  
  /** Methods =============================================================== */
  /**
   * Execute the request.
   * @param hsr the servlet request
   * @param body the request body
   */
  public void execute(HttpServletRequest hsr, String body) {
    this.execute(hsr,null,body);
  }
  /**
   * Execute the request.
   * @param hsr the servlet request
   * @param requestParams the rest parameters
   * @param body the request body
   */
  public void execute(HttpServletRequest hsr,
                      MultivaluedMap<String, String> requestParams,
                      String body) {

 //   @Override
 // public AppResponse execute() throws Exception {
    //AppResponse response = new AppResponse();
    init(body);
    String[] name_col = SuaveTest.getNC(getJson());
    String user = name_col[0];
    String alljsn = name_col[1];
    String survey_name = name_col[2];

    String[] colIds = SuaveTest.getJsonIds(alljsn);

    if (colIds == null || colIds.length == 0) {
      //response.writeIdIsMissing(this);
    //  return response;
      putResponse(StatusCodes.BAD_REQUEST,MediaType.TEXT_PLAIN, "error No Identifiers", null);
    }
    AccessUtil au = new AccessUtil();

    String[] colJsons = new String[colIds.length];
    String id;
    ItemUtil itemUtil;
    for(int i = 0; i < colIds.length; i++) {

//      au.ensureWriteAccess(getUser(), colIds[i]);

      ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
      itemUtil = new ItemUtil();
      // foreach itemid
      try {
        colJsons[i] = itemUtil.readItemJson(ec.getItemIndexName(), ec.getItemIndexType(), colIds[i]).toString();
      } catch (Exception ex ){
        putResponse(StatusCodes.INTERNAL_SERVER_ERROR,MediaType.TEXT_PLAIN, "error Cannot get Values", null);
      }
    }



    String locfile_name = SuaveTest.writeFile(colJsons);

    Random rand = new Random();
    String survey_url = "http://suave-dev.sdsc.edu/main/file=Yasha_Picasso_Paintings_clone_.csv";
    //String user = "Yasha";
    String views = "1110101";
    String view = "grid";
    String referer = survey_url.split("/main")[0] +"/";
    String upload_url = referer + "uploadCSV";
    String new_survey_url_base = "http://suave-dev.sdsc.edu/main/file=";
    String dzc_file = "https://maxim.ucsd.edu/dzgen/lib-staging-uploads/7a1385a0285c814637248104c649234d/content.dzc";
    String responseFromSuave = null;
    String s_url = null;

     CloseableHttpClient httpClient = HttpClients.createDefault();
     try {
       HttpPost httppost = new HttpPost(upload_url);
       // FileBody... but needs a file.
     // StringBody  cvsfile = new StringBody(locfile_name, ContentType.DEFAULT_TEXT);
       InputStream asFile = new ByteArrayInputStream(locfile_name.getBytes());
       InputStreamBody cvsFile = new InputStreamBody(asFile,"someFileCVS.csv");
      StringBody aname= new StringBody(survey_name, ContentType.DEFAULT_TEXT);
      StringBody dsc = new StringBody(dzc_file, ContentType.DEFAULT_TEXT);
      StringBody userparm = new StringBody(user, ContentType.DEFAULT_TEXT);

       HttpEntity reqEntity = MultipartEntityBuilder.create()
               .addPart("name", aname)
               .addPart("dzc",dsc)
               .addPart("user", userparm)
               .addPart("file", cvsFile)
               .build();


      httppost.setEntity(reqEntity);
      CloseableHttpResponse respo = httpClient.execute(httppost);


    int stcode = respo.getStatusLine().getStatusCode();

    if (stcode == 200) {
      s_url = new_survey_url_base + user + "_" + survey_name + ".csv" + "&views=" + views + "&view=" + view;
     // this.writeOk(response, s_url);
      putResponse(StatusCodes.OK,MediaType.APPLICATION_JSON,"{\"url\": \"" + s_url + "\"}", null);
    }

//    String respstr = resp.readToText();
       /* ES 2to5 */
       // if (resp.isFound()) {
//    if (resp.getResult().equals(Result.DELETED)) {
//      this.writeOk(response,resp.getId());
//    } else {
//      response.writeIdNotFound(this,json);
//    }
       String aaa = respo.toString();
       System.out.println();
     } catch (Exception ex){

     }
     finally {
       try {
         httpClient.close();
       } catch (Exception ex) {

       }
     }

  //  response.setStatus(Response.Status.OK);
 //   return response;
  }
  
  /**
   * Initialize.
   * @param collectionJson the item collectionJson
   */
  public void init(String collectionJson) {
    this.setJson(collectionJson);
  }
  /**
   * Put the response.
   * @param status the status
   * @param mediaType the media type
   * @param entity the response body
   */
  public void putResponse(int status, String mediaType, String entity, Map<String,String> headers) {
    //System.err.println(status);
    //System.err.println(entity);
    //System.err.println(entity.substring(0,1000));
    Response.Status rStatus = Response.Status.fromStatusCode(status);
    MediaType rMediaType = MediaType.valueOf(mediaType).withCharset("UTF-8");
    Response.ResponseBuilder r = Response.status(rStatus).entity(entity).type(rMediaType);
    if (headers != null) {
      for (Map.Entry<String,String> entry: headers.entrySet()) {
        r.header(entry.getKey(),entry.getValue());
      }
    }
    this.response = r.build();
    if (this.asyncResponse != null) {
      this.asyncResponse.resume(this.response);
    }
  }
//  /**
//   * Write the response.
//   * @param response the response
//   * @param url the item collectionJson
//   */
//  public void writeOk(AppResponse response, String url) {
//    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
//    jsonBuilder.add("url",url);
//    jsonBuilder.add("status","posted");
//    response.writeOkJson(this,jsonBuilder);
//  }
  
}
