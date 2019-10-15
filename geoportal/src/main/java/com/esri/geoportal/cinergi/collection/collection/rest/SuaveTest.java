package com.esri.geoportal.cinergi.collection.collection.rest;

import java.io.File;
import java.io.StringWriter;
import java.util.Set;
import java.io.FileWriter;
import com.opencsv.CSVWriter;
import org.json.JSONObject;
import org.json.JSONArray;

public class SuaveTest {

    String survey_name = "tempa";
    String survey_url = "http://suave-dev.sdsc.edu/main/file=Yasha_Picasso_Paintings_clone_.csv";
    String user = "Yasha";
    String views = "1110101";
    String view = "grid";
    String referer = survey_url.split("/main")[0] +"/";
    String upload_url = referer + "uploadCSV";
    String new_survey_url_base = survey_url.split(user)[0];
    String dzc_file = "https://maxim.ucsd.edu/dzgen/lib-staging-uploads/7a1385a0285c814637248104c649234d/content.dzc";

    public static String[] getJsonIds(String collectionJson){
        try {
            JSONArray colj = new JSONObject(collectionJson).getJSONArray("briefrecords");
            String[] jsonIds = new String[colj.length()];
            for (int i = 0; i < colj.length(); i++) {
                jsonIds[i] = colj.getJSONObject(i).getString("identifier");
            }
            return jsonIds;
        }
        catch(Exception e) {
            System.out.println(e);
            return null;
        }
    }

