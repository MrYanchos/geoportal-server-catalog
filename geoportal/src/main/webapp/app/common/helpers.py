import pandas as pd
import numpy as np
import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.dates as mdates
import urllib.request, json
import requests
import re
from datetime import datetime, date, time
from IPython import get_ipython
from matplotlib import pylab
from pylab import *
from IPython.display import clear_output
from IPython.display import Markdown, display
def printmd(string):
    display(Markdown(string))

img_dict = {"Army Corps of Engineers USACE (U)": "USACE",
            "CINERGI Cyberinfrastructure Resources (P)": "CINERGI",
            "CINERGI Use Case Datasets (P)": "CINERGI",
            "CORIS (U)": "CORIS",
            "CRESCYNT (P)": "CRESCYNT",
            "CUAHSI WaterOneFlow (P)": "CUAHSI",
            "CUAHSI WaterOneFlow services (P)": "CUAHSI",
            "CUAHSI_HIS_Series (P)": "CUAHSI",
            "CZO Datasets (P)": "CZO",
            "Collaboration and Cyberinfrastructure for Paleogeosciences (P)": "geoscience",
            "DLESE (P)": "DLESE",
            "DLESE (U)": "DLESE",
            "Data.Gov (P)": "data_gov",
            "Data.Gov (U)": "data_gov",
            "Data.Gov CSW (U)": "data_gov",
            "DataOne ISO (U)": "dataone",
            "DataTurbine Streaming (P)": "dataturbine",
            "EarthCube Oceanography and Geobiology Environment Omics (P)": "ECOGEO",
            "EarthCube Use Cases (P)": "CINERGI",
            "EarthRef MagIC (P)": "magic",
            "Geoscience Australia (P)": "geoscience_australia",
            "Geoscience Australia (U)": "geoscience_australia",
            "IEDA Earthchem Library (P)": "IEDA",
            "IEDA MGDL (P)": "IEDA",
            "IOOS (P)": "IOOS",
            "IOOS (U)": "IOOS",
            "Individual Contribution": "individual",
            "Mercury OAI (U)": "mercury",
            "NCDC": "NCDC",
            "NCEI (P)": "NCEI",
            "NOAA (U)": "NOAA",
            "NOAA EDDAP (P)": "NOAA",
            "NOAA Models (P)": "NOAA",
            "NODC (P)": "NOAA",
            "NSIDC (U)": "NSIDC",
            "Nationa Data Buoy Center (P)": "NOAA",
            "National Snow and Ice Data Center (P)": "NSIDC",
            "OpenTopography (P)": "opentopography",
            "OpenTopography (U)": "opentopography",
            "PANGAEA (P)": "pangaea",
            "RE3 (P)": "RE3",
            "Rolling Deck Repository (P)": "rolling_deck",
            "ScienceBase (P)": "sciencebase",
            "ScienceBase (R)": "sciencebase",
            "ScienceBase Calcium (P)": "sciencebase",
            "ScienceBase Calcium (U)": "sciencebase",
            "ScienceBase Coral (U)": "sciencebase",
            "ScienceBase Data Basin (P)": "sciencebase",
            "ScienceBase Data Basin (U)": "sciencebase",
            "ScienceBase Sediment (P)": "sciencebase",
            "ScienceBase Sediment (U)": "sciencebase",
            "ScienceBase Coral (P)": "sciencebase",
            "Sciencebase National Digital Catalog (U)": "sciencebase",
            "Sciencebase National Geospatial Program (U)": "sciencebase",
            "Sciencebase National Water Quality Assesment [NWQA] (U)": "sciencebase",
            "Sediment Experimentalist Network (P)": "SEN",
            "State of California Geoportal (P)": "california",
            "State_of_California_Geoportal (U)": "california",
            "TESS Models (P)": "TESS",
            "Test GPT (P)": "GPT",
            "UNAVCO GNSS (P)": "UNAVCO",
            "UNCAVCO GNSS (P)": "UNAVCO",
            "US GIN (P)": "GIN",
            "USGS_DataRelease (P)": "USGS",
            "Wyoming Geolibrary (P)": "wyoming",
            "Wyoming Geolibrary (U)": "wyoming",
            "cn.dataone.org (P)": "dataone",
            "cn.dataone.org (U)": "dataone",
            "example_tests": "individual"
           }

def getLinksFromURL(URL):
    if URL.find("collectionlink") != -1:
        linkstr = URL[URL.find("collectionlink")+14:]
    
    linkstr = linkstr.split("%22identifier%22")
    for i in range(1, len(linkstr)):
        ind = linkstr[i].find("%22")
        linkstr[i] = linkstr[i][ind+3:linkstr[i].find("%22", ind+3)]
        #print(linkstr[i])
    return linkstr[1:]


