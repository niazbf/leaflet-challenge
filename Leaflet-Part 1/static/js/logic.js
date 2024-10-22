// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function to determine the marker size based on magnitude
  function markerSize(magnitude) {
    return magnitude * 4; // Adjust the multiplier for size scaling
  }

  // Define a function to determine the marker color based on depth
  function markerColor(depth) {
    if (depth <= 10) return "#98ee00"; // Light green
    else if (depth <= 30) return "#d4ee00"; // Yellow
    else if (depth <= 50) return "#eecc00"; // Orange
    else if (depth <= 70) return "#ee9c00"; // Dark orange
    else if (depth <= 90) return "#ea822c"; // Red-orange
    else return "#ea2c2c"; // Red
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      // Create a circle marker with size and color based on magnitude and depth
      let depth = feature.geometry.coordinates[2]; // Depth is the third coordinate
      let magnitude = feature.properties.mag; // Magnitude property

      return L.circleMarker(latlng, {
        radius: markerSize(magnitude),
        fillColor: markerColor(depth),
        color: "#000", // Border color
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
      // Bind the popup to the marker
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km<br>${new Date(feature.properties.time)}</p>`);
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend to the map
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');

    // Add a heading for the legend
    div.innerHTML = "<h4>Earthquake Depth (km)</h4>";

    // Depth categories for the legend
    const depthCategories = [
      { label: '0-10 km', color: '#98ee00' },
      { label: '10-30 km', color: '#d4ee00' },
      { label: '30-50 km', color: '#eecc00' },
      { label: '50-70 km', color: '#ee9c00' },
      { label: '70-90 km', color: '#ea822c' },
      { label: '90+ km', color: '#ea2c2c' }
    ];

    // Loop through depth categories and generate a label with a colored square for each category
    depthCategories.forEach(category => {
      div.innerHTML +=
        '<i style="background:' + category.color + '; width: 20px; height: 20px; display: inline-block; margin-right: 8px;"></i> ' +
        category.label + '<br>';
    });

    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);
}