    public static String writeFile(String[] jsons) {
        try {
            String imgdictstr = "{\"Army Corps of Engineers USACE (U)\": \"USACE\", \"CINERGI Cyberinfrastructure " +
                    "Resources (P)\": \"CINERGI\", \"CINERGI Use Case Datasets (P)\": \"CINERGI\", \"CORIS (U)\": " +
                    "\"CORIS\", \"CRESCYNT (P)\": \"CRESCYNT\", \"CUAHSI WaterOneFlow (P)\": \"CUAHSI\", " +
                    "\"CUAHSI WaterOneFlow services (P)\": \"CUAHSI\", \"CUAHSI_HIS_Series (P)\": \"CUAHSI\", " +
                    "\"CZO Datasets (P)\": \"CZO\", \"Collaboration and Cyberinfrastructure for Paleogeosciences " +
                    "(P)\": \"geoscience\", \"DLESE (P)\": \"DLESE\", \"DLESE (U)\": \"DLESE\", \"Data.Gov (P)\": " +
                    "\"data_gov\", \"Data.Gov (U)\": \"data_gov\", \"Data.Gov CSW (U)\": \"data_gov\", \"DataOne ISO " +
                    "(U)\": \"dataone\", \"DataTurbine Streaming (P)\": \"dataturbine\", \"EarthCube Oceanography " +
                    "and Geobiology Environment Omics (P)\": \"ECOGEO\", \"EarthCube Use Cases (P)\": \"CINERGI\", " +
                    "\"EarthRef MagIC (P)\": \"magic\", \"Geoscience Australia (P)\": \"geoscience_australia\", " +
                    "\"Geoscience Australia (U)\": \"geoscience_australia\", \"IEDA Earthchem Library (P)\": " +
                    "\"IEDA\", \"IEDA MGDL (P)\": \"IEDA\", \"IOOS (P)\": \"IOOS\", \"IOOS (U)\": \"IOOS\", " +
                    "\"Individual Contribution\": \"individual\", \"Mercury OAI (U)\": \"mercury\", \"NCDC\": " +
                    "\"NCDC\", \"NCEI (P)\": \"NCEI\", \"NOAA (U)\": \"NOAA\", \"NOAA EDDAP (P)\": \"NOAA\", " +
                    "\"NOAA Models (P)\": \"NOAA\", \"NODC (P)\": \"NOAA\", \"NSIDC (U)\": \"NSIDC\", \"Nationa " +
                    "Data Buoy Center (P)\": \"NOAA\", \"National Snow and Ice Data Center (P)\": \"NSIDC\", " +
                    "\"OpenTopography (P)\": \"opentopography\", \"OpenTopography (U)\": \"opentopography\", " +
                    "\"PANGAEA (P)\": \"pangaea\", \"RE3 (P)\": \"RE3\", \"Rolling Deck Repository (P)\": " +
                    "\"rolling_deck\", \"ScienceBase (P)\": \"sciencebase\", \"ScienceBase (R)\": \"sciencebase\", " +
                    "\"ScienceBase Calcium (P)\": \"sciencebase\", \"ScienceBase Calcium (U)\": \"sciencebase\", " +
                    "\"ScienceBase Coral (U)\": \"sciencebase\", \"ScienceBase Data Basin (P)\": \"sciencebase\", " +
                    "\"ScienceBase Data Basin (U)\": \"sciencebase\", \"ScienceBase Sediment (P)\": \"sciencebase\", " +
                    "\"ScienceBase Sediment (U)\": \"sciencebase\", \"ScienceBase Coral (P)\": \"sciencebase\", " +
                    "\"Sciencebase National Digital Catalog (U)\": \"sciencebase\", \"Sciencebase National " +
                    "Geospatial Program (U)\": \"sciencebase\", \"Sciencebase National Water Quality Assesment " +
                    "[NWQA] (U)\": \"sciencebase\", \"Sediment Experimentalist Network (P)\": \"SEN\", " +
                    "\"State of California Geoportal (P)\": \"california\", \"State_of_California_Geoportal (U)\": " +
                    "\"california\", \"TESS Models (P)\": \"TESS\", \"Test GPT (P)\": \"GPT\", \"UNAVCO GNSS (P)\": " +
                    "\"UNAVCO\", \"UNCAVCO GNSS (P)\": \"UNAVCO\", \"US GIN (P)\":" +
                    " \"GIN\", \"USGS_DataRelease (P)\": " +
                    "\"USGS\", \"Wyoming Geolibrary (P)\": \"wyoming\", \"Wyoming Geolibrary (U)\": \"wyoming\", " +
                    "\"cn.dataone.org (P)\": \"dataone\", \"cn.dataone.org (U)\": \"dataone\", \"example_tests\": " +
                    "\"individual\", \"BCO DMO (P)\": \"individual\"}";


            JSONObject img_dict = new JSONObject(imgdictstr);

            JSONObject[] jarr = new JSONObject[jsons.length];
            for (int i = 0; i < jsons.length; i++) {
                jarr[i] = new JSONObject(jsons[i]);
            }

            StringWriter sw = new StringWriter();
            CSVWriter csvw = new CSVWriter(sw);
            String[] header = {"title", "id", "abstract#long", "source", "latitude#number", "longitude#number",
            "keywords#multi", "links#multi", "formatname", "topiccategory#multi", "publicationdate#date", "#img"};
            csvw.writeNext(header);

            String[][] alld = new String[jarr.length][12];

            JSONObject tempobj;
            JSONArray temparr;
            String multi;
            for (int i = 0; i < jarr.length; i++) {
                JSONObject md = (JSONObject)jarr[i].get("_source");

                alld[i][0] = (String)md.get("title");
                alld[i][1] = (String)jarr[i].get("_id");

                if (md.has("description")){ alld[i][2] = (String)md.get("description"); }

                if (md.has("src_source_name_s")) { alld[i][3] = (String)md.get("src_source_name_s"); }

                if (md.has("envelope_geo")){
                   if (md.get("envelope_geo") instanceof JSONArray){
                       tempobj = (JSONObject)((JSONArray)md.get("envelope_geo")).get(0);
                   } else {
                       tempobj = (JSONObject)md.get("envelope_geo");
                   }

                   temparr = (JSONArray)tempobj.get("coordinates");

                   if (temparr.get(0) instanceof JSONArray) {
                       temparr = (JSONArray)temparr.get(0);
                   }

                    alld[i][4] = temparr.get(1).toString();
                    alld[i][5] = temparr.get(0).toString();
                }

                if (md.has("keywords_s")) {
                    if (md.get("keywords_s") instanceof JSONArray) {
                        temparr = (JSONArray)md.get("keywords_s");
                        multi = (String)temparr.get(0);
                        for (int j = 1; j < temparr.length(); j++) {
                            multi = multi + ", " + (String)temparr.get(j);
                        }
                    } else {
                        multi = (String)md.get("keywords_s");
                    }
                    alld[i][6] = (multi);
                }

                if (md.has("services_nst")) {
                    if (md.get("services_nst") instanceof JSONArray) {
                        temparr = (JSONArray)md.get("services_nst");
                        multi = (String)((JSONObject)temparr.get(0)).get("url_s");
                        for (int j = 1; j < temparr.length(); j++) {
                            multi = multi + ", " + (String)((JSONObject)temparr.get(j)).get("url_s");
                        }
                        alld[i][7] = multi;
                        alld[i][8] = (String)((JSONObject)temparr.get(0)).get("url_name_s");
                    } else {
                        tempobj = (JSONObject)md.get("services_nst");
                        alld[i][7] = (String)tempobj.get("url_s");
                        alld[i][8] = (String)tempobj.get("url_name_s");
                    }
                } else if (md.has("dist_link_nst")) {
                    if (md.get("dist_link_nst") instanceof JSONArray) {
                        temparr = (JSONArray)md.get("dist_link_nst");
                        multi = (String)((JSONObject)temparr.get(0)).get("url_s");
                        for (int j = 1; j < temparr.length(); j++) {
                            multi = multi + ", " + (String)((JSONObject)temparr.get(j)).get("url_s");
                        }
                        alld[i][7] = multi;
                        alld[i][8] = (String)((JSONObject)temparr.get(0)).get("url_name_s");
                    } else {
                        tempobj = (JSONObject)md.get("dist_link_nst");
                        alld[i][7] = (String)tempobj.get("url_s");
                        alld[i][8] = (String)tempobj.get("url_name_s");
                    }
                }

                if (md.has("apiso_TopicCategory_s")) {

                    if (md.get("apiso_TopicCategory_s") instanceof JSONArray) {
                        temparr = (JSONArray)md.get("apiso_TopicCategory_s");
                        multi = (String)temparr.get(0);
                        for (int j = 1; j < temparr.length(); j++) {
                           multi = multi + ", " + (String)temparr.get(j);
                        }
                    } else {
                        multi = (String)md.get("apiso_TopicCategory_s");
                    }
                    alld[i][9] = multi;
                }

                if (md.has("apiso_PublicationDate_dt")) {
                    alld[i][10] = (String)md.get("apiso_PublicationDate_dt");
                }

                if (img_dict.has(alld[i][3])) {
                    alld[i][11] = (String)img_dict.get(alld[i][3]);
                } else {
                    alld[i][11] = "individual";
                }
            }

            String[] dataa;

            for (int i = 0; i < jarr.length; i++) {
                dataa = alld[i];
                csvw.writeNext(dataa);
            }

            // closing writer connection
            String jsonString = sw.toString();
            csvw.close();

            return jsonString;
        } catch(Exception e){
            System.out.println(e);
          //  throw new Exception("Error converting to string in csw writer");
            return null;
        }

    }
}
