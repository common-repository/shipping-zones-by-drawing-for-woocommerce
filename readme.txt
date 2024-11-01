=== Shipping Zones by Drawing for WooCommerce ===
Contributors: arosoft
Donate link: https://paypal.me/arosoftdonate
Tags: home delivery, shipping, area, woocommerce, map, draw
Requires at least: 6.0
Tested up to: 6.6
Stable tag: 3.1.2.4
Requires PHP: 7.4
License: GPL v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Shipping Zones by Drawing allows you to draw your own shipping areas in WooCommerce.
By delegating a drawn shipping area to a WooCommerce shipping method you can define a shipping cost for every zone.


== Description ==

Shipping Zones by Drawing allows you to draw your shipping areas into a map and use them with WooCommerce. You will no more be limited by zip code level when defining a shipping zone.
By connecting a drawn shipping area to a WooCommerce shipping method you can define a shipping cost for every zone.
Limiting shipping methods by a transportation radius from your store location is also possible.

To get knowledge of WooCommerce shipping zones and methods, we recommend a visit to the [WooCommerce Shipping Zones Documentation](https://docs.woocommerce.com/document/setting-up-shipping-zones/). Remember that the drawn shipping areas will be added as shipping methods to WooCommerce.
If you are experiencing problems with the address validation for your country on the checkout page, please report it in the forum.

To use the plugin with extended functionality, there is a [premium version](https://shippingzonesplugin.com/) available.



== Installation ==

1. After activation, go to WooCommerce -> Settings -> Shipping Zones by Drawing.
2. You will need to enter a Google Maps API Key. (Maps JavaScript API, Places API, Geocoding API, Directions API)
3. Now, go to WooCommerce -> Shipping Zones by Drawing and draw a shipping zone.

Now you are ready to set up your WooCommerce shipping zones and methods at WooCommerce -> Settings -> Shipping.
Add your drawn shipping area as a WooCommerce Shipping Method into a WooCommerce Shipping Zone.

Remember that WooCommerce always chooses the first WooCommerce shipping zone that matches an address. So remember to put all your drawn shipping methods per country/region / postal code in the same WooCommerce shipping zone.

To get knowledge of WooCommerce shipping zones and methods, we recommend a visit to [WooCommerce Shipping Zones Documentation](https://docs.woocommerce.com/document/setting-up-shipping-zones/)

That is all.

== Frequently Asked Questions ==

= Why doesn't my drawn shipping methods show up at checkout? =

Remember that WooCommerce always chooses the first shipping zone that matches an address. So remember to put all your drawn shipping methods per country/region/postcode in the same shipping zone.
= Is it possible to add more than one zone? =

Yes, five zones. But you draw as many you like with the premium version of the [Shipping Zones by Drawing](https://shippingzonesplugin.com/).

= Which APIs of Google are needed? =

Your Google API key needs the Maps JavaScript API, Places API, Geocoding API, Directions API .

= Is there any way to display a delivery map to customers? =

Yes, use shortcode [szbd ids="id1,id2" title="Delivery Zones" color="#c87f93, red"] to display a delivery map.

 The arguments are:
 ids - a list of drawn maps by post ids
 radius - a list of radii that draws circles
 circle_color - a list of colors of the circles (optional)
 radius_unit - kilometer or miles, (optional, kilometer is the default)
 title - the map's title to display above the map (optional)
 color - a list of colors of the delivery zones polygons (optional)
 interactive - set to "true" if to enable user map interaction (optional, default is false)


== Changelog ==

= 3.1.2.4 =

* Fix: The filter "woocommerce_shipping_methods" now always returns methods.

= 3.1.2.3 =

* Fix: Blocks checkout methods filter failure.

= 3.1.2.2 =

* Improvement: Shipping methods filter improvement for blocks checkout.

= 3.1.2.1 =

* Improvement: Reduce the amount of Google requests.

= 3.1.2 =

* New: Ability to save google server requets in to a log file.
* New behavior: Never try to geolocate shipping methods if a category condition is not fulfilled.

 = 3.1.1 =

* Fix: Google script loading is now made dynamic.

= 3.0.10 = 

* Fix: Removed loading script async parameter.

= 3.0.9 =

Fix: Removed underscore methods from blocks.

= 3.0.8 =

Compatibility: Updated compatibility with WooCommerce 9.

= 3.0.7 =

Fix: Clear shipping rate cache when updating customer on blocks checkout.

= 3.0.6 =

Compatibility fix: Requests from the "Check My Address" extension were affected by the current Food Online delivery session.

= 3.0.5 =

New policy: Google requests from server never uses client API Key (formerly the 1st key).


= 3.0.4.2 = 

Fix: Clear shipping location data when choosing pickup location on blocks checkout

= 3.0.4.1 =

Fix: Removed underscore methods from blocks

= 3.0.4 =

Fix: Import Lodash library into blocks

= 3.0.3.1 = 

Fix: Missing file

= 3.0.3 = 

Fix: Picked delivery location display twice at ThankYou page

= 3.0.1 =

Fix: Component request string for Google calculations
Fix: Intergration with method selection block on checkout page

= 3.0 =
MAJOR UPDATE - Please back up your installation before upgrading

New Features: Ability to show an info message on checkout when no methods are available
New behavior: Google requests from the server now using address components for better accuracy. This can be disabled by using the new filter "exprimental_szbd_piped_request" and returning FALSE

Compatibility: Compatible with WooCommerce blocks checkout
Fix: Show only one shipping method with minimum cost when running in server mode

= 2.8.12 =

Fixes: Bug fixes regarding checkout map and plus code.

= 2.8.11 =

Fix: Bug fixes

= 2.8.9 =

Important change: It is now default to run the plugin in server mode.
Backward compatibility: Compatibility with older WC versions where OrderUtil class is not defined.

= 2.8.8 =

Compatibility: Compatibility with High-Performance Order Storage (HPOS) (BETA)
 
= 2.8.7 =

Fix: Modify the address format for Chile to be Google compatible

= 2.8.6 =

New: Updated [szbd] shortcode arguments

= 2.8.5 =

Fix: Google Maps requires callback function on initiation

= 2.8.4.3.1 =

Fix: Google Maps now use v3 where a callback function is not required

= 2.8.4.3 =

Compatibility: Compatibility with Elementor Pro 3.7 & Eelementor 3.5. (native JS events)

= 2.8.4.2 =

Improvement: Blocks Checkout improved compatibility
Compatibility: Food Online Premium 5.4.1.10


= 2.8.4.1 =

Compatibility: Food Online Premium 5.4.1
Improvement: Blocks Checkout basic compatibility

= 2.8.4 =

Compatibility: WordPress 6.1 & WooCommerce 7.1
Improvement: Checkout map & marker behavior

= 2.8.3 =

Fix: Geolocation of store address when running in server mode


= 2.8.2.4 =

Development: Shipping method filtering compatible with block checkout.

= 2.8.2 =

Fix: Unregister szbdzones post type on plugin deactivation

= 2.8.1 =

Bug Fix: Calculation of shipping rate depending of package weight

= 2.8.0 =

New: Option to run the plugin in server -mode. All method filtering performs at the server.
New: Possibility to use cart weight as an argument when defining a shipping flat rate.


= 2.7.0.1 =

Bugfix: Error geolocating shop address when wc shipping isn´t initiated

= 2.7.0 =
 
 
* Fixes: Minor bug fixes and adjustments

= 2.6.0.1 =

Fix: Trailing whitespace may cause incorrect output

= 2.6.0 =

New: Option to enable geo-calculations on cart page
New option: Restrict shipping methods by product categories

= 2.5.9 =

Improvement: Added wp noces to ajax requests

= 2.5.8 =

Improvement: Monitoring of when shortcode [szbd] is inserted into DOM now waits until map is visible

= 2.5.7 =

Improvement: New advanced option to monitor and initialize when shortcode [szbd] is inserted into DOM

= 2.5.6 =

Improvement: More efficient way to geolocate checkout map center points

= 2.5.5 =

Fix: Reset chosen map location when set/unset "Ship to different address?"
Dev: Bind shipping method list by element id ("shipping_method") and try with wildcard if this id does not exist

= 2.5.4 =

Compatibility: Compatibility with Food Online 5
Fix: Hide map on checkout when geolocation is not necessary

= 2.5.3 =

Bug Fix: Failure when shipping methods have class costs

= 2.5.2 =

New: Support for use of shortcodes [qty] & [fee] when defining a flat rate for a “Shipping zones by drawing” shipping method
New Option: Added option “Mandatory to precise at map”. This feature adds the possibility to force customers to use the map at checkout to precise their delivery location
Improvement: Major improvement when geolocating to always display the most relevant map at checkout
Dev: Updated checkout javascript file with increased stability and bug fixes

= 2.4.6.1 =

Improvement: Tries to not load Google Maps js if it is already loaded

= 2.4.6 =

Fix: Shortcode [szbd] with radius argument do not show
New: Argument radius_unit added for shortcode [szbd]
Fix: Removes empty locality component restrictions

= 2.4.5 =

Fix: Removed js arrow functions for improvement of browser compatibility.

= 2.4.4 =

Shortcode class [szbd] and javascript methods updated to allow multiple maps at same page

= 2.4.3.3.2 =

Updated compatibility WP 5.6 and WooCommerce 4.8


= 2.4.3.3.1 =

Bug fix: Shipping methods disappears from checkout when location is picked from map and methods are re-selected more than one time

= 2.4.3.3 =

Resolved naming conflict add to email filter

= 2.4.3.2 =

Bug Fix: Map for delivery location don´t show when Food Online plugin is installed

= 2.4.3.1 =

Bug Fix: Compatibility with Food Online when store address needs to be geolocated

= 2.4.3 =

Bug Fix: Radius methods fail at rare cases
Do not run js at order-pay endpoint page

= 2.4.2 =

Compatibility with Food Online 4.1

= 2.4 =

New Feature: As option, let user pick delivery location from map when a street address can´t be geolocated

= 2.3.2 =

New use of color argument for the [szbd] shortcode

= 2.3.1 =

WordPress 5.5 compatibility

= 2.3 =

New option on how to define the store location
New advanced option to force shortcode [szbd]. May be needed if showing the shortcode in popups etc.
New argument "radius" to the shortcode [szbd]. Display a circle with specified radius
Improved compatibility (with 3rd party plugins) when checkout fields like "Country" are removed from the checkout page

= 2.2.3 =

Improved evaluation of customer default address

= 2.2.2 =

Improved error handling at checkout along with 3rd party plugins

= 2.2 =

Impoved error handling at checkout
Improved messages at checkout

= 2.1.6 =

Improved compatibility with jQuery 3
Bug Fix: Feature "Select Top Shipping Method"

= 2.1.5 =

New option: Top sorted shipping method will be chosen at checkout
= 2.1.4 =

Bug fix: Checkout error when cart only consists of non shippable products

= 2.1.3 =

Added option to deactivate postcode restriction

= 2.1.2 =

Added shortcode argument 'interactive' to enable user interaction at the delivery map
Improved support for addresses in Poland

= 2.1.1 =

Bug Fix: Shortcode [szbd] map placed in wrong place
Store addresses accept establishment and route as geolocation types


= 2.1 =

Allowing Google responses with route types
Improved compatibility for Brazilian addresses

= 2.0.9 =

Now allowing geocode reults with establishment types

= 2.0.8 =

Better compatibility with states in some countries
Added support to use shipping classes

= 2.0.7 =

Bug fix: rounding rates

= 2.0.6 =

Added column in edit to show post ids.

= 2.0.5 =

Added shortcode [szbd] to display drawn delivery zones front end.
Example [szbd ids="post_id1,post_id2" title="Delivery Zones" color="#c87f93"]

= 2.0.4 =

Better compatibility when checkout is done stepwise (with external plugins)
Better compatibility with addresses in Angola

= 2.0.3.2 =

Better compatibility with checkout form where some fields are disabled

= 2.0.3.1 =

Better compatibility with addresses in Russia

= 2.0.3 =

Further improved backwards compatibility with shipping methods created prior to version 2.0.0
Better checkout perfomance.

= 2.0.2 =

Improved backwards compatibility with shipping methods created prior to version 2.0.0

= 2.0.0 =

* MAJOR UPDATE,  CHECK & SAVE SETTINGS BEFORE YOU GO LIVE

* Updated core for better performance.
* Ability to limit shipping by a radius distance from the store address.
* Ability to choose the tax status of the shipping cost.
* Ability to choose title of shipping methods shown at checkout.

= 1.1.4 =

* Better compatibility for addresses in Romania.
* Improved address validation.

= 1.1.3 =

* Better compatibility for addresses in Canada.

= 1.1.2 =

* Fix: Version control of javascript files


= 1.1.1 =

* Bug fix not showing shipping methods at checkout correctly

= 1.1.0.1 =

* Bug fix

= 1.1.0 =

* Possibility to draw up to 5 zones.

= 1.0.10 =

* Better compatibility for addresses in Israel.

= 1.0.8.1 =

* Minor javascript fix

= 1.0.8 =

* Added option to hide shipping cost at cart page.
* Visual improvement of the checkout page behavior.

= 1.0.7 =
* Javascript bugfix at checkout

= 1.0.6 =
* Enabled map drawing with more than 4 coordinates

= 1.0.5 =
* Added option to disable Google Maps API script loading

= 1.0.4 =
* Improved compability for network installation (multisite)

= 1.0.3 =
* Bug fix: Edit link from settings page

= 1.0.2 =

* Bug fix: file path reference

= 1.0.1 =

* Bug fixes

= 1.0.0 =

* Initial release

== Screenshots ==

1. Draw your shipping zone

2. At checkout

3. Add as shipping method

4. Add your delivery map to a shipping method
