jQuery(function($) {
	if (typeof szbd === 'undefined') {
		return false;
	}
	var szbd_checkout = {
		shipping_method_list: jQuery("#shipping_method").length ? jQuery("#shipping_method") : jQuery('[id^="shipping_method"]'),
		min_message: [],
		radius_message: [],
		the_response: [],
		userMadeSelection: false,
		userMadeSelectionAndMarker: false,
		run_geo: false,
		is_dynamic_rate: false,
		cart_limit_methods: false,
		geo_base: [],
		ok_types: szbd.is_custom_types == 1 ? _.toArray(szbd.result_types) : ["street_address", "subpremise", "premise", "establishment", "plus_code"],
		no_map_types: szbd.is_custom_types == 1 ? _.toArray(szbd.no_map_types) : ["street_address", "subpremise", "premise", "establishment", "route", "intersection", "plus_code"],
		init: function() {
			if (szbd.is_checkout == 1) {
				if (szbd.precise_address === 'always') {
					szbd_map.initMap(null, false, false, [], false);
					szbd_map.init_delivery_map();
				} else if (szbd.precise_address === 'at_fail') {
					szbd_map.init_delivery_map();
				}
				jQuery('#place_order').prop('disabled', true).addClass('szbd-disabled');
				jQuery('body').off('updated_checkout.szbd').on('updated_checkout.szbd', szbd_checkout.updated_checkout);
				jQuery('body').one('updated_checkout.szbd2', function() {
					szbd_checkout.shipping_method_list.find('li').each(function() {
						if (jQuery(this).find('input').val().indexOf('szbd-shipping-method') == 0) {
							jQuery(this).attr('szbd', false).hide();
						}
					});
				});
			}
			if (szbd.is_cart == 1) {
				szbd_checkout.shipping_method_list.find('li').each(function() {
					if (jQuery(this).find('input').val().indexOf('szbd-shipping-method') == 0) {
						jQuery(this).attr('szbd', false).hide();
					}
				});
				szbd_checkout.updated_checkout();
				$(document.body).off('updated_wc_div.szbd').on('updated_wc_div.szbd', szbd_checkout.updated_checkout);
				$(document.body).off('updated_shipping_method.szbd').on('updated_shipping_method.szbd', szbd_checkout.updated_checkout);
			}
		},
		updated_checkout: function() {
			if (szbd.debug == 1) {
				$('.woocommerce-NoticeGroup-updateOrderReview').toggleClass('woocommerce-NoticeGroup-updateOrderReview');
				if ($('.woocommerce-NoticeGroup').length > 1) {
					$('.woocommerce-NoticeGroup').last().remove();
				}
			}
			szbd_checkout.shipping_method_list = szbd_map.shipping_method_list = jQuery("#shipping_method").length ? jQuery("#shipping_method") : jQuery('[id^="shipping_method"]');
			if (szbd_map.marker && szbd_map.updatingplusCode !== true) {
				let location = szbd_map.marker.getPosition();
				szbd_map.update_when_new_marker(location);
				return;
			}
			szbd_checkout.is_dynamic_rate = false;
			jQuery('#szbd-picked').val('');
			jQuery('#szbd_message').remove();
			jQuery('#place_order').prop('disabled', true).addClass('szbd-disabled');
			szbd_checkout.min_message = [];
			szbd_checkout.radius_message = [];
			szbd_checkout.do_update(false, false);
			szbd_checkout.shipping_method_list.find('li').off('click.szbd').on('click.szbd', function() {
				szbd_checkout.userMadeSelection = true;
			});
		},
		end: function() {
			jQuery('#szbd_message').remove();
			if (szbd.is_cart == 1 && szbd_checkout.the_response.has_address == false && szbd_checkout.shipping_method_list.find('li[szbd="false"]').length) {
				szbd_checkout.shipping_method_list.append('<span id="szbd_message">' + szbd.cart_string_1 + '</span>');
			}
			if (szbd_checkout.shipping_method_list.find('li[szbd="true"]').length === 0 && szbd_checkout.shipping_method_list.find('li').not('li[szbd="true"]').not('li[szbd="false"]').length === 0) {
				if (this.min_message.length !== 0) {
					var sorted_min_message = _.sortBy(this.min_message, 'min_amount');
					if (szbd_checkout.shipping_method_list.find("#szbd_message").length) {
						szbd_checkout.shipping_method_list.find("#szbd_message").html(sorted_min_message[0].min_message);
					} else {
						szbd_checkout.shipping_method_list.append('<span id="szbd_message">' + sorted_min_message[0].min_message + '</span>');
					}
				} else if (this.radius_message.length !== 0) {
					var sorted_radius_message = _.sortBy(this.radius_message, 'min_radius').reverse();
					if (szbd_checkout.shipping_method_list.find("#szbd_message").length) {
						szbd_checkout.shipping_method_list.find("#szbd_message").html(sorted_radius_message[0].radius_message);
					} else {
						szbd_checkout.shipping_method_list.append('<span id="szbd_message">' + sorted_radius_message[0].radius_message + '</span>');
					}
				} else if (this.cart_limit_methods == true) {
					if (szbd_checkout.shipping_method_list.find("#szbd_message").length) {
						szbd_checkout.shipping_method_list.find("#szbd_message").html(szbd.checkout_string_4);
					} else {
						szbd_checkout.shipping_method_list.append('<span id="szbd_message">' + szbd.checkout_string_4 + '</span>');
					}
				} else {
					if (szbd_checkout.shipping_method_list.find("#szbd_message").length) {
						szbd_checkout.shipping_method_list.find("#szbd_message").html(szbd.checkout_string_1);
					} else {
						szbd_checkout.shipping_method_list.append('<span id="szbd_message">' + szbd.checkout_string_1 + '</span>');
					}
				}
				jQuery('#place_order').prop('disabled', true).addClass('szbd-disabled');
				jQuery('#order_review .order-total .woocommerce-Price-amount').hide();
			} else {
				jQuery('#place_order').prop('disabled', false).removeClass('szbd-disabled');
				jQuery('#order_review .order-total .woocommerce-Price-amount').show();
			}
			if (szbd_map.updatingplusCode == true) {
				szbd_map.updatingplusCode = false;
			}
			// To develop in future versions
			/*
			var selected_method = jQuery('input[type=radio]:checked', '#shipping_method').val();
			 if(selected_method.includes('szbd'))
			 {
				jQuery('.woocommerce-shipping-totals.shipping').after('<tr><th>' + 'Shipping Address' + '</th><td>'+ address_string + '</td></tr>');
			 }*/
		},
		set_min: function(min) {
			this.min_message.push({
				min_amount: min[1],
				min_message: szbd.checkout_string_2 + ' ' + min[0]
			});
		},
		set_min_radius: function(min, unit) {
			this.radius_message.push({
				min_radius: min,
				radius_message: szbd.checkout_string_3 + ' ' + min + unit
			});
		},
		do_update: function(loc, from_marker) {
			try {
				//jQuery('.szbd-debug').remove();
				let to_block = jQuery('table.woocommerce-checkout-review-order-table');
				this.blockMethods(to_block);
				var data = {
					'action': 'szbd_check_address',
					'nonce_ajax': szbd.nonce,
				};
				this.post_for_server_evaluation(null, from_marker, loc, data);
			} catch (err) {
				this.ignore_szbd(false);
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
			if ((szbd_checkout.the_response.status === true) && (!(szbd_checkout.the_response.szbd_zones === null || szbd_checkout.the_response.szbd_zones === undefined || szbd_checkout.the_response.szbd_zones.length == 0)) || (from_marker && szbd.precise_address === 'always')) {
				szbd_checkout.is_dynamic_rate = szbd_checkout.the_response.do_dynamic_rate_car === true || szbd_checkout.the_response.do_dynamic_rate_bike === true;
				if (from_marker !== false) {
					szbd_checkout.do_geolocation(from_marker, loc, 'OK', 'OK', true, null, null, true);
				} else if (szbd_checkout.userMadeSelectionAndMarker) {
					loc = szbd_map.marker.getPosition();
					from_marker = true;
					szbd_checkout.do_geolocation(from_marker, loc, 'OK', 'OK', true, null, null, true);
				} else if (szbd_checkout.the_response.do_address_lookup != true) {
					szbd_checkout.do_geolocation(from_marker, null, null, 'OK', false, null, geo_base, false);
				} else if (szbd_checkout.the_response.delivery_address !== false) {
					szbd_checkout.do_geolocation(from_marker, szbd_checkout.the_response.delivery_address, 'OK', 'OK', true, null, null, true);
				} else {
					var ok_types = [];
					var s_country = response.cust_loc.country;
					var s_country_text = response.cust_loc.country_text;
					var s_state = response.cust_loc.state;
					var s_state_text = response.cust_loc.state_text;
					var s_postcode = response.cust_loc.postcode;
					var is_postcode = s_postcode !== '' ? true : false;
					var s_city = response.cust_loc.city;
					var s_address = response.cust_loc.address_1;
					var s_address_2 = response.cust_loc.address_2;
					var address_1 = s_address;
					var comp;
					var postcode_ = s_postcode !== undefined ? s_postcode.replace(" ", "") : '';
					if (s_country == 'IL') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ' ' + s_postcode;
						comp = {
							country: s_country,
							administrativeArea: s_city,
							locality: s_city,
						};
					} else if (s_country == 'CA') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ' ' + s_postcode + ',' + s_state_text;
						comp = {
							country: s_country,
							administrativeArea: s_state
						};
						if (s_state === "") {
							delete comp.administrativeArea;
						}
					} else if (s_country == 'RO') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ' ' + s_postcode + ',' + s_state_text;
						comp = {
							country: s_country,
							administrativeArea: s_state,
						};
						if (s_state === "") {
							delete comp.administrativeArea;
						}
					} else if (s_country == 'RU') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ',' + s_state_text;
						comp = {
							country: s_country,
							administrativeArea: s_state,
							locality: s_city,
						};
						if (s_state === "") {
							delete comp.administrativeArea;
						}
					} else if (s_country == 'AO') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ',' + s_state_text;
						comp = {
							country: s_country,
							administrativeArea: s_state,
							locality: s_city,
						};
						if (s_state === "") {
							delete comp.administrativeArea;
						}
					} else if (s_country == 'ES') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ',' + s_state_text;
						comp = {
							country: s_country,
							locality: s_city,
							postalCode: postcode_,
						};
					} else if (s_country == 'IE') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ' ' + postcode_;
						comp = {
							country: s_country,
							postalCode: postcode_,
						};
						ok_types = ["street_address", "subpremise", "premise", "postal_code", "establishment", "plus_code"];
					} else if (s_country == 'BR') {
						s_address = s_address + ', ' + postcode_ + ',' + s_city + ' , ' + s_state_text;
						comp = {
							country: s_country,
							locality: s_city,
						};
					} else if (s_country == 'PL') {
						s_address = s_address + ',' + s_address_2 + ',' + s_city + ' ' + s_country;
						comp = {
							locality: s_city,
							country: s_country
						};
					} else {
						s_address = response.cust_loc.formatted + ',' + s_country_text;
						comp = {
							postalCode: postcode_,
							locality: s_city,
							country: s_country
						};
						if (is_postcode === false) {
							delete comp.postalCode;
						}
						if (szbd.deactivate_postcode == 1) {
							delete comp.postalCode;
						} else {
							delete comp.locality;
						}
					}
					s_address = s_address.replace(/,+/g, ',');
					s_address = s_address.replace(/(^[,\s]+)|([,\s]+$)/g, '');
					if (szbd_isEmptyOrBlank(comp.locality)) {
						delete comp.locality;
					}
					if ((szbd.precise_address != 'no' && s_country != 'IE') || comp.postalCode === '') {
						delete comp.postalCode;
					}
					// If a precise shipping location is needed, and plus_code is among the accepted statuses, check if address_1 may have a plus code
					if (_.indexOf(szbd_checkout.ok_types, 'plus_code', false) !== -1 && from_marker == false && response.do_address_lookup == true && this.may_be_plus_code(response.cust_loc.address_1)) {
						s_address = response.cust_loc.address_1;
						comp = {
							country: s_country
						};
						ok_types = ['plus_code'];
					}
					if (szbd_isEmptyOrBlank(comp.country)) {
						delete comp.country;
					}
					geo_base = [s_country, s_state, s_city, postcode_, s_country_text, s_state_text];
					szbd_checkout.run_geo = true;
					var control_address_string = address_1 + s_address_2 + s_city + postcode_;
					szbd_checkout.only_country = false;
					if (this.is_address_empty(control_address_string)) {
						szbd_checkout.only_country = szbd_isEmptyOrBlank(s_state);
						szbd_checkout.do_geolocation(from_marker, null, null, google.maps.GeocoderStatus.OK, false, ok_types, geo_base, false);
					} else {
						this.try_geocode(from_marker, ok_types, geo_base, s_address, comp, false);
					}
					jQuery('table.woocommerce-checkout-review-order-table').removeClass('processing').unblock();
				}
			} else {
				jQuery('table.woocommerce-checkout-review-order-table').removeClass('processing').unblock();
				if (szbd.precise_address == 'always') {
					szbd_map.update_store_map(geo_base, true, false, [], from_marker);
				}
				szbd_checkout.end();
				szbd_checkout.shipping_method_list.fadeIn();
			}
		},
		may_be_plus_code: function(str) {
			var paragraph = str.split(',');
			var regex_local = /(^|\s)([23456789CFGHJMPQRVWX]{4,6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/i;
			var found = paragraph[0].match(regex_local);
			if (!_.isNull(found)) {
				return true;
			}
			var regex_global = /(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/i;
			var found2 = paragraph[0].match(regex_global);
			if (!_.isNull(found2)) {
				return true;
			}
			return false;
		},
		is_address_empty: function(control_address_string) {
			control_address_string = control_address_string.replace(/\s+/g, '');
			if (szbd_isEmptyOrBlank(control_address_string)) {
				return true;
			} else {
				return false;
			}
		},
		get_ok_geotypes: function(ok_types) {
			if (szbd.is_custom_types == 1) {
				ok_types = szbd.precise_address == 'no' ? szbd_checkout.no_map_types : szbd_checkout.ok_types;
			} else {
				ok_types = (!Array.isArray(ok_types) || !ok_types.length) ? szbd_checkout.ok_types : ok_types;
				ok_types = szbd.precise_address == 'no' ? ok_types.concat(["route", "intersection"]) : ok_types;
			}
			return ok_types;
		},
		try_geocode: function(from_marker, ok_types, geo_base, s_address, comp, has_address, isPlusCode) {
			$.when(szbd_google_geocode.geocode(s_address, comp)).then(function(response) {
				var results = response.results;
				var status = response.status;
				szbd_checkout.run_geo = false;
				ok_types = szbd_checkout.get_ok_geotypes(ok_types);
				if (szbd.debug == 1) {
					jQuery('.szbd-try-geocode-debug').remove();
					jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-try-geocode-debug"><h4>TRY GEOCODE REQUEST:</h4>Address string: ' + s_address + ' <br> Component restriction: ' + JSON.stringify(comp) + '<h4>TYPES:</h4>' + ok_types + '<h4>STATUS:</h4>' + status + '<br><h4>GEOCODE:</h4><br>' + JSON.stringify(results) + '</div>');
				}
				szbd_checkout.do_geolocation(from_marker, results, status, google.maps.GeocoderStatus.OK, false, ok_types, geo_base, true, isPlusCode);
			});
		},
		get_origins_promises: function(zones, delivery_address, latitude, longitude, store_address) {
			var promises = [];
			zones.forEach(function(element, index) {
				if (_.isNull(element.shipping_origin)) {
					element.shipping_origin = store_address;
				}
				if (element.max_radius !== false && delivery_address !== null) {
					var def_radius = new $.Deferred();
					$.when(szbd_checkout.calcRadius(delivery_address, element.shipping_origin, true)).then(function(r) {
						def_radius.resolve({
							id: element.value_id,
							rad: r
						});
					});
					promises.push(def_radius);
				}
				if (element.max_driving_distance !== false || element.max_driving_time_car !== false) {
					var def2_max_driving = new $.Deferred();
					$.when(szbd_checkout.calcRoute(latitude, longitude, element.shipping_origin, 'DRIVING')).then(function(r) {
						def2_max_driving.resolve({
							id: element.value_id,
							car: r,
						});
					});
					promises.push(def2_max_driving);
				}
				if (element.max_bike_distance !== false || element.max_driving_time_bike !== false) {
					var def2_max_bike = new $.Deferred();
					$.when(szbd_checkout.calcRoute(latitude, longitude, element.shipping_origin, 'BICYCLING')).then(function(r) {
						def2_max_bike.resolve({
							id: element.value_id,
							bike: r,
						});
					});
					promises.push(def2_max_bike);
				}
			});
			return $.when.apply(undefined, promises).then();
		},
		do_geolocation: function(from_marker, results, status, ok_status, has_address, ok_types, geo_base, geo_needed, isPlusCode) {
			try {
				var delivery_address;
				var drive_time_car_Promise;
				var drive_time_bike_Promise;
				var drive_dist_Promise;
				var bicycle_dist_Promise;
				var radius_Promise;
				var latitude;
				var longitude;
				if (!geo_needed) {
					latitude = null;
					longitude = null;
					if (szbd.precise_address == 'at_fail' && szbd_map.updatingplusCode != true) {
						szbd_map.remove_marker();
						$('#szbd_checkout_field').slideUp();
					} else if (szbd.precise_address == 'always' || szbd_map.updatingplusCode) {
						szbd_map.update_store_map(geo_base, true, false, [], from_marker);
					}
				} else if (has_address === false) {
					if (status != google.maps.GeocoderStatus.OK) {
						latitude = null;
						longitude = null;
						delivery_address = null;
						if (szbd.precise_address !== 'no') {
							szbd_map.update_store_map(geo_base, true, false, [], from_marker);
						}
					} else if (status === ok_status && szbd_checkout.findCommonElements(results[0].types, ok_types)) {
						latitude = results[0].geometry.location.lat();
						longitude = results[0].geometry.location.lng();
						delivery_address = results[0].geometry.location;
						if (szbd.precise_address == 'at_fail') {
							szbd_map.update_store_map(results[0].geometry.location, false, true, results[0].types, from_marker);
							if (szbd_map.updatingplusCode != true) {
								szbd_map.remove_marker();
								$('#szbd_checkout_field').slideUp();
							}
						} else if (szbd.precise_address == 'always') {
							szbd_map.update_store_map(results[0].geometry.location, false, true, results[0].types, from_marker);
						}
					} else {
						latitude = null;
						longitude = null;
						delivery_address = null;
						if (status === ok_status && szbd.precise_address == 'at_fail') {
							szbd_map.update_store_map(results[0].geometry.location, true, false, results[0].types, from_marker);
						} else if (status === ok_status && szbd.precise_address == 'always') {
							szbd_map.update_store_map(results[0].geometry.location, true, false, results[0].types, from_marker);
						}
					}
				} else {
					if (szbd_map.updatingplusCode && typeof isPlusCode == undefined) {
						latitude = results[0].geometry.location.lat();
						longitude = results[0].geometry.location.lng();
						delivery_address = results[0].geometry.location;
					} else {
						latitude = from_marker ? results.lat() : results.lat;
						longitude = from_marker ? results.lng() : results.lng;
						delivery_address = results;
					}
					if (szbd_map.updatingplusCode == false && jQuery('#szbd-plus-code').length && from_marker) {
						szbd_map.geocode_plus_code_reverse(results);
					}
					if (szbd.precise_address == 'at_fail') {
						if (from_marker || szbd_map.updatingplusCode) {
							szbd_map.update_store_map(delivery_address, false, true, ['precise_address'], from_marker);
						} else {
							szbd_map.remove_marker();
							$('#szbd_checkout_field').slideUp();
						}
					} else if (szbd.precise_address == 'always') {
						szbd_map.update_store_map(delivery_address, false, true, ['precise_address'], from_marker);
					}
				}
				//////////// Collect origins from zones
				var origins = this.the_response.default_origin !== true ? this.get_origins_promises(szbd_checkout.the_response.szbd_zones, delivery_address, latitude, longitude, this.the_response.store_address) : false;
				/////////////
				if (this.the_response.store_address !== false) {
					radius_Promise = this.the_response.do_radius && delivery_address !== null && this.the_response.default_origin == true ? szbd_checkout.calcRadius(delivery_address, this.the_response.store_address, true) : false;
				} else {
					radius_Promise = this.the_response.do_radius && delivery_address !== null && this.the_response.default_origin == true ? szbd_checkout.calcRadius(delivery_address, szbd.store_address, false) : false;
				}
				if (this.the_response.delivery_duration_driving !== false || this.the_response.distance_driving !== false) {
					drive_time_car_Promise = drive_dist_Promise = [this.the_response.delivery_duration_driving, this.the_response.distance_driving];
				} else {
					drive_time_car_Promise = drive_dist_Promise = (this.the_response.do_driving_time_car || this.the_response.do_driving_dist || this.the_response.do_dynamic_rate_car) && delivery_address !== null && this.the_response.default_origin == true ? szbd_checkout.calcRoute(latitude, longitude, szbd.store_address, 'DRIVING') : false;
				}
				if (this.the_response.delivery_duration_bicycle !== false || this.the_response.distance_bicycle !== false) {
					drive_time_bike_Promise = bicycle_dist_Promise = [this.the_response.delivery_duration_bicycle, this.the_response.distance_bicycle];
				} else {
					drive_time_bike_Promise = bicycle_dist_Promise = (this.the_response.do_driving_time_bike || this.the_response.do_bike_dist || this.the_response.do_dynamic_rate_bike) && delivery_address !== null && this.the_response.default_origin == true ? szbd_checkout.calcRoute(latitude, longitude, szbd.store_address, 'BICYCLING') : false;
				}
				$.when(drive_time_car_Promise, drive_time_bike_Promise, drive_dist_Promise, bicycle_dist_Promise, radius_Promise, origins).then(function(driving_car, driving_bike, driving_dist, bicycling_dist, radius, origins1) {
					if (!_.isArray(origins1) && _.isObject(origins1)) {
						origins1 = [origins1];
					}
					// Check if the custom delivery method is applicable
					if ((szbd_checkout.the_response.status === true) && !(szbd_checkout.the_response.szbd_zones === null || szbd_checkout.the_response.szbd_zones === undefined || szbd_checkout.the_response.szbd_zones.length == 0)) {
						var ok_methods = [];
						var cost_zero_found = false;
						szbd_checkout.the_response.szbd_zones.forEach(function(element, index) {
							if (cost_zero_found && szbd_checkout.the_response.exclude == 'yes') {
								szbd_checkout.shipping_method_list.find('li').find('input').filter(function() {
									return this.value == element.value_id;
								}).closest('li').attr('szbd', false).hide();
								if (index >= szbd_checkout.the_response.szbd_zones.length - 1) {
									szbd_checkout.end();
								}
								return;
							}
							if (element.drawn_map !== false) {
								var path = [];
								for (var i = 0; element.geo_coordinates !== null && i < (element.geo_coordinates).length; i++) {
									path.push(new google.maps.LatLng(element.geo_coordinates[i][0], element.geo_coordinates[i][1]));
								}
								var polygon = new google.maps.Polygon({
									paths: path
								});
								var location = new google.maps.LatLng((latitude), (longitude));
								var address_is_in_zone = google.maps.geometry.poly.containsLocation(location, polygon);
							} else if (element.max_radius !== false) {
								var max_ok;
								radius = _.isNull(element.shipping_origin) ? radius : _.chain(origins1).find(function(el) {
									return _.has(el, 'rad') && element.value_id == el.id;
								}).get('rad', null).value();
								var max_radius = element.distance_unit == 'miles' ? element.max_radius.radius * 1609.344 : element.max_radius.radius * 1000;
								max_ok = !_.isUndefined(radius) && radius !== false && radius !== null && max_radius > radius;
								if (status === ok_status && delivery_address != null && !max_ok) {
									szbd_checkout.set_min_radius(element.max_radius.radius, element.distance_unit);
								}
							}
							if (element.max_driving_distance !== false || element.max_driving_time_car !== false) {
								var car_El = _.isNull(element.shipping_origin) ? driving_dist : _.first(_(_.filter(origins1, function(obj) {
									return obj.id == element.value_id && _.has(obj, 'car');
								})).pluck('car'));
								var max_driving_distance_ok;
								var max_driving_time_car;
								let max_dist = element.max_driving_distance !== false ? (element.distance_unit == 'miles' ? element.max_driving_distance.distance * 1609.344 : element.max_driving_distance.distance * 1000) : null;
								max_driving_distance_ok = element.max_driving_distance !== false ? car_El != 'error' && !_.isUndefined(car_El) && 1 in car_El && max_dist > car_El[1] : undefined;
								max_driving_time_car = element.max_driving_time_car !== false ? car_El != 'error' && !_.isUndefined(car_El) && 0 in car_El && element.max_driving_time_car.time * 60 > car_El[0] : undefined;
								if (status === ok_status && delivery_address != null && max_driving_distance_ok === false && (typeof address_is_in_zone == 'undefined' || (address_is_in_zone))) {
									szbd_checkout.set_min_radius(element.max_driving_distance.distance, element.distance_unit);
								}
							}
							if (element.max_bike_distance !== false || element.max_driving_time_bike !== false) {
								var bike_El = _.isNull(element.shipping_origin) ? bicycling_dist : _.first(_(_.filter(origins1, function(obj) {
									return obj.id == element.value_id && _.has(obj, 'bike');
								})).pluck('bike'));
								var max_bike_distance_ok;
								var max_driving_time_bike;
								let max_dist_bike = element.max_bike_distance !== false ? (element.distance_unit == 'miles' ? element.max_bike_distance.distance * 1609.344 : element.max_bike_distance.distance * 1000) : null;
								max_bike_distance_ok = element.max_bike_distance !== false ? bike_El != 'error' && !_.isUndefined(bike_El) && 1 in bike_El && max_dist_bike > bike_El[1] : undefined;
								max_driving_time_bike = element.max_driving_time_bike !== false ? bike_El != 'error' && !_.isUndefined(bike_El) && 0 in bike_El && element.max_driving_time_bike.time * 60 > bike_El[0] : undefined;
								if (status === ok_status && delivery_address != null && max_bike_distance_ok === false && (typeof address_is_in_zone == 'undefined' || (address_is_in_zone))) {
									szbd_checkout.set_min_radius(element.max_bike_distance.distance, element.distance_unit);
								}
							}
							var condition_0 = (typeof address_is_in_zone == 'undefined' || address_is_in_zone);
							var condition_1 = (typeof max_ok == 'undefined' || max_ok);
							var condition_2 = typeof max_driving_distance_ok == 'undefined' || max_driving_distance_ok;
							var condition_2_ = typeof max_bike_distance_ok == 'undefined' || max_bike_distance_ok;
							var condition_3 = typeof max_driving_time_car == 'undefined' || max_driving_time_car;
							var condition_4 = typeof max_driving_time_bike == 'undefined' || max_driving_time_bike;
							var ok;
							if (element.is_cats_ok == 0) {
								ok = false;
								szbd_checkout.cart_limit_methods = true;
							} else if (condition_0 && condition_1 && condition_2 && condition_2_ && condition_3 && condition_4) {
								ok = true;
							} else {
								ok = false;
							}
							var min_amount_ok = parseFloat(element.min_amount) <= (szbd_checkout.the_response.tot_amount);
							if (!min_amount_ok && ok) {
								szbd_checkout.set_min([element.min_amount_formatted, element.min_amount]);
							}
							if (!ok || !min_amount_ok) {
								szbd_checkout.shipping_method_list.find('li').find('input').filter(function() {
									return this.value == element.value_id;
								}).closest('li').attr('szbd', false).hide();
							} else {
								szbd_checkout.shipping_method_list.find('li').find('input').filter(function() {
									return this.value == element.value_id;
								}).closest('li').attr('szbd', true).show();
								//below to get lowest cost method only
								if (szbd_checkout.the_response.exclude == 'yes') {
									if (element.rate_mode == 'fixed_and_distance' && typeof element.cost != 'number') {
										var unit_converter = element.distance_unit == 'miles' ? 1 / 1.6093 : 1;
										element.cost_changed = true;
										element.cost = element.transport_mode == 'car' ? (driving_dist[1] / 1000) * parseFloat(element.rate_distance) * unit_converter + parseFloat(element.rate_fixed) : (bicycling_dist[1] / 1000) * parseFloat(element.rate_distance) * unit_converter + parseFloat(element.rate_fixed);
									} else if (element.rate_mode == 'distance' && typeof element.cost != 'number') {
										var unit_converter = element.distance_unit == 'miles' ? 1 / 1.6093 : 1;
										element.cost = element.transport_mode == 'car' ? (driving_dist[1] / 1000) * parseFloat(element.rate_distance) * unit_converter : (bicycling_dist[1] / 1000) * parseFloat(element.rate_distance) * unit_converter;
										element.cost_changed = true;
									}
									ok_methods.push(element);
									if (element.cost == 0) {
										cost_zero_found = true;
									}
									var max = ok_methods.reduce(function(max, p, index, arr) {
										return parseFloat(p.cost) >= parseFloat(max.cost) ? p : max;
									}, ok_methods[0]);
									if (ok_methods.length > 1) {
										szbd_checkout.shipping_method_list.find('li').find('input').filter(function() {
											return this.value == max.value_id;
										}).closest('li').attr('szbd', false).hide();
										var min = ok_methods.reduce(function(min, p, index, arr) {
											return parseFloat(p.cost) < parseFloat(min.cost) ? p : min;
										}, ok_methods[0]);
										ok_methods = [min];
									}
								}
							}
							if (index >= szbd_checkout.the_response.szbd_zones.length - 1) {
								szbd_checkout.end();
							}
						});
					} else {
						szbd_checkout.end();
					}
				}).done(function() {
					szbd_checkout.select_method();
				});
			} catch (err) {
				this.ignore_szbd(false);
			}
		},
		test_latlng(lat, lng) {
			var reg_lat = /^-?([1-8]?\d(?:\.\d{1,})?|90(?:\.0{1,6})?)$/;
			var reg_lng = /^-?((?:1[0-7]|[1-9])?\d(?:\.\d{1,})?|180(?:\.0{1,})?)$/;
			if (reg_lat.test(lat) && reg_lng.test(lng)) {
				return true;
			}
			return false;
		},
		calcRoute: function(lati, longi, store_address, mode) {
			try {
				var time_def = $.Deferred();
				if (!this.test_latlng(lati, longi)) {
					time_def.resolve('error');
				} else {
					var N = 0;
					var store_loc;
					if (_.isObject(store_address) && _.has(store_address, 'lat') && _.has(store_address, 'lng')) {
						store_loc = new google.maps.LatLng(store_address.lat, store_address.lng);
					} else if (szbd.store_address_picked == 1) {
						store_loc = new google.maps.LatLng(store_address.lat, store_address.lng);
					} else if (_.isString(store_address)) {
						store_loc = store_address;
					} else {
						store_loc = store_address.store_address + ',' + store_address.store_postcode + ',' + store_address.store_city + ',' + store_address.store_state + ',' + store_address.store_country;
					}
					var request = {
						origin: store_loc,
						destination: {
							lat: lati,
							lng: longi
						},
						travelMode: mode,
						drivingOptions: {
							departureTime: new Date(Date.now() + N), // for the time N milliseconds from now.
							trafficModel: 'bestguess'
						}
					};
					var directionsService = new google.maps.DirectionsService();
					directionsService.route(request, function(response, status) {
						if (szbd.debug == 1) {
							jQuery('.szbd-route-debug').remove();
							jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-route-debug"><h4>CALC ROUTE:</h4><br><h4>Request:</h4><br>' + JSON.stringify(request) + '<br><h4>Response:</h4><br>' + JSON.stringify(response) + '</div>');
						}
						if (status == 'OK') {
							var time = (typeof response.routes[0].legs[0].duration_in_traffic !== 'undefined') ? response.routes[0].legs[0].duration_in_traffic.value : response.routes[0].legs[0].duration.value;
							var dist = response.routes[0].legs[0].distance.value;
							var del_address = response.routes[0].legs[0].end_address;
							time_def.resolve([time, dist, del_address]);
						} else {
							time_def.resolve('error');
						}
					});
				}
				return time_def.promise();
			} catch (err) {
				this.ignore_szbd(false);
			}
		},
		calcRadius: function(delivery_address, store_address, has_address) {
			try {
				var radius = $.Deferred();
				var r;
				var store_loc;
				delivery_address = delivery_address instanceof google.maps.LatLng ? delivery_address : new google.maps.LatLng(delivery_address.lat, delivery_address.lng);
				if (_.isObject(store_address) && _.has(store_address, 'lat') && _.has(store_address, 'lng')) {
					store_loc = new google.maps.LatLng(store_address.lat, store_address.lng);
				}
				if (store_loc instanceof google.maps.LatLng && !isNaN(store_loc.lat())) {
					r = this.compute_radius(store_loc, delivery_address);
					if (szbd.debug == 1) {
						jQuery('.szbd-radius-debug').remove();
						jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-radius-debug"><h4>CALC RADIUS:</h4><br>Radius:' + JSON.stringify(r) + '</div>');
					}
					radius.resolve(r);
				} else {
					var store_address_;
					if (_.isString(store_address)) {
						store_address_ = store_address;
					} else {
						store_address_ = store_address.store_address + ',' + store_address.store_postcode + ',' + store_address.store_city + ',' + store_address.store_state + ',' + store_address.store_country;
					}
					$.when(szbd_google_geocode.geocode(store_address_, null)).then(function(response) {
						results = response.results;
						status = response.status;
						return (szbd_checkout.calculate_radius(results, status, delivery_address));
					}).then(function(r) {
						radius.resolve(r);
					});
				}
				return radius.promise();
			} catch (err) {
				this.ignore_szbd(false);
			}
		},
		calculate_radius: function(results, status, delivery_address) {
			var outcome = $.Deferred();
			if (szbd.debug == 1) {
				jQuery('.szbd-radius-debug').remove();
				jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-radius-debug"><h4>CALC RADIUS::</h4><br>Radius:' + JSON.stringify(szbd_checkout.compute_radius(results[0].geometry.location, delivery_address)) + '<br>STORE ADDRESS:' + JSON.stringify(results) + '<br>DELIVERY ADDRESS:' + JSON.stringify(delivery_address) + '</div>');
			}
			if (status == 'OK') {
				var r = szbd_checkout.compute_radius(results[0].geometry.location, delivery_address);
				outcome.resolve(r);
			} else {
				outcome.resolve('error');
			}
			return outcome.promise();
		},
		compute_radius: function(s, d) {
			return google.maps.geometry.spherical.computeDistanceBetween(s, d);
		},
		findCommonElements: function(arr1, arr2) {
			return arr1.some(function(item) {
				return arr2.includes(item);
			});
		},
		ignore_szbd: function(auth_error) {
			if (!this.run_geo && auth_error == true) {
				return;
			} else if (!auth_error) {
				var el;
				szbd_checkout.shipping_method_list.find('li').each(function() {
					el = jQuery(this).find('input').val();
					if (el.indexOf("szbd-shipping-method") >= 0) {
						jQuery(this).attr('szbd', false).hide();
					}
				});
				szbd_checkout.shipping_method_list.fadeIn();
				jQuery('table.woocommerce-checkout-review-order-table').removeClass('processing').unblock();
				szbd_checkout.end();
				return;
			}
			jQuery('body').off('update_checkout.szbdcatch').on('update_checkout.szbdcatch', function() {
				jQuery('#place_order').prop('disabled', false);
			});
			jQuery('body').off('updated_checkout.szbdcatch').on('updated_checkout.szbdcatch', function() {
				var el;
				szbd_checkout.shipping_method_list.find('li').each(function() {
					el = jQuery(this).find('input').val();
					if (el.indexOf("szbd-shipping-method") >= 0) {
						jQuery(this).not('[szbd="true"]').remove();
					}
				});
				if (szbd_checkout.shipping_method_list.find('li').length === 0) {
					jQuery('#place_order').prop('disabled', true);
				}
				szbd_checkout.select_method();
			});
			szbd_checkout.shipping_method_list.find('li').each(function() {
				el = jQuery(this).find('input').val();
				if (el.indexOf("szbd-shipping-method") >= 0) {
					jQuery(this).not('[szbd="true"]').remove();
				}
			});
			if (szbd_checkout.shipping_method_list.find('li').length === 0) {
				jQuery('#place_order').prop('disabled', true);
			}
			jQuery('body').off('updated_checkout.my2');
			szbd_checkout.select_method();
		},
		select_method: function() {
			this.userMadeSelectionAndMarker = false;
			var has_changed = false;
			if (szbd.select_top_method == 1) {
				if (!this.userMadeSelection) {
					this.userMadeSelection = false;
					if ((szbd_checkout.shipping_method_list.find('li').not('li[szbd="false"]').first().find('input').is(":checked") !== true) && szbd_checkout.shipping_method_list.find('li').length !== 1) {
						let to_change = szbd_checkout.shipping_method_list.find('li').not('li[szbd="false"]').first();
						if (to_change.length) {
							to_change.find('input').prop('checked', true).trigger('change');
							has_changed = true;
						}
					}
				} else {
					this.userMadeSelection = false;
				}
			} else {
				if ((szbd_checkout.shipping_method_list.find('li').not('li[szbd="false"]').find('input').is(":checked") !== true) && szbd_checkout.shipping_method_list.find('li').length !== 1) {
					let to_change = szbd_checkout.shipping_method_list.find('li').not('li[szbd="false"]').first();
					if (to_change.length) {
						to_change.find('input').prop('checked', true).trigger('change');
						has_changed = true;
					}
				}
			}
			if (!has_changed) {
				szbd_checkout.shipping_method_list.fadeIn();
				jQuery('table.woocommerce-checkout-review-order-table').removeClass('processing').unblock();
			}
		},
		blockMethods: function($form) {
			var isBlocked = $form.data('blockUI.isBlocked');
			if (1 !== isBlocked) {
				$form.addClass('processing').block({
					message: null,
					overlayCSS: {
						background: '#fff',
						opacity: 0.6
					}
				});
			}
		},
	};
	var szbd_map = {
		shipping_method_list: jQuery("#shipping_method").length ? jQuery("#shipping_method") : jQuery('[id^="shipping_method"]'),
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
				if (is_fail) {
					jQuery('#szbd_checkout_field').fadeIn();
				}
				if ((szbd_map.updatingplusCode || !from_marker) && (typeof uluru == 'undefined' || uluru == null || _.isArray(uluru))) {
					if (_.isArray(uluru)) {
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
			} catch (err) {}
		},
		geocodeByArea: function(uluru, mapOptions, is_precise_address, from_marker) {
			var address = uluru[2] + ',' + uluru[5] + ',' + uluru[4];
			address = address.replace(/,+/g, ',');
			var comp = {
				country: uluru[0],
				administrativeArea: uluru[1],
			};
			if (comp.administrativeArea === '') {
				delete comp.administrativeArea;
			}
			if (comp.locality === '') {
				delete comp.locality;
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
		update_when_new_marker: function(loc) {
			jQuery('#szbd_message').remove();
			jQuery('#place_order').prop('disabled', true).addClass('szbd-disabled');
			szbd_checkout.do_update(loc, true);
			szbd_checkout.min_message = [];
			szbd_checkout.radius_message = [];
			szbd_map.shipping_method_list.find('li').off('click.szbd').on('click.szbd', function() {
				szbd_checkout.userMadeSelection = true;
				var store_location = szbd_map.marker.getPosition();
				if (store_location) {
					szbd_checkout.userMadeSelectionAndMarker = true;
				}
			});
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
					jQuery('.szbd-reverse-debug').remove();
					jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-reverse-debug"><h4>REVERSE PLUS CODE REQUEST:</h4>Address string: ' + JSON.stringify(location) + '<h4>TYPES:</h4>' + ok_types + '<h4>STATUS:</h4>' + status + '<br><h4>GEOCODE:</h4><br>' + JSON.stringify(results) + '</div>');
				}
				_.each(response.results, function(element, i, list) {
					if (szbd_checkout.findCommonElements(results[i].types, ok_types)) {
						jQuery('#szbd-plus-code').val(results[i].plus_code.compound_code);
					}
				});
			});
		},
		geocode_plus_code: function() {
			szbd_map.updatingplusCode = true;
			jQuery('#szbd-picked').val('');
			szbd_map.remove_marker(true);
			var plus_code = jQuery('#szbd-plus-code').val();
			if (_.isEmpty(plus_code)) {
				szbd_map.remove_marker();
				jQuery('body').trigger('update_checkout');
			} else {
				var comp = {
					country: szbd_checkout.geo_base[0],
				};
				if (szbd_isEmptyOrBlank(comp.country)) {
					delete comp.country;
				}
				szbd_map.from_marker = true;
				szbd_checkout.try_geocode(true, ['plus_code'], szbd_checkout.geo_base, plus_code, comp, false, true);
				if (szbd_checkout.is_dynamic_rate == true) {
					jQuery('body').trigger('update_checkout');
				}
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
				szbd_map.placeMarker(uluru, true);
			} else if (is_precise_address && (from_marker)) {
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
			if (szbd_map.marker) {
				google.maps.event.clearListeners(szbd_map.marker, 'dragend');
				szbd_map.marker.addListener('dragend', function(event) {
					szbd_map.placeMarker(event.latLng);
					jQuery('#szbd-plus-code').val('');
				});
			}
		},
		get_zoom_level: function(types) {
			var zoom = 0;
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
		placeMarker: function(location, auto_marker = false) {
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
						szbd_map.from_marker = true;
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
						this.geocode_plus_code_reverse(store_location);
					}
				}
			} catch (err) {}
		},
		remove_marker_on_change: function() {
			if ($('#ship-to-different-address').find('input').is(':checked')) {
				jQuery(document).off('input.szbd2').on('input.szbd2', '#shipping_address_1,#shipping_city,input#shipping_state', szbd_map.remove_marker);
				jQuery(document).off('change.szbd3').on('change.szbd3', '#shipping_country,select#shipping_state', szbd_map.remove_marker);
			} else {
				jQuery(document).off('input.szbd2').on('input.szbd2', '#billing_address_1,#billing_city,input#billing_state', szbd_map.remove_marker);
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
			if (szbd_map.marker) {
				szbd_map.marker.setMap(null);
				szbd_map.marker = null;
			}
		},
		get_country_coords: function(mapOptions, uluru) {
			if (szbd.countries && szbd.countries[uluru[0]]) {
				let country = szbd.countries[uluru[0]];
				mapOptions.center = {
					lat: country.lat,
					lng: country.lng
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
				$.when(szbd_google_geocode.geocode(address, comp)).then(function(response) {
					const results = response.results;
					const status = response.status;
					var ok_types = szbd_map.get_area_ok_types(comp);
					if (szbd.debug == 1) {
						jQuery('.szbd-2nd-geocode-debug').remove();
						jQuery('.woocommerce-notices-wrapper:first-child').append('<div class="woocommerce-info szbd-debug szbd-2nd-geocode-debug"><h4>2nd GEOCODE REQUEST:</h4>Address string: ' + address + ' <br> Component restriction: ' + JSON.stringify(comp) + '<h4>TYPES:</h4>' + ok_types + '<h4>STATUS:</h4>' + status + '<br><h4>GEOCODE:</h4><br>' + JSON.stringify(results) + '</div>');
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
			szbd_ajax_request.doing_ajax = true;
			var outcome = $.Deferred();
			this.request = $.post(
				woocommerce_params.ajax_url,
				data,
				function(response) {
					outcome.resolve(response);
				}).always(function() {});
			return outcome.promise();
		}
	};
	// Init
	szbd_checkout.init();
	// Google Maps Failure
	window.gm_authFailure = function() {
		szbd_checkout.ignore_szbd(true);
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
});
