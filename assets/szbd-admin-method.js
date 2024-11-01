jQuery(document).ready(function($) {
	$('#szbd_exclude_shipping_methods').attr('disabled', 'disabled');
	jQuery('.woocommerce_page_wc-settings').find('.in_premium').parent('label').after('<span class="premium_link" ><a  target="_blank" class="premium_link_ref" href="https://shippingzonesplugin.com/">Premium</a></span>');
	jQuery(document).on('wc_backbone_modal_loaded', function() {
		$('.szbd-enhanced-select').selectWoo();
		$('#woocommerce_szbd-shipping-method_title').parents('tr').hide();
		jQuery('.wc-modal-shipping-method-settings').find('.in_premium').after('<span class="premium_link" ><a  target="_blank" class="premium_link_ref" href="https://shippingzonesplugin.com/">Premium</a></span>');
		if ($('#woocommerce_szbd-shipping-method_map').find('option:selected').attr("value") !== 'radius') {
			$('#woocommerce_szbd-shipping-method_max_radius').parents('tr').hide();
		}
		if ($('#woocommerce_szbd-shipping-method_map').find('option:selected').attr("value") == 'none') {
			$('#woocommerce_szbd-shipping-method_zone_critical').parents('tr').hide();
		}

		if ($('#woocommerce_szbd-shipping-method_rate_mode').find('option:selected').attr("value") == 'flat') {
			$('#woocommerce_szbd-shipping-method_rate_fixed').parents('tr').hide();
			$('#woocommerce_szbd-shipping-method_rate_distance').parents('tr').hide();
		} else if ($('#woocommerce_szbd-shipping-method_rate_mode').find('option:selected').attr("value") == 'distance') {
			$('#woocommerce_szbd-shipping-method_rate').parents('tr').hide();
			$('#woocommerce_szbd-shipping-method_rate_fixed').parents('tr').hide();
		}else{
			$('#woocommerce_szbd-shipping-method_rate').parents('tr').hide();
			
		}
		$('#woocommerce_szbd-shipping-method_rate_mode').on('change',function() {
			if ($(this).find('option:selected').attr("value") == 'flat') {
				$('#woocommerce_szbd-shipping-method_rate_fixed').parents('tr').fadeOut();
				$('#woocommerce_szbd-shipping-method_rate_distance').parents('tr').fadeOut();
				$('#woocommerce_szbd-shipping-method_rate').parents('tr').fadeIn();

			} else if ($(this).find('option:selected').attr("value") == 'distance') {
				$('#woocommerce_szbd-shipping-method_rate_fixed').parents('tr').fadeOut();
				$('#woocommerce_szbd-shipping-method_rate_distance').parents('tr').fadeIn();
			} else {
				$('#woocommerce_szbd-shipping-method_rate_fixed').parents('tr').fadeIn();
				$('#woocommerce_szbd-shipping-method_rate_distance').parents('tr').fadeIn();
			}
		});
		$('#woocommerce_szbd-shipping-method_map').on('change', function() {
			if ($(this).find('option:selected').attr("value") == 'radius') {
				$('#woocommerce_szbd-shipping-method_zone_critical').parents('tr').fadeIn();
				$('#woocommerce_szbd-shipping-method_max_radius').parents('tr').fadeIn();
			} else if ($(this).find('option:selected').attr("value") == 'none') {
				$('#woocommerce_szbd-shipping-method_max_radius').parents('tr').fadeOut();
				$('#woocommerce_szbd-shipping-method_zone_critical').parents('tr').fadeOut();
			} else {
				$('#woocommerce_szbd-shipping-method_max_radius').parents('tr').fadeOut();
				$('#woocommerce_szbd-shipping-method_zone_critical').parents('tr').fadeIn();
			}
		});
		var test3 = parseFloat($('#woocommerce_szbd-shipping-method_max_driving_distance').val());
		if (test3 === 0 || isNaN(test3)) {
			$('#woocommerce_szbd-shipping-method_distance_critical').parents('tr').fadeOut();
		}
		$('#woocommerce_szbd-shipping-method_max_driving_distance').each(function() {
			var elem2 = $(this);
			elem2.data('oldVal', elem2.val());
			elem2.on("propertychange change click keyup input paste", function() {
				if (elem2.data('oldVal') != elem2.val()) {
					elem2.data('oldVal', elem2.val());
					test3 = parseFloat(elem2.val());
					if (test3 === 0 || isNaN(test3)) {
						$('#woocommerce_szbd-shipping-method_distance_critical').parents('tr').fadeOut();
					} else {
						$('#woocommerce_szbd-shipping-method_distance_critical').parents('tr').fadeIn();
					}
				}
			});
		});

		var test4 = parseFloat($('#woocommerce_szbd-shipping-method_max_driving_time').val());
		if (test4 === 0 || isNaN(test4)) {
			$('#woocommerce_szbd-shipping-method_time_critical').parents('tr').fadeOut();
		}
		$('#woocommerce_szbd-shipping-method_max_driving_time').each(function() {
			var elem3 = $(this);
			elem3.data('oldVal', elem3.val());
			elem3.on("propertychange change click keyup input paste", function() {
				if (elem3.data('oldVal') != elem3.val()) {
					elem3.data('oldVal', elem3.val());
					test4 = parseFloat(elem3.val());
					if (test4 === 0 || isNaN(test4)) {
						$('#woocommerce_szbd-shipping-method_time_critical').parents('tr').fadeOut();
					} else {
						$('#woocommerce_szbd-shipping-method_time_critical').parents('tr').fadeIn();
					}
				}
			});
		});
		$('#woocommerce_szbd-shipping-method_rate_mode').children('option').each(function() {
		if ($(this).val() === 'distance') {
			$(this).attr('disabled', true);
		}
		else if ($(this).val() === 'fixed_and_distance') {
			$(this).attr('disabled', true);
		}
	});
	});
});
