<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SZBD_Shortcode {

	protected static $_instance = null;

	protected $is_active = false;

	public static $shortcode_order;



	public function __construct() {



		add_shortcode( apply_filters( "{szbd}_shortcode_tag", 'szbd' ), 'SZBD_Shortcode::shortcode' );


	}

	public static function instance() {

		if ( is_null( self::$_instance )  ){
			self::$_instance = new self();
		}

		return self::$_instance;
	}


public static function shortcode( $atts ) {

if(is_admin()){
	return;
}

		$options = shortcode_atts( array(

			'ids'   => null,
			'radius'   => null,
			'radius_unit' => null,
			'title' =>	null,
			'color' =>	null,
			'circle_color' =>	null,
			'interactive' =>	null,
			'origin' => null,
			'zoom' => null


		), $atts );

$ids = empty($options['ids']) ? null : $options['ids'];

$radius = empty($options['radius']) ? null : explode(',', $options['radius']);

$origin = empty($options['origin']) ? null : explode(',',$options['origin']);

$radius_unit = empty($options['radius_unit']) ? 'kilometer' : $options['radius_unit'];

$title = empty($options['title']) ? '' : $options['title'];

$color = empty($options['color']) ? '' : $options['color'];

$circle_color = empty($options['circle_color']) ? '' : explode(',',$options['circle_color']);

$interactive = empty($options['interactive']) ? 'false' : $options['interactive'];
$zoom = empty($options['zoom']) ? null : $options['zoom'];


$ids = explode(',', $ids);

$color = explode(',', $color);



$token = wp_generate_password(32, false, false);
self::enqueue_inline();
 wp_localize_script( 'szbd-script-short', 'szbd_map_'. $token, self::szbdzones_js( $ids ,$title, $color,$circle_color, $interactive, $radius, $radius_unit, $origin, $zoom) );
		ob_start();

		include SZBD_PLUGINDIRPATH . '/includes/shortcode-map-template.php';

		$content = ob_get_clean();

		return ($content);
	}


 public static function szbdzones_js( $ids ,$title, $color,$circle_color, $interactive, $radius, $radius_unit, $origin, $zoom)
    {

		$maps= array();
		foreach($ids as $id){
			$array_latlng = array();

			$post   = get_post( $id );
			$post_type = get_post_type( $post );

			if($post_type !== 'szbdzones'){
	continue ;
}
			$post_id = $post->ID;
    $settings     = get_post_meta( $post_id, 'szbdzones_metakey', true );
    $lat          = isset( $settings['lat'] ) ? $settings['lat'] : '';
    $lng          = isset( $settings['lng'] ) ? $settings['lng'] : '';
   $zoom_          = isset( $settings['zoom'] ) ? $settings['zoom'] : '1.3';
    $geo_coordinates_array = is_array( $settings ) && is_array( $settings['geo_coordinates'] ) ? $settings['geo_coordinates'] : array();
    if ( count( $geo_coordinates_array ) > 0 )
      {
      foreach ( $geo_coordinates_array as $geo_coordinates )
        {
        if ( $geo_coordinates[0] != '' && $geo_coordinates[1] != '' )
          $array_latlng[] = array(
             $geo_coordinates[0],
            $geo_coordinates[1]
          );
        }
      }
    else
      {
      $array_latlng = array();
      }
	  $maps[] =   array(
       'lat' => $lat,
	   'lng' => $lng,
	   'array_latlng' => $array_latlng,
	   'zoom' => (float) $zoom_ ,
	   );

	}
	$store_loc = array();
	if($radius !== null && is_array($radius) && $origin !== null && is_array($origin)){
		
		 foreach ($origin as $org ){
				
		
			$array_latlng_ = array();
			$post_   = get_post( $org );
			$post_type_ = get_post_type( $post_ );

			if($post_type_ == 'szbdorigins'){
	

			$post_id_ = $post_->ID;
    $settings_     = get_post_meta( $post_id_, 'szbdorigins_metakey', true );
				$geo_coordinates_array_ = is_array( $settings_ ) && is_array( $settings_['geo_coordinates'] ) ? $settings_['geo_coordinates'] : array();
		if ( isset( $geo_coordinates_array_[0] ) )
      {
      if (isset( $geo_coordinates_array_[0][0]) && isset($geo_coordinates_array_[0][1]) )
        {
        if ( $geo_coordinates_array_[0][0] != '' && $geo_coordinates_array_[0][1] != '' && is_numeric($geo_coordinates_array_[0][0] ) && is_numeric($geo_coordinates_array_[0][1]) ){
									 $newobject = new stdClass();
   $newobject->lat = (float) $geo_coordinates_array_[0][0];
			 $newobject->lng = (float) $geo_coordinates_array_[0][1];
         
        }
      }
						$store_loc[] = $newobject;
						$is_additional_origin = true;
   
						
						
			}
		
	}
			}
	}
	if( empty($store_loc) && $radius !== null && is_array($radius) && get_option('szbd_store_address_mode','geo_woo_store') == 'geo_woo_store'){
		$store_loc = array(SZBD::get_store_address());
			$is_additional_origin = false;
	}elseif( empty($store_loc) && $radius !== null && is_array($radius) && get_option('szbd_store_address_mode','geo_woo_store') == 'pick_store_address'){

		$store_loc = array(json_decode(get_option('SZbD_settings_test',''),true));
			$is_additional_origin = false;
	}


    $args = array(
	   'ids' => $ids,
    'maps' => $maps,
	   'color' => $color,
				'circle_color' => $circle_color,
	   'title' => $title,
				'zoom' => $zoom,
	   'interactive' => $interactive == 'true' ? 1 : 0,
	   'radius' => is_array($radius)  ? $radius : 0,
	   'radius_unit' => $radius_unit == 'miles' ? $radius_unit : 'kilometer',
	   'store_loc' => $store_loc,
	   'store_address_picked' => (isset($is_additional_origin) && $is_additional_origin) || get_option('szbd_store_address_mode','geo_woo_store') == 'pick_store_address' ? 1 : 0,
    );

    return $args;

    }

static function enqueue_inline(){

	 if ( !wp_script_is('szbd-script-short', 'enqueued'))
        {
			SZBD::enqueue_shortcode_scripts();

}
}
}
