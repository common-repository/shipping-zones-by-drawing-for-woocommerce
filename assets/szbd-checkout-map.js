jQuery(function($) {
	if (typeof szbd === 'undefined') {
		return false;
	}
	var szbd_checkout = {
		the_response: [],
		run_geo: false,
		geo_base: [],
		ok_types: szbd.is_custom_types == 1 ? _.toArray(szbd.result_types) : ["street_address", "subpremise", "premise", "establishment", "plus_code"],
		no_map_types: szbd.is_custom_types == 1 ? _.toArray(szbd.no_map_types) : ["street_address", "subpremise", "premise", "establishment", "route", "intersection", "plus_code"],
		init: function() {
			
			if (szbd.is_checkout == 1) {
				if (szbd.precise_address === 'always') {
					var location =  szbd_isJsonString(szbd.customer_stored_location) ? JSON.parse(szbd.customer_stored_location) : null ;
					var set_marker = false;
					
					
					if (_.isObject(location) && _.has(location, 'lat')) {
						 set_marker = 'auto_marker';
					
					}else{
						location = null;
					}
					
					szbd_map.initMap(location, false, false, [], set_marker);
					szbd_map.init_delivery_map();
				} else if (szbd.precise_address === 'at_fail') {
					szbd_map.init_delivery_map();
				}
				jQuery('body').off('updated_checkout.szbd').on('updated_checkout.szbd', szbd_checkout.updated_checkout);
			}
		},
		
		updated_checkout: function() {
			
			
			if (szbd_map.marker && szbd_map.updatingplusCode !== true) {
				
				return;
			} else {
				
				jQuery('#szbd-picked').val('');
				szbd_checkout.do_update(false, false);
			}
		},
		do_update: function(loc, from_marker) {
			try {
				
				var data = {
					'action': 'szbd_get_address',
					'nonce_ajax': szbd.nonce,
				};
				this.post_for_server_evaluation(null, from_marker, loc, data);
			} catch (err) {}
		},
		is_address_empty: function(control_address_string) {
			control_address_string = control_address_string.replace(/\s+/g, '');
			if (  _.isEmpty(control_address_string) || !control_address_string.trim() ) {
				return true;
			} else {
				return false;
			}
		},
		post_for_server_evaluation: function(geo_base_, from_marker, loc, data) {
			$.when(szbd_ajax_request.make_request(data)).then(function(response) {
				szbd_checkout.geo_base = [response.cust_loc.country, response.cust_loc.state, response.cust_loc.city, response.cust_loc.postcode, response.cust_loc.country_text, response.cust_loc.state_text];
				szbd_checkout.evaluate_server_response(response, from_marker, loc, szbd_checkout.geo_base);
			});
		},
		evaluate_server_response: function(response, from_marker, loc, geo_base) {
			szbd_checkout.the_response = response;
			var s_country = response.cust_loc.country;
			var s_country_text = response.cust_loc.country_text;
			var s_state = response.cust_loc.state;
			var s_state_text = response.cust_loc.state_text;
			var s_postcode = response.cust_loc.postcode;
			var s_city = response.cust_loc.city;
			var s_address = response.cust_loc.address_1;
			var postcode_ = s_postcode !== undefined ? s_postcode.replace(" ", "") : '';
			geo_base = [s_country, s_state, s_city, postcode_, s_country_text, s_state_text];
			szbd_checkout.run_geo = true;
			var is_fail;
			var is_precise_address, types;
			
			var control_address_string = s_address; 
					
					if ( szbd.precise_address === 'at_fail' && this.is_address_empty(control_address_string)) {
						
						return;
						}
			szbd_map.update_store_map(response.delivery_address, is_fail, is_precise_address, types, from_marker);
		},
		try_geocode: function(from_marker, ok_types, geo_base, s_address, comp, has_address, isPlusCode) {
			
			$.when(szbd_google_geocode.geocode(s_address, comp)).then(function(response) {
				var results = response.results;
				var status = response.status;
				szbd_checkout.run_geo = false;
				
				if (status === 'OK' /*&& szbd_checkout.findCommonElements(results[0].types, ok_types)*/) {
					if (isPlusCode) {
						
						szbd_map.updatingplusCode = false;
						szbd_map.placeMarker(results[0].geometry.location, true, false);
						let zoom = szbd_map.get_zoom_level(results[0].types);
						szbd_map.map.setZoom(zoom);
					}
				} else {
					szbd_map.remove_marker();
				}
			});
		},
		test_latlng(lat, lng) {
			var reg_lat = /^-?([1-8]?\d(?:\.\d{1,})?|90(?:\.0{1,6})?)$/;
			var reg_lng = /^-?((?:1[0-7]|[1-9])?\d(?:\.\d{1,})?|180(?:\.0{1,})?)$/;
			if (reg_lat.test(lat) && reg_lng.test(lng)) {
				return true;
			}
			return false;
		},
		findCommonElements: function(arr1, arr2) {
			return arr1.some(function(item) {
				return arr2.includes(item);
			});
		},
		ignore_szbd: function(auth_error) {
			jQuery('#szbd_checkout_field').remove();
		},
	};
	var szbd_map = {
		map: null,
		marker: null,
		mapOptions: {
			zoom: 1,
			center: {
				lat: 0,
				lng: 0
			},
			disableDefaultUI: true,
			zoomControl: true
		},
		updatingplusCode: false,
		init_delivery_map: function() {
			
			jQuery(document).off('change.szbdmap').on('change.szbdmap', '#ship-to-different-address input', szbd_map.remove_marker);
			jQuery(document).off('change.szbdmap2').on('change.szbdmap2', '#ship-to-different-address input', szbd_map.remove_marker_on_change);
			szbd_map.remove_marker_on_change();
			szbd_map.szbd_save_location();
			// Plus Code Init
			jQuery('body').off('change.szbdplus').on('change.szbdplus', '#szbd-plus-code', szbd_map.geocode_plus_code);
			jQuery('body').on('keypress keydown keyup', '#szbd-plus-code', function(e) {
				if (e.keyCode == 13) {
					e.preventDefault();
				}
			});
			jQuery('#szbd_map').on('cma_placing_marker', function(event, location) {
				if (szbd.auto_marker == 0) {
					return;
				}
				szbd_map.remove_marker();
				szbd_map.update_store_map(location, false, true, null, false);
			});
		},
		
		initMap: function(uluru, is_fail, is_precise_address, types, from_marker) {
			try {
				if (szbd.precise_address === 'at_fail') {
					
					if ((  _.isObject(uluru)) && !_.has(uluru, 'lat')) {
						jQuery('#szbd_checkout_field').fadeIn();
						
						
					} else {
						if (!from_marker) {
							if (szbd_map.marker ) {
				szbd_map.marker.setMap(null);
				szbd_map.marker = null;
			}
							jQuery('#szbd_checkout_field').slideUp();
							jQuery('#szbd-picked').val('');
							jQuery('#szbd-plus-code').val('');
						}
					}
				}
				
				if ((szbd_map.updatingplusCode || !from_marker) && (typeof uluru == 'undefined' || uluru == null || uluru == false || _.isArray(uluru) || _.has(uluru, 'country'))) {
					
					if (_.isArray(uluru) || _.has(uluru, 'country')) {
						
						this.geocodeByArea(uluru, szbd_map.mapOptions, is_precise_address, from_marker);
					} else {
						
						this.set_map(szbd_map.mapOptions, is_precise_address, null, from_marker);
					}
				} else {
					let mapOptions = szbd_map.mapOptions;
					mapOptions.zoom = this.get_zoom_level(types);
					mapOptions.center = uluru;
					if (szbd.auto_marker == 1 && szbd.precise_address === 'always' && !from_marker) {
						if (_.isObject(uluru) && _.has(uluru, 'lat')) {
							from_marker = 'auto_marker';
						}
					}
					
					this.set_map(mapOptions, is_precise_address, uluru, szbd_map.updatingplusCode ? true : from_marker);
				}
			} catch (err) {
				console.debug(err);
			}
		},
		geocodeByArea: function(uluru, mapOptions, is_precise_address, from_marker) {
			var address = uluru.formatted_address;
			address = address.replace(/,+/g, ',');
			var comp = {
				country: uluru.country,
				administrativeArea: uluru.city,
			};
			if (comp.administrativeArea === '') {
				delete comp.administrativeArea;
			}
			if (szbd_isEmptyOrBlank(comp.country)) {
				delete comp.country;
			}
			
			var get_mapOptions = szbd_map.try_second_geocode(address, comp, mapOptions, uluru);
			$.when(get_mapOptions).then(function(mapOptions) {
				
				szbd_map.set_map(mapOptions, is_precise_address, null, from_marker);
			});
		},
		update_store_map: function(loc, is_fail, is_precise_address, types, from_marker) {
			szbd_map.initMap(loc, is_fail, is_precise_address, types, from_marker);
		},
		geocode_plus_code_reverse: function(location) {
			$.when(szbd_google_geocode.geocode(location, null, true)).then(function(response) {
				if (response.status !== google.maps.GeocoderStatus.OK) {
					return;
				}
				var results = response.results;
				var status = response.status;
				var ok_types = ['plus_code'];
				if (szbd.debug == 1) {
				console.debug(	'REVERSE PLUS CODE REQUEST:Address string:'  + JSON.stringify(location) + 'TYPES:' + ok_types + 'STATUS:' + status + 'GEOCODE:' + JSON.stringify(results) );
				}
				var found_pluscode = _.find(results, function(element) {
					return szbd_checkout.findCommonElements(element.types, ok_types);
				});
				
				if (found_pluscode != undefined) {
					jQuery('#szbd-plus-code').val(found_pluscode.plus_code.compound_code);
				}
			});
		},
		geocode_plus_code: function() {
			
			szbd_map.updatingplusCode = true;
			jQuery('#szbd-picked').val('');
			szbd_map.remove_marker(true);
			var plus_code = jQuery('#szbd-plus-code').val();
			if (_.isEmpty(plus_code)) {
				szbd_map.remove_marker();
				szbd_map.updatingplusCode = false;
				szbd_map.is_generic = false;
				
				jQuery('body').trigger('update_checkout');
			} else {
				var comp = {
					country: szbd_checkout.geo_base[0],
				};
				if (szbd_isEmptyOrBlank(comp.country)) {
					delete comp.country;
				}
				szbd_checkout.try_geocode(true, ['plus_code'], szbd_checkout.geo_base, plus_code, comp, false, true);
			}
		},
		set_map: function(mapOptions, is_precise_address, uluru, from_marker) {
			
			if (szbd_map.map) {
				szbd_map.map.setOptions(mapOptions);
			} else {
				szbd_map.map = new google.maps.Map(
					document.getElementById('szbd_map'), mapOptions);
			}
			if (from_marker == 'auto_marker') {
				szbd_map.placeMarker(uluru, false, true);
			} else if (from_marker) {
				let markerOptions = {
					position: uluru,
					map: szbd_map.map,
					draggable: true,
				};
				if (szbd_map.marker) {
					szbd_map.marker.setOptions(markerOptions);
				} else {
					szbd_map.marker = new google.maps.Marker(markerOptions);
					szbd_map.remove_marker_on_change();
				}
			}
			jQuery('#szbd_map').height(400);
			google.maps.event.clearListeners(szbd_map.map, 'click');
			google.maps.event.addListener(szbd_map.map, 'click', function(event) {
				szbd_map.placeMarker(event.latLng);
				jQuery('#szbd-plus-code').val('');
			});
			if (szbd_map.marker ) {
				google.maps.event.clearListeners(szbd_map.marker, 'dragend');
				szbd_map.marker.addListener('dragend', function(event) {
					szbd_map.placeMarker(event.latLng);
					jQuery('#szbd-plus-code').val('');
				});
			}
		},
		get_zoom_level: function(types) {
			
			var zoom = 17;
			var precise_types = ["street_address", "subpremise", "premise", "establishment", "precise_address", "intersection", "neighborhood", "plus_code", "park", "airport", "point_of_interest", "point_of_interest", "landmark"];
			var locality_types = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'administrative_area_level_4', 'administrative_area_level_5', 'sublocality', 'political', 'colloquial_area', 'postal_town', "natural_feature"];
			var mid_range_types = ['archipelago'];
			if (_.intersection(types, mid_range_types).length) {
				zoom = 8;
			} else if (_.intersection(types, locality_types).length) {
				zoom = 10;
			} else if (_.intersection(types, precise_types).length) {
				zoom = 18;
			} else if (_.contains(types, 'route')) {
				zoom = 15;
			}
			if (_.contains(types, 'postal_code')) {
				zoom = 13;
			}
			if (_.contains(types, 'country')) {
				zoom = 6;
			}
			return zoom;
		},
		placeMarker: function(location, from_pluscode = false, auto_marker = false) {
			try {
				
				if (szbd_map.marker) {
					
					szbd_map.marker.setPosition(location);
					
				} else {
					this.marker = new google.maps.Marker({
						position: location,
						map: szbd_map.map,
						draggable: true,
					});
				
					google.maps.event.clearListeners(szbd_map.marker, 'dragend');
					szbd_map.marker.addListener('dragend', function(event) {
						szbd_map.placeMarker(event.latLng);
						jQuery('#szbd-plus-code').val('');
					});
				}
				
				var store_location = szbd_map.marker.getPosition();
				if (store_location) {
					jQuery('#szbd-picked').val(store_location.lat() + ',' + store_location.lng());
					szbd_map.remove_marker_on_change();
					if (!auto_marker) {
					
						jQuery('body').trigger('update_checkout');
					}
					if (jQuery('#szbd-plus-code').length) {
						
						if (from_pluscode) {
							szbd_map.map.setCenter(store_location);
						}
						this.geocode_plus_code_reverse(store_location);
					}
				}
			} catch (err) {}
		},
		remove_marker_on_change: function() {
			if ($('#ship-to-different-address').find('input').is(':checked')) {
				jQuery(document).off('input.szbd2').on('input.szbd2', '#shipping_address_1,#shipping_city,input#shipping_state,input#shipping_postcode', szbd_map.remove_marker);
				jQuery(document).off('change.szbd3').on('change.szbd3', '#shipping_country,select#shipping_state', szbd_map.remove_marker);
			} else {
				jQuery(document).off('input.szbd2').on('input.szbd2', '#billing_address_1,#billing_city,input#billing_state,input#billing_postcode', szbd_map.remove_marker);
				jQuery(document).off('change.szbd3').on('change.szbd3', '#billing_country,select#billing_state', szbd_map.remove_marker);
			}
		},
		remove_marker: function(keep_plus_code) {
			if (szbd_ajax_request.request) {
				szbd_ajax_request.request.abort();
			}
			
			szbd_map.do_the_remove(keep_plus_code);
		},
		do_the_remove(keep_plus_code) {
			jQuery('#szbd-picked').val('');
			if (keep_plus_code !== true) {
				jQuery('#szbd-plus-code').val('');
			}
			if (szbd_map.marker ) {
				szbd_map.marker.setMap(null);
				szbd_map.marker = null;
			}
			jQuery('body').trigger('update_checkout');
		},
		get_country_coords: function(mapOptions, uluru) {
			
			var country = _.has(uluru, 'country') ? uluru.country :uluru[0];
			if (szbd.countries && szbd.countries[country]) {
				let country2 = szbd.countries[country];
				mapOptions.center = {
					lat: country2.lat,
					lng: country2.lng
				};
				mapOptions.zoom = szbd_map.get_zoom_level(['country']);
			}
			return mapOptions;
		},
		get_area_ok_types: function(comp) {
			var ok_types = ['archipelago', 'country', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'administrative_area_level_4', 'administrative_area_level_5'];
			if (comp.country == 'ES') {
				ok_types.push('locality');
			}
			return ok_types;
		},
		try_second_geocode: function(address, comp, mapOptions, uluru) {
			var outcome = $.Deferred();
			if (szbd_checkout.only_country) {
				mapOptions = this.get_country_coords(mapOptions, uluru);
				
				outcome.resolve(mapOptions);
			} else {
				//alert('2st  '+JSON.stringify(+response));
				$.when(szbd_google_geocode.geocode(address, comp)).then(function(response) {
					const results = response.results;
					const status = response.status;
					
					var ok_types = szbd_map.get_area_ok_types(comp);
					if (szbd.debug == 1) {
						console.debug(	'2nd GEOCODE REQUEST:Address string:'  + address + 'Component restriction: ' + JSON.stringify(comp) + 'OK TYPES:' + ok_types + 'STATUS:' + status + 'GEOCODE:' + JSON.stringify(results) );
									}
					if (google.maps.GeocoderStatus.OK == status) {
						mapOptions.center = results[0].geometry.location;
						mapOptions.zoom = szbd_map.get_zoom_level(results[0].types);
					} else {
						mapOptions = szbd_map.get_country_coords(mapOptions, uluru);
						
					}
					outcome.resolve(mapOptions);
				});
			}
			return outcome.promise();
		},
		szbd_save_location: function() {
			try {
				$('form.checkout').off("checkout_place_order.szbd").on("checkout_place_order.szbd", function() {
					if ($('#szbd-picked').length) {
						if (szbd_map.marker) {
							var store_location = szbd_map.marker.getPosition();
							if (store_location) {
								jQuery('#szbd-picked').val(JSON.stringify(store_location));
							}
						}
						if ($('#szbd_checkout_field').is(":visible")) {
							$("#szbd-map-open").prop("checked", true);
						} else {
							$("#szbd-map-open").prop("checked", false);
						}
					}
				});
			} catch (err) {}
		}
	};
	var szbd_google_geocode = {
		geocoder: new google.maps.Geocoder(),
		geocode: function(address, comp, isPlusCode) {
			var outcome = $.Deferred();
			comp = _.isObject(comp) ? comp : {};
			var args = {
				'address': address,
				'componentRestrictions': comp
			};
			if (isPlusCode !== undefined && isPlusCode) {
				args = {
					'location': address,
				};
			}
			this.geocoder.geocode(args, function(results, status) {
				outcome.resolve({
					results: results,
					status: status
				});
			});
			return outcome.promise();
		}
	};
	var szbd_ajax_request = {
		make_request: function(data) {
			var outcome = $.Deferred();
			this.request = $.post(
				woocommerce_params.ajax_url,
				data,
				function(response) {
					outcome.resolve(response);
				}
			);
			return outcome.promise();
		}
	};
	// Init
	szbd_checkout.init();
	
	// Google Maps Failure
	window.gm_authFailure = function() {
		szbd_checkout.ignore_szbd();
	};
	//	Polyfill trim()
	if (!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}

	function szbd_isEmptyOrBlank(string) {
		return _.isEmpty(string) || !string.trim();
	}
	function szbd_isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
});
