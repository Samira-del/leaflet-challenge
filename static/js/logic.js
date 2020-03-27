// Define variables for our tile layers
const grayscales = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

const outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

const satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Create two separate layer groups below. One for fault lines, and one for earthquake
let fault_lines = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

// Create a baseMaps object to contain the satellite and gray and outdoors
let baseLayers = {
    "Satellite": satellite,
    "Grayscales": grayscales,
    "Outdoors": outdoors    
}

// Create an overlayMaps object here to contain the "Fault lines" and "Earthquakes"
let overLayers = {
    "Fault lines": fault_lines,
    "Earthquakes": earthquakes
}

// Modify the map so that it will have the gray, dark, and outdoors layers
const myMap = L.map("map", {
    center: [36.778259, -110.417931],
    zoom: 5,
    layers: [grayscales, satellite, outdoors]
});

// Create a layer control, containing our baseMaps and overlayMaps, and add them to the map
L.control.layers(baseLayers, overLayers).addTo(myMap);

// Store earthquake geoJSON data.
const geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(geoData, function(data) {
    console.log("response data", data);

    L.geoJson(data, {

        pointToLayer: function(features, coordinates) {
            return L.circleMarker(coordinates);
        },

        style: function(features) {        
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColor(features.properties.mag),
                color: "#000000",
                radius: getRadius(features.properties.mag),
                stroke: true,
                weight: 0.5
            };
        },
        
        onEachFeature: function(features, layer) {
            layer.bindPopup("Magnitude: " + features.properties.mag + "<br>Location: " + features.properties.place);
        }
        
    }).addTo(earthquakes);
    
    earthquakes.addTo(myMap);

    // Define the color of the marker based on the magnitude of the earthquake.
    function getColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#ea2c2c";
        case magnitude > 4:
            return "#ea822c";
        case magnitude > 3:
            return "#ee9c00";
        case magnitude > 2:
            return "#eecc00";
        case magnitude > 1:
            return "#d4ee00";
        default:
            return "#98ee00";
        }
    }
    
    // define the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3;
    }

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let range = [0, 1, 2, 3, 4, 5];
        let colors = ['lightgreen', 'darkgreen', 'yellow', 'tan', 'darkorange', 'red'];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>";
        for (var i = 0; i < range.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i>' +
                range[i] + (range[i + 1] ? '&ndash;' + range[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    // retrive Tectonic Plate geoJSON data.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {

        L.geoJson(platedata, {
            color: "orange",
            weight: 2
        }).addTo(fault_lines);

        // add the tectonicplates layer to the map.
        fault_lines.addTo(myMap);
    });

});

