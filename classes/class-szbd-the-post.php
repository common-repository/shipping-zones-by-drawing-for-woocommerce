<?php
if (!defined('ABSPATH'))
  {
  exit;
  }
class Sbdzones_Post
  {
  private static $stop = false;
  public function __construct()
    {
    add_action('init', array(
      $this,
      'register_post_szbdzones'
    ));
    add_action('registered_post_type', array(
      $this,
      'eval_caps'
    ), 99, 2);
    }
  public function register_post_szbdzones()
    {
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
      'create_posts' => 'edit_szbdzones'
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
    register_post_type(SZBD::POST_TITLE, $args);
    }
  function eval_caps($post_type, $args)
    {
    if (SZBD::POST_TITLE === $post_type && self::$stop == false)
      {
         if(plugin_basename(__FILE__) == "shipping-zones-by-drawing-premium/classes/class-szbd-the-post.php"){
          include(plugin_dir_path(__DIR__) . 'includes/start-args-prem.php');
            }else{
                 include(plugin_dir_path(__DIR__) . 'includes/start-args.php');
            }

      self::$stop = true;
      register_post_type(SZBD::POST_TITLE, $args);
      }
    }
  }

