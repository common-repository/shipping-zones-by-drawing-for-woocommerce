<?php
if (!defined('ABSPATH'))
  {
  exit;
  }
// The Plugin Settings arguments
if (!isset($settings_args))
  {
  $settings_args = array(
    array(
      'name' => __('Settings', 'szbd'),
      'type' => 'title',
      'id' => 'SZbD_settings',
      'desc' => __('', '')
    ),
    array(
      'name' => __('Google Maps API Key','szbd'),
      'id' => 'szbd_google_api_key',
      'type' => 'text',
      'css' => 'min-width:300px;',
      'desc' => __(' <p><a href="https://cloud.google.com/maps-platform/#get-started" target="_blank">Visit Google to get your API Key &raquo;</a> <br>Include Maps JavaScript API, Places API, Geocoding API, Directions API</p>', 'szbd')
    ),
    array(
      'name' => __('Secondary Google Maps API Key', 'szbd'),
      'id' => 'szbd_google_api_key_2',
      'type' => 'text',
      'css' => 'min-width:300px;',
      'desc' => __('If your main API Key has restrictions by HTTP referrers (web sites) you will need to enter a secondary API Key for the server to server Geocode API requests wich is used for when running in server mode. This Key can not be restricted by HTTP referrers (web sites) and needs the Geocode API activated.', 'szbd')


    ),
     array(
      'name' => __('Show only lowest cost shipping method?', 'szbd'),
      'id' => 'szbd_exclude_shipping_methods',
      'type' => 'checkbox',
      'css' => 'min-width:300px;',
      'desc' => __('At checkout, show only the "Shipping Zones by Drawing" shipping method with the lowest cost.', 'szbd'),
      'disabled' => true,
     'class' => 'in_premium',
    ),
     array(
      'name' => __('Hide shipping costs at cart page?', 'szbd'),
      'id' => 'szbd_hide_shipping_cart',
      'type' => 'checkbox',
      'css' => 'min-width:300px;',
      'default' => 'no',
      'desc' => __('At cart page, hide the shipping costs.', 'szbd')
    ),
      array(
      'name' => __('Enable at cart page?', 'szbd'),
      'id' => 'szbd_enable_at_cart',
      'type' => 'checkbox',
      'css' => 'min-width:300px;',
      'default' => 'no',
      'desc' => __('Make geolocation calculations at cart page.', 'szbd')
    ),
      array(
            'name' => __('Pick Precise Delivery Address from Map?', 'szbd'),
            'id' => 'szbd_precise_address',
            'default' => 'no',
            'css' => 'min-width:fit-content;',

            'type' => 'select',
            'options' => array(

                  'no' => __( 'Inactivate', 'szbd' ),
                  
                    'at_fail' => __( 'Show the delivey map when Google fail to geolocate the delivery address', 'szbd' ),
                    'always' => __( 'Always show the delivery map', 'szbd' ) . ' (Premium)',
            ),
            'desc' => __('A map can be shown at checkout that let users pick their precise delivery location.', 'szbd')
        ),
        array(
          'name' => __('Pick location from Plus Code?', 'szbd'),
          'id' => 'szbd_precise_address_plus_code',
          'type' => 'checkbox',
          'css' => 'min-width:300px;',
          'default' => 'no',
          'desc' => __('Enable the ability to pick location with a Google Plus Code.', 'szbd')
        ),
           array(
          'name' => __('Mandatory to precise at map?', 'szbd'),
          'id' => 'szbd_precise_address_mandatory',
          'type' => 'checkbox',
          'css' => 'min-width:300px;',
          'default' => 'no',
          'desc' => __('Make it mandatory to pick address from map?.', 'szbd'),
    
        ),
      array(
      'name' => __('Auto insert saved location marker?', 'szbd'),
      'id' => 'szbd_auto_marker_saved',
      'type' => 'checkbox',
      'css' => 'min-width:300px;',
      'default' => 'no',
      'disabled' => true,
      'class' => 'in_premium',
      'desc' => __('For logged in users, automatically insert a map marker for the latest saved location. A shipping location is saved when a customer creates an order with a picked map position.', 'szbd')
    ),
     array(
      'name' => __('Auto insert location marker?', 'szbd'),
      'id' => 'szbd_auto_marker',
      'type' => 'checkbox',
      'css' => 'min-width:300px;',
      'default' => 'no',
      'disabled' => true,
     'class' => 'in_premium',
      'desc' => __('Automatically insert a location marker on the map when an address is successfully geolocated.', 'szbd')
    ),
     
     
         
    
      
     
        array(
            'name' => __('Set Store Location', 'szbd'),
            'id' => 'szbd_store_address_mode',
            'default' => 'geo_woo_store',

            'type' => 'select',
            'options' => array(

                  'pick_store_address' => __( 'Pick Store Location from Map', 'szbd' ),
                   'geo_woo_store' => __( 'Geolocate WooCommerce Store Address', 'szbd' )
            ),
            'css' => 'max-width:fit-content;',
            'desc' => __('This location will be used as start point when calculating dynamic shipping rates and as center point when using radius as shipping method restriction. Warning! To geolocate the WooCommerce store address may lead to unnecessary amount of Google requests.', 'szbd')
        ),
          array(
      'type' => 'sectionend',
      'id' => 'SZbD_settings'
    ),
     
      
     
      
   
     array(
      'name' => __('Pick Store Location', 'szbd'),
      'type' => 'title',
      'id' => 'SZbD_settings_test',
       'desc' => __('Click on the map to set the store location. ', 'szbd' ) ,

    ),

     array(
        'type' => 'szbdtab',
        'id' => 'szbdtab'
    ),
     array(
      'type' => 'sectionend',
      'id' => 'SZbD_settings_test'
    ),
  );
  }
  
    if (!isset($settings_args_advanced))
  {
  $settings_args_advanced = array(
      array(
      'name' => __('Advanced', 'szbd'),
      'type' => 'title',
      'id' => 'SZbD_settings_ad',

    ),
      array(
             'name' => __( 'Server Mode? (Recommended)', 'szbd' ),
            'id' => 'szbd_server_mode',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
            'desc' => __('Mandatory when using blocks checkout. This mode requires the 2nd Google API Key with the "Geocode" library activated.', 'szbd' ),


            'default' => 'yes'
        ),
        array(
          'name' => __( 'Show checkout message at server mode?', 'szbd' ),
         'id' => 'szbd_servermode_message',
         'type' => 'checkbox',
         'css' => 'min-width:300px;',
          'desc' => __('Show a customer message at checkout if no methods are valid.', 'szbd' ),

         'default' => 'no'
     ),
       array(
             'name' => __( 'Deactivate Post Code restriction', 'szbd' ),
            'id' => 'szbd_deactivate_postcode',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
             'desc' => __('Deactivate Post code restriction. For areas with unreliable post code matches.', 'szbd' ),

            'default' => 'no'
        ),
        array(
             'name' => __( 'Select top shipping method?', 'szbd'  ),
            'id' => 'szbd_select_top_method',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
             'desc' => __('When changed address at checkout, select the top sorted shipping method.', 'szbd'  ),

            'default' => 'no'
        ),

      array(
             'name' => __( 'De-activate Google Maps API?', 'szbd' ),
            'id' => 'szbd_deactivate_google',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',

            'default' => 'no'
        ),
       array(
             'name' => __( 'Force Shortcode [szbd]?', 'szbd' ),
            'id' => 'szbd_force_shortcode',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',

            'default' => 'no'
        ),
       array(
             'name' => __( 'Monitor insertion of shortcode [szbd]?', 'szbd' ),
            'id' => 'szbd_monitor',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',


            'default' => 'no'
        ),

       array(
             'name' => __( 'Debug Mode', 'szbd' ),
            'id' => 'szbd_debug',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
             'desc' => __('Show request and response data from Google calls.', 'szbd' ),

            'default' => 'no'
        ),
       array(
             'name' => __( 'Display shipping origin data', 'szbd' ),
            'id' => 'szbd_origin_table',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
             'desc' => __('Display the shipping origin in the admin order table and in new order emails.', 'szbd' ),

            'default' => 'no',
             'disabled' => true,
            'class' => 'in_premium',
        ),
        array(
          'name' => __('Map Placement', 'szbd') ,
          'id' => 'szbd_map_placement',
          'default' => 'before_payment',
          'type' => 'select',
          'options' => array(
              'before_payment' => __('Before Payment', 'szbd') ,
              'before_details' => __('Before Customer Details', 'szbd') ,
              'before_order_review' => __('First in Order Review', 'szbd') ,
              'after_order_notes' => __('After Order Notes', 'szbd') ,
               'after_billing_form' => __('After Billing Form', 'szbd') ,
             
             
          ) ,
          'css' => 'max-width:200px;height:auto;',
          'desc' => __('Select where on checkout page to place the map', 'szbd') .' ('.  __('Only for the old checkout page [woocommerce_checkout]', 'szbd') .')',

      ) ,


     
    array(
      'type' => 'sectionend',
      'id' => 'SZbD_settings_ad'
    ),
     array(
      'name' => __('Google Response Types', 'szbd'),
      'type' => 'title',
      'id' => 'SZbD_settings_types',

    ),
      array(
            'id' => 'szbd_types_custom',
            'default' => 'no',
            'type' => 'checkbox',
            'css' => 'min-width:300px;',
            'desc' => __('Configure custom allowed Google response types ', 'szbd'),
             
        ) ,
    
    
     array(
            'name' => __('Geocode Response Types (with map)', 'szbd') ,
            'id' => 'szbd_result_types',
            'default' => array(
             
                "establishment",
                "subpremise",
                "premise",
                "street_address",
                "plus_code",
            ) ,
             'class' => 'wc-enhanced-select',
            'type' => 'multiselect',
          
            'options' => array(
                'street_address' => esc_html('street_address (Recommended)'),
                'premise' => esc_html('premise (Recommended)'),
                'subpremise' => esc_html('subpremise (Recommended)'),
                'establishment' => esc_html('establishment (Recommended)'),
                'plus_code' => esc_html('plus_code (Recommended)'),
                'route' => esc_html('route'),
                'intersection' => esc_html('intersection'),
                 'postal_code' => esc_html('postal_code'),
                'neighborhood' => esc_html('neighborhood'),
                'point_of_interest' => esc_html('point_of_interest'),
                'political' => esc_html('political'),
                 'restaurant' => esc_html('restaurant'),
                
                
               
               
                
            ) ,
            'desc' => __('Accepted response types for a geocode request when the map feature is activated', 'szbd') . __('<p><a href="https://developers.google.com/maps/documentation/geocoding/overview#Types" target="_blank">Learn more.</a></p>')
        ) ,
      array(
            'name' => __('Geocode Response Types (without map)', 'szbd') ,
            'id' => 'szbd_no_map_types',
            'default' => array(
             
                "establishment",
                "subpremise",
                "premise",
                "street_address",
                "route",
                "intersection",
                "plus_code",
            ) ,
            'type' => 'multiselect',
            'class' => 'wc-enhanced-select',
           
            'options' => array(
                'street_address' => esc_html('street_address (Recommended)'),
                'premise' => esc_html('premise (Recommended)'),
                'subpremise' => esc_html('subpremise (Recommended)'),
                'establishment' => esc_html('establishment (Recommended)'),
               
                'route' => esc_html('route (Recommended)'),
                'intersection' => esc_html('intersection (Recommended)'),
                 'plus_code' => esc_html('plus_code (Recommended)'),
                 'postal_code' => esc_html('postal_code'),
                'neighborhood' => esc_html('neighborhood'),
                'point_of_interest' => esc_html('point_of_interest'),
                 'political' => esc_html('political'),
                
               
                'restaurant' => esc_html('restaurant'),
                
            ) ,
            'desc' => __('Accepted response types for a geocode request when the map feature is disabled or when calculating a dynamic shipping rate', 'szbd') . __('<p><a href="https://developers.google.com/maps/documentation/geocoding/overview#Types" target="_blank">Learn more.</a></p>')
        ) ,
     
     array(
      'type' => 'sectionend',
      'id' => 'SZbD_settings_types'
    ),
    
    
    
    
   
  );
  }
  
  // The Post Type arguments
