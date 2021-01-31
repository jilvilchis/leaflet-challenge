// Store our API endpoint inside queryUrl

// Change accordingly to what is needed
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// All Earthquakes past day
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
// Significant Earthquakes past month
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data);
  createFeatures(data.features);
});

// Function to determine the right color gradient
function getColor(d) {
  return d > 5  ? '#800026' : //'#E31A1C'
         d > 4  ? '#FC4E2A' : 
         d > 3   ? '#FD8D3C' :
         d > 2   ? '#FEB24C' :
         d > 1   ? '#FED976' :
                   '#FFEDA0';
} //end function getColor

function createFeatures(earthquakeData) {

// The following lines are just trials and console.logs to get the right function to pass to pointToLayer
var coord = earthquakeData.map(d=> d.geometry.coordinates)
var magnit = earthquakeData.map(d=> +d.properties.mag)
var magnit4radius = magnit.map(d=> d * 100000)
var colorGradient = []
colorGradient.push(magnit.map(d=> getColor(d)));

console.log(coord)
console.log(magnit)
console.log(magnit4radius)
console.log(colorGradient)

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p> Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    
    onEachFeature: onEachFeature,
    // Altering simple Markers and converting them to Circle Markers using pointTo Layer
    pointToLayer: function(feature, latlng){
      return L.circle (latlng, {
        radius: +feature.properties.mag * 100000, //this is equivalente to magnit4radius, but we need to define it here
        fillColor: getColor(feature.properties.mag), //this is equivalente to colorGradient, but we need to define it here
        weight: .10,
        fillOpacity: 0.8,
        // opacity: 1,  //Does not change a lot if we ommit this 
       
    }); // end of L.circle
    } //end pointToLayer function

  });
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
} //end function createFeatures

function createMap(earthquakes) {

  // Define streetmap, darkmap and satellite layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var satellite_streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-streets-v11",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite-street": satellite_streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  
  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        // colors = ['#FFEDA0','#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C']
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
        
    grades.forEach(function(grade, i) {
      labels.push('<i style=\"background-color:' +getColor(grades[i] + 1) + '\"></i>' 
      + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
      )
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";

    return div;
};

  // Adding legend to the map
  legend.addTo(myMap);

} //  end function create maps