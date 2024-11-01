<?php

if (!defined('ABSPATH'))
  {
  exit;
  }
if (!class_exists('SZbD_Settings')):
  function SZbD_Add_Tab($settings)
    {
    class SZbD_Settings extends WC_Settings_Page
      {
      public function __construct()
        {
        $this->id    = 'szbdtab';
        $this->label = __('Shipping Zones by Drawing', 'szbd');
        add_filter('woocommerce_settings_tabs_array', array(
          $this,
          'add_settings_page'
        ), 20);
		   add_action('woocommerce_sections_' . $this->id, array(
          $this,
          'output_sections'
        ));
        add_action('woocommerce_settings_' . $this->id, array(
          $this,
          'output'
        ));
        add_action('woocommerce_settings_save_' . $this->id, array(
          $this,
          'save'
        ));



        add_action('woocommerce_admin_field_szbdtab', array(
                    $this,
                    'szbd_admin_field_szbd_show_test'
                ));
        }
         public function szbd_admin_field_szbd_show_test() {

?>

<div id="szbd-pick-content"> <button type="button" class="button-secondary" id="szbd-test-address"><?php _e('Try to Geolocate and Pick the WooCommerce Store Address', 'szbd')?></button>
	<div class="szbd-admin-map"> <span id="szbd-test-result">


       </span> <input id="szbdzones_address" class="controls" type="textbox" value="" size="35" placeholder="<?php echo esc_attr(__('Search location...', 'szbd'))?>" />
		<div id="szbd_map"> </div>
	</div> <input type="hidden" class="insert" name="SZbD_settings_test" id="szbd_store_location" value="" /> </div>

    <?php
         }
      public function get_sections()
        {
        $sections = array(
          '' => __('Settings', 'szbd'),
          'advanced' => __('Advanced', 'szbd'),
          'second' => __('Draw Shipping Zones', 'szbd'),
         
        );
        return apply_filters('woocommerce_get_sections_' . $this->id, $sections);
        }

      public function save()
        {
        global $current_section;
        $settings = $this->get_settings($current_section);
        WC_Admin_Settings::save_fields($settings);
        }
      public function output()
        {
        global $current_section;
        $settings = $this->get_settings($current_section);
        WC_Admin_Settings::output_fields($settings);
        }
      public function get_settings($current_section = '')
        {
        if ('second' == $current_section)
          {
          wp_safe_redirect('edit.php?post_type=szbdzones');
          }
        else
          {

            if(plugin_basename(__FILE__) == "shipping-zones-by-drawing-premium/classes/class-szbd-settings.php"){
          include(plugin_dir_path(__DIR__) . 'includes/start-args-prem.php');
            }else{
                 include(plugin_dir_path(__DIR__) . 'includes/start-args.php');
            }
             if ('advanced' == $current_section)
          {
         $settings = apply_filters('szbd_section1_settings', $settings_args_advanced);
          }
          else{
            $settings = apply_filters('szbd_section1_settings', $settings_args);
          }
          }
        return apply_filters('woocommerce_get_settings_' . $this->id, $settings, $current_section);
        }

      }
	  $settings[] = new SZbD_Settings();
    return $settings;
    }
  add_filter('woocommerce_get_settings_pages', 'SZbD_Add_Tab', 15);
endif;
