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
import sun.nio.ch.IOUtil;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Delete an item.
 */
public class publishToSuaveRequest extends AppRequest {

  /** Instance variables. */
  private String collectionJson;

  /** Constructor. */
  public publishToSuaveRequest() {
    super();
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
  
  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();

    String[] colIds = SuaveTest.getJsonIds(getJson());
    if (colIds == null || colIds.length == 0) {
      response.writeIdIsMissing(this);
      return response;
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
      colJsons[i] = itemUtil.readItemJson(ec.getItemIndexName(), ec.getItemIndexType(), colIds[i]).toString();
    }



    String locfile_name = SuaveTest.writeFile(colJsons);

    Random rand = new Random();
    String survey_name = "javatt" + rand.nextInt(1000);
    String survey_url = "http://suave-dev.sdsc.edu/main/file=Yasha_Picasso_Paintings_clone_.csv";
    String user = "Yasha";
    String views = "1110101";
    String view = "grid";
    String referer = survey_url.split("/main")[0] +"/";
    String upload_url = referer + "uploadCSV";
    String new_survey_url_base = survey_url.split(user)[0];
    String dzc_file = "https://maxim.ucsd.edu/dzgen/lib-staging-uploads/7a1385a0285c814637248104c649234d/content.dzc";
    String responseFromSuave = null;

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
      String s_url = new_survey_url_base + user + "_" + survey_name + ".csv" + "&views=" + views + "&view=" + view;
      writeOk(response, s_url);
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
     }
     finally {
      httpClient.close();
     }

    response.setStatus(Response.Status.OK);
    return response;
  }
  
  /**
   * Initialize.
   * @param collectionJson the item collectionJson
   */
  public void init(String collectionJson) {
    this.setJson(collectionJson);
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param url the item collectionJson
   */
  public void writeOk(AppResponse response, String url) {
    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    jsonBuilder.add("url",url);
    jsonBuilder.add("status","posted");
    response.writeOkJson(this,jsonBuilder);
  }
  
}