if (!isset($caps))
  {
  $x      = wp_count_posts(SZBD::POST_TITLE);
  $y      = intval($x->publish) + intval($x->draft);
  $cap_1  = $y <= 4.936*sin(deg2rad(90)) && isset($y) ? 'edit_' . SZBD::POST_TITLE : 'edit__' . SZBD::POST_TITLE;
  $labels = array(
    'name' => __('Shipping Zones by Drawing', 'szbd'),
    'menu_name' => __('Shipping Zones by Drawing', 'szbd'),
    'name_admin_bar' => __('Shipping Zone Maps', 'szbd'),
    'all_items' => __('Shipping Zones by Drawing', 'szbd'),
    'singular_name' => __('Zone List', 'szbd'),
    'add_new' => __('New Shipping Zone', 'szbd'),
    'add_new_item' => __('Add New Zone', 'szbd'),
    'edit_item' => __('Edit Zone', 'szbd'),
    'new_item' => __('New Zone', 'szbd'),
    'view_item' => __('View Zone', 'szbd'),
    'search_items' => __('Search Zone', 'szbd'),
    'not_found' => __('Nothing found', 'szbd'),
    'not_found_in_trash' => __('Nothing found in Trash', 'szbd'),
    'parent_item_colon' => ''
  );
  $caps   = array(
    'edit_post' => 'edit_szbdzone',
    'read_post' => 'read_szbdzone',
    'delete_post' => 'delete_szbdzone',
    'edit_posts' => 'edit_szbdzones',
    'edit_others_posts' => 'edit_others_szbdzones',
    'publish_posts' => 'publish_szbdzones',
    'read_private_posts' => 'read_private_szbdzones',
    'delete_posts' => 'delete_szbdzones',
    'delete_private_posts' => 'delete_private_szbdzones',
    'delete_published_posts' => 'delete_published_szbdzones',
    'delete_others_posts' => 'delete_others_szbdzones',
    'edit_private_posts' => 'edit_private_szbdzones',
    'edit_published_posts' => 'edit_published_szbdzones',
    'create_posts' => $cap_1
  );
  $args   = array(
    'labels' => $labels,
    'public' => true,
    'publicly_queryable' => false,
    'show_ui' => true,
    'query_var' => true,
    'rewrite' => false,
    'hierarchical' => false,
    'supports' => array(
      'title',
      'author'
    ),
    'exclude_from_search' => true,
    'show_in_nav_menus' => false,
    'show_in_menu' => 'woocommerce',
    'can_export' => true,
    'map_meta_cap' => true,
    'capability_type' => 'szbdzone',
    'capabilities' => $caps
  );
  }
