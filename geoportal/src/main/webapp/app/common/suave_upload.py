import helpers
import time
import pandas as pd
from IPython.display import Markdown, display
def printmd(string):
    display(Markdown(string))
full_notebook_url = "https://datahub.ucsd.edu/user/ivasilie/notebooks/jupyter-cinergi/CinergiDispatch.ipynb?collection=%7B%22id%22%3A%229eb81fc3-a54e-413f-a6ce-cb54d9485b62%22%2C%22collectionId%22%3A%22All%22%2C%22title%22%3A%22Show%20All%22%2C%22collectionlink%22%3A%22%22%2C%22packageType%22%3A%22standalone%22%2C%22briefrecords%22%3A%5B%7B%22identifier%22%3A%22e1c922b1dd514510a5c8affe63369194%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2Fe1c922b1dd514510a5c8affe63369194%2Fxml%22%2C%22title%22%3A%22H04900%3A%20NOS%20Hydrographic%20Survey%22%7D%2C%7B%22identifier%22%3A%22d1a7481108cb4a91b28a48bc5e578d87%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2Fd1a7481108cb4a91b28a48bc5e578d87%2Fxml%22%2C%22title%22%3A%22Chemistry%22%7D%2C%7B%22identifier%22%3A%2292901e5a15984b1ab58d4ce5df0b6cf0%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F92901e5a15984b1ab58d4ce5df0b6cf0%2Fxml%22%2C%22title%22%3A%22(Table%202)%20Mineralogy%20of%20the%20%3C2-%C2%B5m%20size%20fraction%20at%20DSDP%20Holes%2086-576%2C%2086-578%2C%20and%2086-581%22%7D%2C%7B%22identifier%22%3A%22d6edc2df81054e85a7cddd5f139493ae%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2Fd6edc2df81054e85a7cddd5f139493ae%2Fxml%22%2C%22title%22%3A%22An%20Investigation%20of%20the%20intensity%20if%20the%20geomagnetic%20field%20during%20Roman%20times%20using%20magnetically%20anisotropic%20bricks%20and%20titles.%22%7D%2C%7B%22identifier%22%3A%223cdb2feea88d471ba5403d455e7149da%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F3cdb2feea88d471ba5403d455e7149da%2Fxml%22%2C%22title%22%3A%22Still-image%20frame%20grabs%20and%20benthic%20habitat%20interpretation%20of%20underwater%20video%20footage%2C%20March%202014%2C%20Faga%60alu%20Bay%2C%20American%20Samoa%22%7D%2C%7B%22identifier%22%3A%22455a27692dc848c3aca725f0386f1377%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F455a27692dc848c3aca725f0386f1377%2Fxml%22%2C%22title%22%3A%22CBRW3%20--%20from%20National%20Data%20Buoy%20Center%20(NDBC)%22%7D%2C%7B%22identifier%22%3A%22052635cae4c24c82b61b970e6c8fa82b%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F052635cae4c24c82b61b970e6c8fa82b%2Fxml%22%2C%22title%22%3A%22Cruise%20EN521%20on%20RV%20Endeavor%22%7D%2C%7B%22identifier%22%3A%228317cf05d31a41cc8f9751989b2d1432%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F8317cf05d31a41cc8f9751989b2d1432%2Fxml%22%2C%22title%22%3A%22(Table%20II)%20Soil%20geochemistry%20of%20a%20chronosequence%20near%20Lake%20Wellman%22%7D%2C%7B%22identifier%22%3A%229008d57d3f6246e9afd4069663f1ee4b%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F9008d57d3f6246e9afd4069663f1ee4b%2Fxml%22%2C%22title%22%3A%22Moisture%20and%20density%20(MAD)%20measured%20on%20IODP%20Hole%20318-U1360A%22%7D%2C%7B%22identifier%22%3A%225dee4d2db5d7434ca5b3fad369035d26%22%2C%22recordlink%22%3A%22http%3A%2F%2Fdatadiscoverystudio.org%2Fgeoportal%2Frest%2Fmetadata%2Fitem%2F5dee4d2db5d7434ca5b3fad369035d26%2Fxml%22%2C%22title%22%3A%22Cruise%20HRS100603CS%20on%20RV%20Hugh%20R.%20Sharp%22%7D%5D%7D"
linkstr = helpers.getLinksFromURL(full_notebook_url)
print(linkstr)


metable = pd.DataFrame(helpers.getDataFromLinks(linkstr))
print(metable)


absolutePath = ""
new_file = absolutePath + 'temp.csv'
print("A new temporary file will be created at:")
print(new_file)
metable.to_csv(new_file, index=None)


survey_name = "temp" + str(int(time.time()) % 1000)
survey_url = "http://suave-dev.sdsc.edu/main/file=Yasha_Picasso_Paintings_clone_.csv"
user = "Yasha"
views = "1110101"
view = "grid"
referer = survey_url.split("/main")[0] +"/"
upload_url = referer + "uploadCSV"
new_survey_url_base = survey_url.split(user)[0]
dzc_file = "https://maxim.ucsd.edu/dzgen/lib-staging-uploads/7a1385a0285c814637248104c649234d/content.dzc"
print("Survey Name is:" + survey_name)

helpers.uploadToSuave(new_file, survey_name, user, views, view, referer, upload_url, new_survey_url_base, dzc_file)
