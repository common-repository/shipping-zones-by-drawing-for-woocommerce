<?php
if (!defined('ABSPATH')) {
    exit;
}
function szbd_modify_address_formats( $formats ) {
            $formats[ 'CL' ]  = $formats[ 'default' ] ;   
            return $formats;
        }
function szbd_get_origin_latlng($origin){
      $origin_latlng = null;
     if($origin != 'default' && !empty($origin)){
             $meta = get_post_meta(intval($origin) , 'szbdorigins_metakey', true);
             
             
              if (isset($meta) && isset($meta['geo_coordinates']) && is_array($meta['geo_coordinates']) && count($meta['geo_coordinates']) > 0) {
                $i2 = 0;
                foreach ($meta['geo_coordinates'] as $geo_coordinates) {
                  if ($geo_coordinates[0] != '' && $geo_coordinates[1] != '') {
                    $array_latlng[$i2] = array(
                      $geo_coordinates[0],
                      $geo_coordinates[1]
                    );
                    $i2++;
                  }
                }
                
                $origin_latlng = is_array($array_latlng) && is_array($array_latlng[0]) && isset($array_latlng[0][0]) && isset($array_latlng[0][1]) && is_numeric($array_latlng[0][0]) && is_numeric($array_latlng[0][1]) ?
                (object) ['lat' => (float) $array_latlng[0][0],
                'lng' => (float) $array_latlng[0][1] ]
                : null;
              }
              
             
            }
            return $origin_latlng;
  }
  
   function szbd_get_subtotal($ignore_discounts = false){
   
        // Doing subtotal same approach as WooCommerce shipping method "Free Shipping" since 2.8.4.4
        $total = WC()->cart->get_displayed_subtotal();

			if ( WC()->cart->display_prices_including_tax() ) {
				$total = $total - WC()->cart->get_discount_tax();
			}
        if ( ! is_numeric( $total ) ) {
			$total = floatval( $total );
		}
        $precision = wc_get_price_decimals();
        
        if ( !$ignore_discounts ) {
				$total = $total - WC()->cart->get_discount_total();
			}

        $tot_amount =  round( $total, $precision, PHP_ROUND_HALF_UP );
        return  $tot_amount;
  }
  function szbd_minAmountOk($method_instance){
   
   
    
   

			
        return true ;
  }
  
  
    function szbd_radiusIsOk($method_instance){
     
            if( $method_instance->map == 'none' ||   $method_instance->map != 'radius'){
                return true;
            }
           
            $point =  WC()
                  ->session
                  ->get('szbd_delivery_address',null);
                 if($point == null || !isset($point->lat)){
                  return false;
                 }
                
                  $origin_raw = $method_instance-> shipping_origin == 'default' ? WC_SZBD_Shipping_Method::get_store_address_latlng_string(true, $method_instance) : WC_SZBD_Shipping_Method::get_shipping_origin($method_instance-> shipping_origin);
             
               if($origin_raw  == null){
                   return false;
                  }
             $origin = explode(',', $origin_raw);
             
           
             $distanceCalculationClass = new szbd_distanceCalculationClass();
             $unit = $method_instance->distance_unit == 'imperial' ? 'mi' : 'km';
          $distance =  $distanceCalculationClass-> distanceCalculation( (float) $point->lat, (float)$point->lng, (float)$origin[0], (float)$origin[1], $unit, $decimals = 2);
          $max_radius = $method_instance-> max_radius;
          $radius_ok =  (float) $distance <= (float) $max_radius;
        
          return $radius_ok;
        }
        
        function szbd_durationOk($method_instance){
          return true;
        }
        function szbd_distanceOk($method_instance){
          return true;
        }
         
        
    function szbd_polygonContainsPoint($method_instance){
    
             if( $method_instance->map == 'none' ||   $method_instance->map == 'radius'){
                return true;
            }
          $point_raw =  WC()
                  ->session
                  ->get('szbd_delivery_address',null);
                 
            if(is_null($point_raw)  || $point_raw == false){
                return false;
            }
                
                
             $pointLocation = new szbd_pointLocation();
$point = $point_raw != null ? $point_raw->lat . ' ' .  $point_raw->lng : null;
  

$zone_id = $method_instance->map;
$polygon = array();
 $meta = get_post_meta(intval($zone_id) , 'szbdzones_metakey', true);
   if (isset($meta) && isset($meta['geo_coordinates']) && is_array($meta['geo_coordinates']) && count($meta['geo_coordinates']) > 0) {
                $i2 = 0;
                foreach ($meta['geo_coordinates'] as $geo_coordinates) {
                  if ($geo_coordinates[0] != '' && $geo_coordinates[1] != '') {
                    $polygon[] = $geo_coordinates[0]. ' ' .$geo_coordinates[1];
                    if($i2 == 0){
                        $startingpoint = array($geo_coordinates[0], $geo_coordinates[1]);
                    }
                    
                    $i2++;
                  }
                }
                 $polygon[] = $startingpoint[0]. ' ' .$startingpoint[1];
                
              }
              else {
                $polygon = null;
              }
           
// The last point's coordinates must be the same as the first one's, to "close the loop"

  return   $pointLocation->pointInPolygon($point, $polygon) == 'inside';

        }
        
function szbd_clear_session() {
    
   wc_clear_notices();

    WC()
      ->session
      ->__unset('szbd_distance_car_default');
    WC()
      ->session
      ->__unset('szbd_distance_bike_default');
    WC()
      ->session
      ->__unset('szbd_delivery_duration_car_default');
    WC()
      ->session
      ->__unset('szbd_delivery_duration_bike_default');
    WC()
      ->session
      ->__unset('szbd_store_address');
    WC()
      ->session
      ->__unset('szbd_delivery_address');
    WC()
      ->session
      ->__unset('szbd_delivery_address_string');
   
    WC()
      ->session
      ->__unset('fdoe_min_shipping_is_szbd');
      
      
      
      
      $args_ori = array(
            'numberposts' => -1,
            'post_type' => 'szbdorigins',
            'post_status' => 'publish',
           
          );
          $origin_posts = get_posts($args_ori);
          
          if (is_array($origin_posts) || is_object($origin_posts)) {
          
           
            foreach ($origin_posts as $post) {
              $id = $post->ID;
              
            
              
     WC()
      ->session
      ->__unset('szbd_distance_car_'. $id);
    WC()
      ->session
      ->__unset('szbd_distance_bike_' . $id);
    WC()
      ->session
      ->__unset('szbd_delivery_duration_car_' . $id);
    WC()
      ->session
      ->__unset('szbd_delivery_duration_bike_' . $id);
             
            }     
              
            }
  }
  
  function szbd_clear_wc_shipping_rates_cache() {
    $packages = WC()
      ->cart
      ->get_shipping_packages();

    foreach ($packages as $key => $value) {
      $shipping_session = "shipping_for_package_$key";

      unset(WC()
        ->session
        ->$shipping_session);
    }
  }
    

