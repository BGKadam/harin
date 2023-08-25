(function() {

    var he_url = 'https://healthengine.com.au';

    var script = 'currentScript' in document && document.currentScript ? document.currentScript : null; // use currentScript if available..


  var widget_setup = function(target) {
        if (!target.parentNode) return; // sometimes this happens

        // allow the widget to treat the current host as the healthengine URL. Allows local debugging of widget in DEV
        if(!!target.getAttribute("data-he-debug")){
          // relative paths
          he_url = '';
        }

        var widid = parseInt(target.getAttribute("data-he-id"),10) || 0; // still need a widget id
        var widspecialty = target.getAttribute("data-he-specialty") || '';
        var widdocid = parseInt(target.getAttribute("data-he-doctor"),10) || 0;

        if (widid > 0) {
            // check not already done (don't need two widgets)
            if (target.previousSibling && target.previousSibling.id === 'he-webplugin-'+widid) return;

            var params = [];
            if (!widspecialty.match(/^ *$/)) {
                params.push('specialty=' + widspecialty);
            }
            if (widdocid > 0) {
                params.push('doctor=' + widdocid);
            }
            params.push('source=webplugin');

            if (typeof ga === 'function') {
                ga(function (tracker) {
                    var linkerParam = tracker.get('linkerParam');
                    if (linkerParam != '') {
                        params.push(linkerParam);
                    }
                });
            }

            var widget_url = he_url + '/webplugin/?id=' + widid + (params.length ? '&' + params.join('&') : '');
            var practice_url = he_url + '/service/' + widid + (params.length ? '?' + params.join('&amp;') : '');

            // show button by preference...
            var fixedonly = !!target.getAttribute('data-he-fixed');
            var buttononly = !!target.getAttribute('data-he-button');
            var embedonly = !!target.getAttribute('data-he-embed');
            var inlineonly = target.getAttribute('data-he-inline') == 'true';

            if (fixedonly) widget_url += '&trigger=button';
            if (buttononly) widget_url += '&trigger=button';
            if (inlineonly) widget_url += '&inlineonly=true';

            // detect touch device...
            var touch_device;
            try {
              document.createEvent("TouchEvent");
              touch_device = true;
            } catch(ex) {
              touch_device = false;
            }

            //retrieve styling options
            var div_class = target.getAttribute('data-he-class') || '';
            var div_style = target.getAttribute('data-he-style') || '';
            var div_background_color = target.getAttribute('data-background-color') || '';
            var div_text_color = target.getAttribute('data-text-color') || '';
            var div_alignment = target.getAttribute('data-alignment') || '';
            var div_button_label = target.getAttribute('data-button-label') || '';

             //create, configure and add container div
            var targetdiv = document.createElement('div');
            targetdiv.id = 'he-webplugin-'+widid;
            targetdiv.className = div_class;
            targetdiv.style.cssText = div_style;

            //Basic button option
            if (!embedonly && !fixedonly && (buttononly || (touch_device && window.outerWidth<=720))) {
                //insert element before target
                target.parentNode.insertBefore(targetdiv, target);

                //Check if popup exists - if not create it
                if (!he_popup_exists(widid)) {
                    he_init_popup(widid,touch_device,widget_url);
                }

                // Create, config and style button object
                var button_text = target.getAttribute('data-he-text') || '';
                var button_class = target.getAttribute('data-he-button-class') || '';
                var button_style = target.getAttribute('data-he-button-style') || '';
                var button;

                if (button_text) {
                    button = document.createElement('a');
                    button.href = practice_url;
                    button.innerHTML = button_text;
                    button.className = button_class;
                    button.style.cssText = button_style;
                } else {
                    // Style tweaks to make anchor wrap image tightly.
                    if (!button_style.match(/display/)) {
                        button_style += ';display:inline-block;';
                    }

                    if (!button_style.match(/line-height/)) {
                        button_style += ';line-height:0;';
                    }

                    if (!button_style.match(/text-decoration/)) {
                        button_style += ';text-decoration:none;';
                    }

                    var imgfile = target.getAttribute('data-he-img') || 'HE_bookapp_1.png';

                    if (!imgfile.match(/(\/|https?:\/\/)/i)) {
                        imgfile = he_url + '/images/widget/' + imgfile;
                    }

                    var image = document.createElement('img');

                    image.alt = 'Book now with Healthengine';
                    image.src = imgfile;

                    button = document.createElement('a');
                    button.className = button_class;
                    button.href = practice_url;
                    button.style.border = 'none';
                    button.style.cssText = button_style;
                    button.style.cursor = 'pointer';

                    button.appendChild(image);
                }

                //Add event handler for basic button
                button.onclick = function(e) {
                    // Disable the default click handler for the popup button
                    if (!e) e = window.event;
                    if (e.preventDafault) e.preventDefault();
                    e.returnValue = false;

                    if (touch_device && window.outerWidth <= 720) {
                        // on phone just open a new window with widget in it.
                        window.open(widget_url);
                    }

                    else {
                        // if existing, just hidden, show...
                        if (he_popup_exists(widid)) {
                            he_show_popup(widid,widdocid);
                        }

                    }
                    return false;
                };
                //Add button to targetDiv
                targetdiv.appendChild(button);
            }


            //Fixed Widget Option -  No targetDiv, can be included anywhere in page body
            else if(!embedonly && !buttononly && fixedonly){


                //Check if popup exists - if not create it
                if (!he_popup_exists(widid)) {
                    he_init_popup(widid,touch_device,widget_url);
                }

                //create static widget container div
                var staticwidget = document.createElement('div');
                staticwidget.className = 'he-book he-widget-container';


                //Check for additional styling options

                //Check for background color
                if(div_background_color!=''){
                    var widget_background_color = div_background_color;
                }

                else{
                    var widget_background_color = "#2c4c59";
                }

                //Check for text color
                if(div_text_color!=''){
                    var widget_text_color = div_text_color;
                }

                else{
                    var widget_text_color = "#FFF";

                    if (isHexColor(widget_background_color)) {
                        var rgb = hexToRGB(widget_background_color);

                        if (isLightBackground(rgb.r, rgb.g, rgb.b)) {
                            widget_text_color = "#000";
                        }
                    }

                    if (isRGBColor(widget_background_color)) {
                        var rgb = widget_background_color.replace(/[^\d,]/g, '').split(',');

                        if (isLightBackground(rgb[0], rgb[1], rgb[2])) {
                            widget_text_color = "#000";
                        }
                    }
                }

                //check alignment
                if(div_alignment!=''){
                    var widget_alignment = div_alignment;
                }

                else{
                    var widget_alignment = 'right';
                }

                //check button label
                if(div_button_label!=''){
                    var widget_button_label = div_button_label;
                }

                else{
                    var widget_button_label = 'Book appointment';
                }

                var ua = navigator.userAgent;
                var msie = ua.indexOf("MSIE ");
                var trident = ua.indexOf("Trident/");
                var edge = ua.indexOf("Edge/");

                var browser = {
                    isIe: function () {
                        return (msie != -1|| trident != -1 || edge != -1);
                    },
                    useragent: navigator.userAgent,
                    getVersion: function() {
                        var version = 999; // we assume a sane browser
                        if (msie != -1) {
                            // bah, IE again, lets downgrade version number
                            version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                        } else if (trident != -1) {
                            var rv = ua.indexOf('rv:');
                            version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                        } else if (edge != -1) {
                            varsion = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
                        }
                        return version;
                    }
                };
                //add relevant styles and html
                if (browser.isIe() && browser.getVersion() <= 9) {
                    // IE 9 or older
                    staticwidget.innerHTML ='<style type="text/css">.he-widget-container,.he-popup{display:none !important;}</style>';
                } else {
                    staticwidget.innerHTML ='<style type="text/css">.he-popup{transition:all 0.2s ease;visibility:hidden;opacity:0;display:none;}.he-popup.visible{visibility:visible;opacity:1.0}.he-frame-container{transition:all 0.2s ease;-webkit-transform:translateY(-40px);-moz-transform:translateY(-40px);-ms-transform:translateY(-40px);-o-transform:translateY(-40px)}.he-popup.visible .he-frame-container{transition:all 0.2s ease;-webkit-transform:translateY(-0px);-moz-transform:translateY(-0px);-ms-transform:translateY(-0px);-o-transform:translateY(-0px)}.he-row h2{float: left;font-size: 18px;user-select: none;font-weight: 400;padding: 0 !important;margin: 7px 10px !important;line-height: 1;font-family: Arial, Helvetica, sans-serif;color: '+widget_text_color+';}#he-calendar-icon{transition:all 0.2s ease;width:28px;height:28px;float:left;opacity:0.4;margin-top:2px;margin-left:10px}.he-widget-container:hover #he-calendar-icon{opacity:0.7 !important}.he-widget-container{color:'+widget_text_color+';opacity:1;box-shadow:0 10px 20px rgba(0, 0, 0, 0.5);transition:all 0.2s ease;position:fixed;bottom:-20px;'+widget_alignment+':15px;width:280px;height:110px;overflow:hidden;visibility:visible;border-radius:5px 5px 0px 0px;background:'+widget_background_color+';cursor:pointer;border:0px;z-index:9998;box-sizing:border-box;font-family:"Source Sans Pro",sans-serif;  transition: all 0.2s ease;-webkit-transform: translateY(-0px);-moz-transform: translateY(-0px);-ms-transform: translateY(-0px);-o-transform: translateY(-0px);} .he-widget-container.active{transition: all 0.2s ease;-webkit-transform: translateY(40px);-moz-transform: translateY(40px);-ms-transform: translateY(40px);-o-transform: translateY(40px);opacity:0;}.he-widget-container:hover{}#he-poweredby-container{width:100%;height:50px;padding-top:8px;background-color:rgba(0,0,0,0.1);}#he-poweredby-img{float:left;width:94px;height:19px;margin-left:7px}#he-poweredby-text{float:left;font-size:14px;font-weight:100;margin-left:25px;opacity:0.9}@media (max-width: 600px){.he-widget-container{width:100% !important;right:0px !important; left:0px !important; border-radius:0px !important}.he-widget-container:hover{}}</style><div class="he-row" style="margin: 15px;margin-bottom: 10px;"> <img id="he-calendar-icon" src="'+he_url+'/images/widget/calendar.png"><h2>'+widget_button_label+'</h2><div style="clear: both;"></div></div><div class="he-row" id="he-poweredby-container"><div id="he-poweredby-text"> Powered By</div><img id="he-poweredby-img" src="https://healthengine.imgix.net/public/images/he-logo-white_20210818061515.svg?auto=compress"><div style="clear: both;"></div></div>';
                }

                document.getElementsByTagName('body')[0].appendChild(staticwidget);


                //Add event handler widget
                staticwidget.onclick = function(e) {

                    // Disable the default click handler for the popup button
                    if (!e) e = window.event;
                    if (e.preventDafault) e.preventDefault();
                    e.returnValue = false;

                    if (touch_device && window.outerWidth <= 720) {
                        // on phone just open a new window with widget in it.
                        window.open(widget_url);
                    }

                    else {
                        //Add active class
                        staticwidget.classList.add('active');
                        // if existing, just hidden, show...
                        if (he_popup_exists(widid)) {
                            he_show_popup(widid,widdocid);
                        }

                    }
                    return false;
                };

                //apend widget to page
                document.getElementsByTagName('body')[0].appendChild(staticwidget);
            }

            //Calendar Option
            else {
                //insert element before target
                target.parentNode.insertBefore(targetdiv, target);

                // add iframe...
                var width = target.getAttribute('data-he-width') || '100%';
                var height = target.getAttribute('data-he-height') || '500';
                var extracss = target.getAttribute('data-he-frame-css') || 'border: 2px solid #045475';
                var profileLink = target.getAttribute('data-he-profile-link') !=='false';

                targetdiv.innerHTML = '<iframe src="'+encodeURI(widget_url)+'" width="'+width+'" height="'+height+'" class="he-webplugin" name="open-appointments-widget-' + widid + '" frameborder="0" style="'+extracss+'"></iframe>'
                    + (profileLink ? '<p style="font-size:14px; font-family:Helvetica, Arial, sans-serif; margin-left:10px; color:#666 !important; margin:20px 0 0 0;">View our profile on <a style="color:#008ec7 !important;" href="'+practice_url+'" target="_blank">Healthengine.com.au</a></p>' : '');
            }
        }
    };

    var he_popup_exists = function (widid){
        var popup = document.getElementById('he-webplugin-popup-' + widid);

        if(!popup){
            return false;
        }

        else{
            return true;
        }
    }

    var he_init_popup =function(widid,touch_device,widget_url){
        var ieold = navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 8.")!=-1 || navigator.appVersion.indexOf("MSIE 9.")!=-1;
        // not compatible with IE9 or older
        if (ieold) return;

        // otherwise create lightbox popup
        popup = document.createElement('div'); // background overlay
        popup.id = 'he-webplugin-popup-' + widid;

        // Overlay styling
        /*popup.style.display = 'none';*/
        popup.style.position = "fixed";
        popup.style.zIndex = "9999";
        popup.style.width = "100%";
        popup.style.height = "100%";
        popup.style.textAlign = "center";
        popup.style.top = "0";
        popup.style.left = "0";
        popup.className = "he-popup";
        //add animation class


        // Overlay tranparent background
        popup.style.backgroundColor = "rgba(0,0,0,0.6)";

        // Click event to hide the overlay
        popup.onclick = function() {
            he_hide_popup(popup);
        };

        popup.innerHTML = '<style type="text/css"> .he-popup{ transition: all 0.2s ease; visibility:hidden;opacity:0;display: none;} .he-popup.visible{visibility: visible;opacity:1.0;} .he-frame-container{transition: all 0.2s ease;-webkit-transform: translateY(-40px);-moz-transform: translateY(-40px);-ms-transform: translateY(-40px);-o-transform: translateY(-40px); transform: translateY(-40px); } .he-popup.visible .he-frame-container{transition: all 0.2s ease;-webkit-transform: translateY(-0px);-moz-transform: translateY(-0px);-ms-transform: translateY(-0px);-o-transform: translateY(-0px); transform: translateY(-0px);}</style>'+'<div style="height: 10%;"></div>'+
                            '<div class="he-frame-container" style="margin: 0 auto; width: '+(window.outerWidth<=720?'100%':'80%')+';max-width: 1080px; height: 80%; filter: none;'+(touch_device?' overflow: auto; border-radius: 5px;box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); -webkit-overflow-scrolling: touch':'')+'">'+
                            '<iframe width="100%" height="100%" src="'+encodeURI(widget_url)+'" name="open-appointments-widget-' + widid + '" style="box-sizing: border-box; -webkit-box-sizing: border-box; border-radius: 5px; padding: 20px; border: none; background: white;"></iframe></div>';

        popup.getElementsByTagName('iframe')[0].onclick = function(e) { // prevent click events propagating though the iframe
            if (!e) e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        };

        // Prevent background scrolling in touch devices
        if (touch_device) {
            try {
                popup.addEventListener('touchmove', function(e){e.stopPropagation();e.preventDefault();}, false);
            } catch(ex) {}
        }

        // Insert the overlay into the DOM after all existing body elements
        document.getElementsByTagName('body')[0].appendChild(popup);
    }

    // Hide Popup
    var he_hide_popup = function (popup){

        popup.classList.remove('visible');
        window.setTimeout(function() { popup.style.display = 'none'; }, 300)
        if (document.getElementsByClassName('he-widget-container')[0]) {
            document.getElementsByClassName('he-widget-container')[0].classList.remove('active');
        }
    }

    // Show Popup
    var he_show_popup = function (widid,widdocid){
        if (widdocid > 0)
            {
                frames['open-appointments-widget-' + widid].postMessage('changePractitioner:' + widdocid, he_url);
            }
        popup = document.getElementById('he-webplugin-popup-' + widid);
        if (popup) {
            popup.style.display = 'block';
            window.setTimeout(function() { popup.classList.add('visible'); }, 100);
        }
        return;
    }



    /* Load the widget after the page is ready */
    var readyStateCheckInterval = setInterval(function(){
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            if (script) {
                widget_setup(script);
            } else {
                var scripts = (document.body || document).getElementsByTagName("script"); // fallback to get all scripts...
                for (var c = 0, len = scripts.length ; c < len ; c++) {
                    widget_setup(scripts[c]);
                }
            }
        }
    }, 100);

    var isHexColor = function(hex) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
    };

    var isRGBColor = function(color) {
        return /(^rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}[)]$)/i.test(color);
    };

    var hexToRGB = function(hex) {
        // Remove #
        hex = hex.replace(/^#+/i, '');

        if (hex.length == 3) {
            hex = convertTripletHexToFullHex(hex);
        }

        var r = parseInt(hex.substring(0,2), 16);
        var g = parseInt(hex.substring(2,4), 16);
        var b = parseInt(hex.substring(4,6), 16);

        return {
            r: r,
            g: g,
            b: b
        }
    };

    var convertTripletHexToFullHex = function(hex) {
        return hex[0] + hex [0] + hex[1] + hex[1] + hex[2] + hex[2];
    };

    var isLightBackground = function(r, g, b) {
        return getContrast(r, g, b) > 125;
    };

    var getContrast = function(r, g, b) {
        //https://www.w3.org/TR/AERT/#color-contrast
        return ((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000;
    };
})();