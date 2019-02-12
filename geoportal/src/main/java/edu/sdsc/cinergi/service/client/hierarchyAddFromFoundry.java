package edu.sdsc.cinergi.service.client;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import java.io.InputStream;
import java.net.URL;
import java.util.concurrent.BlockingQueue;

/* idea is that this would be a producer/consumer class
that will let the indexing run faster.
 */
public class hierarchyAddFromFoundry {
    private static BlockingQueue<String> queue;

    public static JsonObject addHierarchyToItem(String id, String fid,
                                                String collection)
            throws RuntimeException {
        String url = "";
        try {
            URL urlObj = new URL(url);
            try (InputStream is = urlObj.openStream();
                 JsonReader rdr = Json.createReader(is)) {

                JsonObject obj = rdr.readObject();

                return obj;
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
