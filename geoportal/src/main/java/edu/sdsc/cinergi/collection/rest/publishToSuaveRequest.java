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
package edu.sdsc.cinergi.collection.rest;

import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.util.ItemUtil;
import com.esri.geoportal.lib.elastic.util.AccessUtil;

import com.esri.geoportal.lib.elastic.util.ItemIO;
import org.elasticsearch.action.DocWriteResponse.Result;
import org.elasticsearch.action.delete.DeleteResponse;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import net.dongliu.requests;

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

    String[] colIds = getJson().split(",");
    if (colIds == null || colIds.length == 0) {
      response.writeIdIsMissing(this);
      return response;
    }
    AccessUtil au = new AccessUtil();

    String[] colJsons = new String[colIds.length];
    String id;
    ItemUtil itemUtil;
    for(int i = 0; i < colIds.length; i++) {

      au.ensureWriteAccess(getUser(), colIds[i]);

      ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
      itemUtil = new ItemUtil();
      // foreach itemid
      colJsons[i] = itemUtil.readItemJson(ec.getItemIndexName(), ec.getItemIndexType(), colIds[i]).toString();
    }



    String survey_name = SuaveTest.writeFile(colJsons);
    String survey_url = "http://suave-dev.sdsc.edu/main/file=Yasha_Picasso_Paintings_clone_.csv";
    String user = "Yasha";
    String views = "1110101";
    String view = "grid";
    String referer = survey_url.split("/main")[0] +"/";
    String upload_url = referer + "uploadCSV";
    String new_survey_url_base = survey_url.split(user)[0];
    String dzc_file = "https://maxim.ucsd.edu/dzgen/lib-staging-uploads/7a1385a0285c814637248104c649234d/content.dzc";

    Map<String, Object> headers = new HashMap<>();

    String resp = Requests.post(url).multiPartBody(Part.file("file1", new File(survey_name)),
            Part.text("input", "on")).send().readToText();

    /* ES 2to5 */
    // if (resp.isFound()) {
//    if (resp.getResult().equals(Result.DELETED)) {
//      this.writeOk(response,resp.getId());
//    } else {
//      response.writeIdNotFound(this,json);
//    }
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