def getDataFromLinks(links):
    tabdict = {}
    tabdict["title"] = []
    tabdict["id"] = []
    tabdict["abstract#long"] = []
    tabdict["source"] = []
    tabdict["latitude#number"] = []
    tabdict["longitude#number"] = []
    tabdict["keywords#multi"] = []
    #tabdict["digitaltransferoption_name#multi#hidden"] = []
    tabdict["formatname"] = []
    tabdict["topiccategory#multi"] = []
    tabdict["publicationdate#date"] = []
    tabdict["links#multi"] = []
    tabdict["#img"] = []
    #dist_link_nst -> function_s / protocol_s
    for i in links:
        curdata = i
        csv_url = "http://datadiscoverystudio.org/geoportal/rest/metadata/item/" + curdata + "?pretty=true"
        jsondata = requests.get(csv_url)
        jsondict = jsondata.json()
        md = jsondict["_source"]
    #    print(md.keys())
        tabdict["title"].append(md["title"])
        tabdict["id"].append(jsondict["_id"])
        
        if "description" in list(md.keys()):
            tabdict["abstract#long"].append(md["description"])
        else:
            tabdict["abstract#long"].append(np.nan)
            
        if "src_source_name_s" in list(md.keys()):
            tabdict["source"].append(md["src_source_name_s"])
        else:
            tabdict["source"].append(np.nan)
            
        if "envelope_geo" in list(md.keys()):
            if type(md["envelope_geo"]) == dict:
                tabdict["latitude#number"].append(str(md["envelope_geo"]["coordinates"][0][1]))
                tabdict["longitude#number"].append(str(md["envelope_geo"]["coordinates"][0][0]))
            else:
                tabdict["latitude#number"].append(str(md["envelope_geo"][0]["coordinates"][0][1]))
                tabdict["longitude#number"].append(str(md["envelope_geo"][0]["coordinates"][0][0]))
        else:
            tabdict["latitude#number"].append(np.nan)
            tabdict["longitude#number"].append(np.nan)
            print(md["title"])
            
        if "keywords_s" in list(md.keys()):
            tabdict["keywords#multi"].append(md["keywords_s"])
        else:
            tabdict["keywords#multi"].append(np.nan)
            
        if "services_nst" in list(md.keys()):
            if type(md["services_nst"]) == list:
                #tabdict["digitaltransferoption_name#multi#hidden"].append(list(set([i["url_type_s"] for i in md["services_nst"]])))
                tabdict["links#multi"].append(list(set([i["url_s"] for i in md["services_nst"]])))
                tabdict["formatname"].append(md["services_nst"][0]["url_name_s"])
            else:
                tabdict["links#multi"].append([md["services_nst"]["url_s"]])
                tabdict["formatname"].append(md["services_nst"]["url_name_s"])
        elif "dist_link_nst" in list(md.keys()):
            if type(md["dist_link_nst"]) == list:
                #tabdict["digitaltransferoption_name#multi#hidden"].append(list(set([i["url_type_s"] for i in md["services_nst"]])))
                tabdict["links#multi"].append(list(set([i["url_s"] for i in md["dist_link_nst"]])))
                tabdict["formatname"].append(md["dist_link_nst"][0]["url_name_s"])
            else:
                tabdict["links#multi"].append([md["dist_link_nst"]["url_s"]])
                tabdict["formatname"].append(md["dist_link_nst"]["url_name_s"])
        else:
            tabdict["links#multi"].append(np.nan)
            tabdict["formatname"].append(np.nan)
            
        if "apiso_TopicCategory_s" in list(md.keys()):
            tabdict["topiccategory#multi"].append(md["apiso_TopicCategory_s"])
        else:
            tabdict["topiccategory#multi"].append(np.nan)
            
        if "apiso_PublicationDate_dt" in list(md.keys()):
            tabdict["publicationdate#date"].append(md["apiso_PublicationDate_dt"])
        else:
            tabdict["publicationdate#date"].append(np.nan)
        
        tabdict["#img"].append(img_dict[md["src_source_name_s"]])
        
    return tabdict


def uploadToSuave(new_file, survey_name, user, views, view, referer, upload_url, new_survey_url_base, dzc_file):
    csv = {"file": open(new_file, "rb")}
    upload_data = {
        'name': survey_name,
        'dzc': dzc_file,
        'user':user
    }
    headers = {
        'User-Agent': 'suave user agent',
        'referer': referer
    }
    
    r = requests.post(upload_url, files=csv, data=upload_data, headers=headers)
    
    if r.status_code == 200 :
        print("New survey created successfully")
        regex = re.compile('[^0-9a-zA-Z_]')
        s_url = survey_name
        s_url =  regex.sub('_', s_url)
    
        url = new_survey_url_base + user + "_" + survey_name + ".csv" + "&views=" + views + "&view=" + view
        print(url)
        printmd("Click the URL to open the new survey")
    else:
        printmd("Error creating new survey. Check if a survey with this name already exists.")
        printmd("Reason: " + str(r.status_code) + " " + r.reason)
