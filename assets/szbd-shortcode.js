jQuery(document).ready(function($) {
	var elements = jQuery("div.szbdshortcode_id");
	_.each(elements, function(element) {
		var token = jQuery(element).data('token');
		var obj = window['szbd_map_' + token];
		if (obj != 'undefined') {
			initialize(element, obj);
			jQuery(element).prev('h4').find('.szbdshortcode_id_title').html(obj.title);
		}
	});
	if (szbd_map_monitor.monitor == 1) {
		monitor_shortcode_insertion();
	} else {
		third_party_popup_support();
	}
});

function third_party_popup_support() {
	//Support for Elementor popups
	window.addEventListener('elementor/popup/show', function() {
		let elements = jQuery('div[data-elementor-type="popup"]').find(".szbdshortcode_id");
		_.each(elements, function(element) {
			let token = jQuery(element).data('token');
			let obj = window['szbd_map_' + token];
			if (obj != 'undefined' && jQuery(element).parents('div[data-elementor-type="popup"]').length) {
				initialize(element, obj);
				jQuery(element).prev('h4').find('.szbdshortcode_id_title').html(obj.title);
			}
		});
	});
}

function monitor_shortcode_insertion() {
	waitForAddedNode({
		stack: [],
		done: function(elements) {
			_.each(elements, function(el) {
				let token = jQuery(el).data('token');
				let obj = window['szbd_map_' + token];
				if (!_.contains(this.stack, el) && obj != 'undefined') {
					this.stack.push(el);
					if (jQuery(el).is(':visible')) {
						initialize(el, obj);
						jQuery(el).prev('h4').find('.szbdshortcode_id_title').html(obj.title);
					} else {
						var timer = setInterval(function() {
							if (jQuery(el).is(':visible')) {
								clearInterval(timer);
								initialize(el, obj);
								jQuery(el).prev('h4').find('.szbdshortcode_id_title').html(obj.title);
							}
						}, 400);
					}
				}
			}, this);
		}
	});
}

function waitForAddedNode(params) {
	new MutationObserver(function(mu) {
		_.each(mu, function(m) {
			var el = jQuery(m.addedNodes).find("div.szbdshortcode_id");
			if (el) {
				params.done(el);
			}
		});
	}).observe(document, {
		subtree: true,
		childList: true,
	});
}

function initialize(element, element_) {
	var zoom = _.isNull(element_.zoom) ? 15 : Number(element_.zoom);
	var color = element_.color[0] !== '' ? element_.color : ['#53c853'];
	
	var circle_color = element_.circle_color[0] != undefined ? element_.circle_color : color;
	
	var bounds;
	var interactive = element_.interactive == 1 ? true : false;
	if (typeof element_.maps[0] !== 'undefined' || element_.radius != 0) {
		var mapOptions = {
			zoom: zoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: !interactive,
		};
		if (element[0] !== null) {
			var new_map = new google.maps.Map(jQuery(element)[0], mapOptions);
			bounds = new google.maps.LatLngBounds();
			if (typeof element_.maps[0] !== 'undefined') {
				new_map.setOptions('center', new google.maps.LatLng(element_.maps[0].lat, element_.maps[0].lng));
				var fillcolor;
				_.each(element_.maps, function(map_, j) {
					var path = [];
					_.each(map_.array_latlng, function(map__, i) {
						path.push(new google.maps.LatLng(map__[0], map__[1]));
						bounds.extend(path[i]);
					});
					fillcolor = typeof color[j] !== 'undefined' ? color[j] : color[color.length - 1];
					new google.maps.Polygon({
						map: new_map,
						paths: path,
						strokeColor: fillcolor,
						strokeOpacity: 0.35,
						//strokeWeight: 3,
						fillColor: fillcolor,
						fillOpacity: 0.35
					});
				});
			}
			new_map.fitBounds(bounds);
			new_map.setZoom(Number(zoom));
			if (!_.isNull(element_.zoom)) {
				google.maps.event.addListenerOnce(new_map, 'bounds_changed', function(event) {
					if (this.getZoom()) {
						this.setZoom(Number(element_.zoom));
					}
				});
			}
			google.maps.event.addListenerOnce(new_map, 'tilesloaded', function(event) {
				this.fitBounds(bounds);
			});
			if (element_.radius != 0) {
				if (element_.store_address_picked == 1) {
					draw_circle(element_.store_loc, new_map, circle_color, bounds, element_);
				} else {
					var store_address = element_.store_loc;
					var geocode_storeaddress = new google.maps.Geocoder();
					geocode_storeaddress.geocode({
							'address': store_address.store_address + ',' + store_address.store_postcode + ',' + store_address.store_city + ',' + store_address.store_state + ',' + store_address.store_country
						},
						function(results, status) {
							var ok_types = ["street_address", "subpremise", "premise", "establishment", "route"];
							if (status === 'OK' && findCommonElements(results[0].types, ok_types)) {
								draw_circle(results[0].geometry.location, new_map, circle_color, bounds, element_);
							}
						});
				}
			}
		}
	}
}

function draw_circle(center, map, color, bounds, element_) {
	
	if (!_.isNull(element_.zoom)) {
		google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
			if (this.getZoom()) {
				this.setZoom(Number(element_.zoom));
			}
		});
	}
	if (_.isArray(element_.radius)) {
		_.each(element_.radius, function(radius, j) {
			let fillcolor = typeof color[j] !== 'undefined' ? color[j] : color[color.length - 1];
			let center_ = typeof center[j] !== 'undefined' ? center[j] : center[center.length - 1];
			let circle = new google.maps.Circle({
				strokeColor: fillcolor,
				strokeOpacity: 0.35,
				fillColor: fillcolor,
				fillOpacity: 0.35,
				map: map,
				center: center_,
				radius: element_.radius_unit == 'miles' ? parseFloat(radius) * 1609.344 : parseFloat(radius) * 1000
			});
			bounds.extend(new google.maps.LatLng(circle.getBounds().getNorthEast().lat(), circle.getBounds().getNorthEast().lng()));
			bounds.extend(new google.maps.LatLng(circle.getBounds().getSouthWest().lat(), circle.getBounds().getSouthWest().lng()));
		});
	}
	map.fitBounds(bounds);
}
// Helping methods
function findCommonElements(arr1, arr2) {
	return arr1.some(function(item) {
		return arr2.includes(item);
	});
}
