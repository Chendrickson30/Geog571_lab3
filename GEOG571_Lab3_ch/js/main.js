//Goal = create proportional symbol map using iNat observations of toads 
// Map 1
// Map 1
var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

fetch('data/naSpadefoot_count.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var radius = Math.sqrt(feature.properties.spadefoot_count) * 2;
                var customIcon = L.icon({
                    iconUrl: 'https://herpsofarkansas.com/wp/wp-content/uploads/scaphiopus-holbrookii-id.png',
                    iconSize: [radius, radius],
                    iconAnchor: [radius / 2, radius / 2]
                });
                return L.marker(latlng, {
                    icon: customIcon
                }).bindPopup('<b>' + feature.properties.state + '</b><br>' + 'Spadefoot Count: ' + feature.properties.spadefoot_count);
            }
        }).addTo(map);

        // Proportional symbol legend
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [0, 10, 50, 100, 500, 1000]; // Define your grades

            // loop through our density intervals and generate a label with an icon for each interval
            for (var i = 0; i < grades.length; i++) {
                var radius = Math.sqrt(grades[i]) * 2;
                div.innerHTML +=
                    '<img src="https://herpsofarkansas.com/wp/wp-content/uploads/scaphiopus-holbrookii-id.png" style="width:' + radius + 'px;height:' + radius + 'px;"> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);

    })
    .catch(error => console.error('Error loading GeoJSON file:', error));

// Map 2
var map2 = L.map('map2').setView([37.8, -96], 4);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map2);

fetch('data/usSpadefoot.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map2);
    });
// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>US Spadefoot Toad Observations</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.count + '  iNaturalist Observations'
        : 'Hover over a state');
};

info.addTo(map2);

function getColor(d) {
    return d > 1000 ? '#0c2c84' :
           d > 500  ? '#225ea8' :
           d > 100  ? '#1d91c0' :
           d > 50  ? '#41b6c4':
           d > 10   ? '#7fcdbb' :
           d > 5   ? '#c7e9b4' :
           d >= 0   ? '#969696' : '#FFEDA0';
}


function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.count)
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function zoomToFeature(e) {
    map2.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#fc4e2a',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(layer.feature.properties.count)
    });
    info.update();
    
}

map.attributionControl.addAttribution('Count data &copy; <a href="https://www.inaturalist.org//">iNaturalist</a>');

const legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map2) {

		const div = L.DomUtil.create('div', 'info legend');
		const grades = [0, 5, 10, 50, 100, 200, 500, 1000];
		const labels = [];
		let from, to;

		for (let i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map2);


// control that shows state info on hover
// const info = L.control();

// info.onAdd = function (map2) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };

// //pros = pulling attributes from geojson file
// info.update = function (props) {
//     const contents = props ? `<b>${props.name}</b><br />${props.density} people / mi<sup>2</sup>` : 'Hover over a state';
//     this._div.innerHTML = `<h4>US Population Density</h4>${contents}`;
// };

// info.addTo(map2);


// // get color depending on population density value
// function getColor(d) {
//     return d > 1000 ? '#800026' :
//         d > 500  ? '#BD0026' :
//         d > 200  ? '#E31A1C' :
//         d > 100  ? '#FC4E2A' :
//         d > 50   ? '#FD8D3C' :
//         d > 20   ? '#FEB24C' :
//         d > 10   ? '#FED976' : '#FFEDA0';
// }

// function style(feature) {
//     return {
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7,
//         fillColor: getColor(feature.properties.density)
//     };
// }

// function highlightFeature(e) {
//     const layer = e.target;

//     layer.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     layer.bringToFront();

//     info.update(layer.feature.properties);
// }

// /* global statesData */
// const geojson = L.geoJson(statesData, {
//     style,
//     onEachFeature
// }).addTo(map2);

// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
//     info.update();
// }

// function zoomToFeature(e) {
//     map2.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature
//     });
// }

// map2.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


// const legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map2) {

//     const div = L.DomUtil.create('div', 'info legend');
//     const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
//     const labels = [];
//     let from, to;

//     for (let i = 0; i < grades.length; i++) {
//         from = grades[i];
//         to = grades[i + 1];

//         labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
//     }

//     div.innerHTML = labels.join('<br>');
//     return div;
// };

// legend.addTo(map2);

