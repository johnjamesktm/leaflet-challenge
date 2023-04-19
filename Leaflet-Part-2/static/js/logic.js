let earthquake_data_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let depth_colors = [
    {
        category: "-10 - 10",
        color: "#a3f600"
    },
    {
        category: "10 - 30",
        color: "#dcf400"
    },
    {
        category: "30 - 50",
        color: "#f7db11"
    },
    {
        category: "50 - 70",
        color: "#fdb72a"
    },
    {
        category: "70 - 90",
        color: "#fca35d"
    },
    {
        category: "90+",
        color: "#ff5f65"
    }
];

d3.json(earthquake_data_url).then((data) => {
    initMap(data);
});

function initMap(earthQuakeData) {
    // Create the tile layer that will be the background of our map.
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });


    function styler(feature) {
        var depth = feature.geometry.coordinates[2];
        var idx = depth_colors.length - 1;
        if (depth <= 10) {
            idx = 0;
        } else if (depth <= 30) {
            idx = 1;
        } else if (depth <= 50) {
            idx = 2;
        } else if (depth <= 70) {
            idx = 3;
        } else if (depth <= 90) {
            idx = 4;
        }
        return {color: depth_colors[idx].color};
    }

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`
            <h3>${feature.properties.place}</h3>
            <hr>
            <p>${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag.toFixed(2)} ${feature.properties.magType}</p>
            <p>Depth: ${feature.geometry.coordinates[2].toFixed(2)} Kms</p>
        `);
    }

    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: Math.round(feature.properties.mag) * 4,
        });
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthQuakeData, {
        style: styler,
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    var tectonic = L.geoJSON(tectonicPlatesData)

    // Create the map object with options.
    var map = L.map("map", {
        center: [40, -100],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    var baseMaps = {
        Street: streetmap,
        Topography: topomap
    };

    var overlayMaps = {
        "Tectonic Plates": tectonic,
        "Earthquakes": earthquakes
    };      
    
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var labels = [];

        depth_colors.forEach(function(legend, index) {
            labels.push(`
            <li>
                <div class="legend-box" style="background-color: ${depth_colors[index].color}"></div>
                <div class="legend-info">${depth_colors[index].category}</div>
            </li>`);
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    legend.addTo(map);
}
