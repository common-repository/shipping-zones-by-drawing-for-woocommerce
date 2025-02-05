var polygon;
var geocode;
var geo_coordinates;
var map;
var autocomplete;

function init_map() {
	var mapOptions = {
		center: new google.maps.LatLng(szbd_map.lat, szbd_map.lng),
		zoom: Number(szbd_map.zoom),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("szbdzones_id"), mapOptions);
}

function add_zoom_listener() {
	google.maps.event.addListener(map, 'zoom_changed', function(e) {
		jQuery("input#szbdzones_zoom").val(map.getZoom());
	});
}

function initialize(callback_1, callback_2) {
	callback_1();
	callback_2();
	var path = [];
	var center = map.getCenter();
	var cLat = center.lat();
	var cLng = center.lng();
	for (i = 0; i < (szbd_map.array_latlng).length; i++) {
		path.push(new google.maps.LatLng(szbd_map.array_latlng[i][0], szbd_map.array_latlng[i][1]));
	}
	geo_coordinates = path;
	jQuery("input#szbdzones_geo_coordinates").val(geo_coordinates.toString());
	jQuery("input#szbdzones_lat").val(center.lat());
	jQuery("input#szbdzones_lng").val(center.lng());
	jQuery("input#szbdzones_zoom").val(map.getZoom());
	set_polygon_on_map();
	google.maps.event.addListener(map, 'click', function(e) {
		addCoord(e.latLng);
		jQuery("input#szbdzones_geo_coordinates").val(geo_coordinates.toString());
	});
	google.maps.event.addListener(map, 'center_changed', function(e) {
		center = map.getCenter();
		jQuery("input#szbdzones_lat").val(center.lat());
		jQuery("input#szbdzones_lng").val(center.lng());
	});
}

function reset_geo_coordinates(cLat, cLng) {
	polygon.setMap(null);
	geo_coordinates = null;
}

function set_polygon_on_map() {
	var center = map.getCenter();
	var cLat = center.lat();
	var cLng = center.lng();
	polygon = new google.maps.Polygon({
		paths: geo_coordinates,
		strokeColor: '#0c6e9e',
		strokeOpacity: 0.8,
		strokeWeight: 3,
		fillColor: '#97e1ff',
		fillOpacity: 0.55
	});
	polygon.setMap(map);
	MarkersAdd();
}
var currentMarker;
var markers = [];

function MarkerDelete() {
	for (i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

function MarkersAdd() {
	for (var i = 0; i < geo_coordinates.length; i++) {
		MarkerAddNew(geo_coordinates[i]);
	}
}

function MarkerAddNew(myLatLng) {
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		draggable: true
	});
	markers.push(marker);
	google.maps.event.addListener(marker, 'dragstart', function() {
		currentMarker = marker.getPosition();
	});
	google.maps.event.addListener(marker, 'dragend', function() {
		for (i = 0; i < geo_coordinates.length; i++) {
			if (geo_coordinates[i] == currentMarker) {
				geo_coordinates[i] = marker.getPosition();
			}
		}
		polygon.setPaths(geo_coordinates);
		jQuery("input#szbdzones_geo_coordinates").val(geo_coordinates.toString());
	});
	google.maps.event.addListener(marker, 'click', function() {
		currentMarker = marker.getPosition();
		for (i = 0; i < geo_coordinates.length; i++) {
			if (geo_coordinates[i] == currentMarker) {
				geo_coordinates.splice(i, 1);
			}
		}
		marker.setMap(null);
		polygon.setPaths(geo_coordinates);
		jQuery("input#szbdzones_geo_coordinates").val(geo_coordinates.toString());
	});
}

function addCoord(point) {
	/*if (geo_coordinates.length > Math.PI) {
		alert(szbd_map.message);
		return;
	}*/
	var d1, d2, d, dx, dy;
	var insertAt1, insertAt2;
	for (var i = 0; i < geo_coordinates.length; i++) {
		dx = geo_coordinates[i].lng() - point.lng();
		dy = geo_coordinates[i].lat() - point.lat();
		d = (dx * dx) + (dy * dy);
		d = Math.sqrt(d);
		if (i > 0) {
			if (d < d1) {
				d2 = d1;
				d1 = d;
				insertAt2 = insertAt1;
				insertAt1 = i;
			} else if (d < d2) {
				d2 = d;
				insertAt2 = i;
			}
		} else {
			d1 = d;
		}
	}
	if (insertAt2 < insertAt1)
		insertAt1 = insertAt2;
	geo_coordinates.splice(insertAt1 + 1, 0, point);
	polygon.setPaths(geo_coordinates);
	MarkerDelete();
	MarkersAdd();
}
var hits = [];
var lastBetween;
var sHtml = "";

function isItInside(position) {
	sHtml = "";
	var geopoints = geo_coordinates;
	var Lx = position.lng();
	var Ly = position.lat();
	for (var i = 0; i < geopoints.length; i++) {
		var p1 = i;
		var p2 = i + 1;
		if (p2 == geopoints.length)
			p2 = 0;
		bIntersected(geopoints[p1].lng(), geopoints[p1].lat(), geopoints[p2].lng(), geopoints[p2].lat(), Lx, Ly, Lx + 1, Ly + 0.001);
	}
	var iLeft = 0;
	var iRight = 0;
	for (i = 0; i < hits.length; i++) {
		if (hits[i] <= Lx)
			iLeft++;
		else
			iRight++;
	}
	for (i = 0; i <= hits.length + 5; i++) {
		hits.pop();
	}
	sHtml += ("iLeft = " + iLeft + ", iRight = " + iRight + "<br>");
	sHtml += ("mod iLeft = " + iLeft % 2 + ", mod iRight = " + iRight % 2 + "<br>");
	if (iLeft % 2 == 1 && iRight % 2 == 1)
		return true;
	else
		return false;
}

function bIntersected(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
	var ma = (y1a - y2a) / (x1a - x2a);
	var ba = y1a - (ma * x1a);
	var mb = (y1b - y2b) / (x1b - x2b);
	var bb = y1b - (mb * x1b);
	var xi = (bb - ba) / (ma - mb);
	var yi = (ma * xi) + ba;
	var iBetween = (x1a - xi) * (xi - x2a);
	if (iBetween >= 0 && lastBetween != 0) {
		hits.push(xi);
	}
	lastBetween = iBetween;
}
jQuery(document).ready(function() {
	initialize(init_map, add_zoom_listener);
	geocode = new google.maps.Geocoder();
	grabAddress();

	function grabAddress() {
		var input = document.getElementById('szbdzones_address');
		var searchBox = new google.maps.places.SearchBox(input);
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		map.addListener('bounds_changed', function() {
			searchBox.setBounds(map.getBounds());
		});
		var markers = [];
		searchBox.addListener('places_changed', function() {
			var places = searchBox.getPlaces();
			if (places.length == 0) {
				return;
			}
			markers.forEach(function(marker) {
				marker.setMap(null);
			});
			markers = [];
			var bounds = new google.maps.LatLngBounds();
			places.forEach(function(place) {
				if (!place.geometry) {
					return;
				}
				var icon = {
					url: place.icon,
					size: new google.maps.Size(71, 71),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(17, 34),
					scaledSize: new google.maps.Size(25, 25)
				};
				markers.push(new google.maps.Marker({
					map: map,
					icon: icon,
					title: place.name,
					position: place.geometry.location
				}));
				if (place.geometry.viewport) {
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			map.fitBounds(bounds);
		});
	}
});
