<?php
if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('SZBD_Google_Server_Requests')) {
class SZBD_Google_Server_Requests {

    const API_URL = 'https://maps.googleapis.com/maps/api/directions/json';
    
    const API_URL_GEOCODE = 'https://maps.googleapis.com/maps/api/geocode/json';

    public $api_key;

    public $debug;

    

    public function __construct($api_key) {
      $this->api_key = $api_key;

    }

    private function perform_request($params,$mode = 'directions') {
       try{
      $args = array(
        'timeout' => 4, // Default to 3 seconds.
        'redirection' => 0,
        'httpversion' => '1.0',
        'sslverify' => true,
        'blocking' => true,
        'user-agent' => 'PHP ' . PHP_VERSION . '/WooCommerce ' . get_option('woocommerce_db_version') ,
      );
      
      $api_url = $mode == 'geocode' ? self::API_URL_GEOCODE : self::API_URL; 

      $response = wp_remote_get($api_url  . '?' . (!empty($this->api_key) ? 'key=' . $this->api_key . '&' : '') . $params, $args);
      if (is_wp_error($response)) {
        
        throw new Exception('request error');
      }

      if (get_option('szbd_debug', 'no') == 'yes' ) {
       
        parse_str($params, $params_debug);
      
        $date = current_datetime();
        $row0 = $date->format('H:i:s');
        $row1 = 'SERVER to GOOGLE CALL:';
        $row2 = 'URL:' .$api_url;
        $request_string = 'REQUEST STRING:'.$params;
        
        $row3 = 'Request: ' . print_r($params_debug, true) ;
      
        $row4 = 'Response:' . print_r($response['body'], true) ;
        if(is_ajax()){
         wc_add_notice( print_r($row0. '  '.$row1.' '.$row2.' '.$request_string.' '.$row3.' '.$row4,true), 'notice');
        }
        else if( !is_checkout() && !is_cart()){

          WC()
          ->session
          ->set('szbd_server_request_debug',print_r($row0. '  '.$row1.' '.$row2.' '.$request_string.' '.$row3.' '.$row4,true));
        }else{

        self::console_debug($row0,$row1,$row2,$request_string,$row3 ,$row4 );
        }
        

       
       

      }

      

      return $response;
    }catch (Exception $e) {
        return $e;
    }
    }

    public function get_distance($origin, $destination_, $mode, $avoid = '', $units = 'metric', $region = false) {

      $params = array();

      $params['origin'] = $origin;
      if(is_array($destination_)){
        $destination = $destination_[0] .',' . $destination_[1];
        
      }else{
        $destination = $destination_;
      }
      $params['destination'] = $destination;
      $params['mode'] = $mode;
      if (!empty($avoid)) {
        $params['avoid'] = $avoid;
      }
      $params['units'] = $units;

      if (!empty($region)) {
        $params['region'] = $region;
      }

      $params = http_build_query($params);
      
      
      $response = $this->perform_request($params);
      $distance = json_decode($response['body']);
       
       
       

      

      return $distance;
    }
     public function get_location($location_address,$location_components, $region = false) {
      $components = array();
      $params = array();
      $params['address'] = $location_address;
      if( !is_null($location_components )){
        $params['components'] = $location_components;
      }
      
     
     

      if (!empty($region)) {
        $params['region'] = $region;
      }

      $params = http_build_query($params);
      $response_ = $this->perform_request($params,'geocode');
      $response_ = is_a( $response_, 'Exception') ? array('body'=>'') : $response_;
      $response = json_decode($response_['body']);

      return $response;
    }

    static function console_debug($time,$output1,$output2,$request, $output3, $output4, $with_script_tags = true) {
      $output = $time.$output1.$output2.$request.$output3.$output4;
      $js_code = 'console.debug(' . json_encode($output, JSON_HEX_TAG) .
      ');';
      if ($with_script_tags) {
      $js_code = '<script>' . $js_code . '</script>';
      }
    
        echo $js_code;
    
     
      }
  }
}
