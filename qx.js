﻿/**
 * Loader
 */
(function () {

    window.qx = window.qx || {};

    qx.$$start = new Date();
    qx.$$environment = qx.$$environment || {};

    var envinfo = { "qx.application": "qx.Application", "qx.revision": "", "qx.debug": false, "qx.debug.ui.queue": false, "qx.rtl.supported": true, "qx.theme": "qx.theme.Simple", "qx.dynlocale": false, "qx.version": "5.1" };
    for (var k in envinfo) qx.$$environment[k] = envinfo[k];

    qx.$$libraries = {};
    qx.$$resources = {};
    qx.$$translations = { "C": {}, "en": {} };
    qx.$$locales = { "C": null, "en": null };
    qx.$$packageData = {};
    qx.$$g = {};

    qx.$$loader = {
        parts: {},
        packages: {},
        urisBefore: [],
        cssBefore: [],
        boot: "",
        closureParts: {},
        bootIsInline: false,
        addNoCacheParam: false,

        decodeUris: function (compressedUris) {
        	var libs = qx.$$libraries;
        	var uris = [];
        	for (var i = 0; i < compressedUris.length; i++) {
        		var uri = compressedUris[i].split(":");
        		var euri;
        		if (uri.length == 2 && uri[0] in libs) {
        			var prefix = libs[uri[0]].sourceUri;
        			euri = prefix + "/" + uri[1];
        		} else {
        			euri = compressedUris[i];
        		}
        		if (qx.$$loader.addNoCacheParam) {
        			euri += "?nocache=" + Math.random();
        		}

        		uris.push(euri);
        	}
        	return uris;
        }
    };

    var cldrMap = {
        "alternateQuotationEnd": "’",
        "alternateQuotationStart": "‘",
        "cldr_am": "AM",
        "cldr_date_format_full": "EEEE, MMMM d, y",
        "cldr_date_format_long": "MMMM d, y",
        "cldr_date_format_medium": "MMM d, y",
        "cldr_date_format_short": "M/d/yy",
        "cldr_date_time_format_EHm": "E HH:mm",
        "cldr_date_time_format_EHms": "E HH:mm:ss",
        "cldr_date_time_format_Ed": "d E",
        "cldr_date_time_format_Ehm": "E h:mm a",
        "cldr_date_time_format_Ehms": "E h:mm:ss a",
        "cldr_date_time_format_Gy": "y G",
        "cldr_date_time_format_GyMMM": "MMM y G",
        "cldr_date_time_format_GyMMMEd": "E, MMM d, y G",
        "cldr_date_time_format_GyMMMd": "MMM d, y G",
        "cldr_date_time_format_H": "HH", "cldr_date_time_format_Hm": "HH:mm",
        "cldr_date_time_format_Hms": "HH:mm:ss", "cldr_date_time_format_M": "L",
        "cldr_date_time_format_MEd": "E, M/d", "cldr_date_time_format_MMM": "LLL",
        "cldr_date_time_format_MMMEd": "E, MMM d", "cldr_date_time_format_MMMd": "MMM d",
        "cldr_date_time_format_Md": "M/d", "cldr_date_time_format_d": "d",
        "cldr_date_time_format_h": "h a", "cldr_date_time_format_hm": "h:mm a",
        "cldr_date_time_format_hms": "h:mm:ss a", "cldr_date_time_format_ms": "mm:ss",
        "cldr_date_time_format_y": "y", "cldr_date_time_format_yM": "M/y",
        "cldr_date_time_format_yMEd": "E, M/d/y", "cldr_date_time_format_yMMM": "MMM y",
        "cldr_date_time_format_yMMMEd": "E, MMM d, y",
        "cldr_date_time_format_yMMMd": "MMM d, y",
        "cldr_date_time_format_yMd": "M/d/y",
        "cldr_date_time_format_yQQQ": "QQQ y",
        "cldr_date_time_format_yQQQQ": "QQQQ y",
        "cldr_day_format_abbreviated_fri": "Fri",
        "cldr_day_format_abbreviated_mon": "Mon",
        "cldr_day_format_abbreviated_sat": "Sat",
        "cldr_day_format_abbreviated_sun": "Sun",
        "cldr_day_format_abbreviated_thu": "Thu",
        "cldr_day_format_abbreviated_tue": "Tue",
        "cldr_day_format_abbreviated_wed": "Wed",
        "cldr_day_format_short_fri": "Fr",
        "cldr_day_format_short_mon": "Mo",
        "cldr_day_format_short_sat": "Sa",
        "cldr_day_format_short_sun": "Su",
        "cldr_day_format_short_thu": "Th",
        "cldr_day_format_short_tue": "Tu",
        "cldr_day_format_short_wed": "We",
        "cldr_day_format_wide_fri": "Friday",
        "cldr_day_format_wide_mon": "Monday",
        "cldr_day_format_wide_sat": "Saturday",
        "cldr_day_format_wide_sun": "Sunday",
        "cldr_day_format_wide_thu": "Thursday",
        "cldr_day_format_wide_tue": "Tuesday",
        "cldr_day_format_wide_wed": "Wednesday",
        "cldr_day_stand-alone_narrow_fri": "F",
        "cldr_day_stand-alone_narrow_mon": "M",
        "cldr_day_stand-alone_narrow_sat": "S",
        "cldr_day_stand-alone_narrow_sun": "S",
        "cldr_day_stand-alone_narrow_thu": "T",
        "cldr_day_stand-alone_narrow_tue": "T",
        "cldr_day_stand-alone_narrow_wed": "W",
        "cldr_month_format_abbreviated_1": "Jan",
        "cldr_month_format_abbreviated_10": "Oct",
        "cldr_month_format_abbreviated_11": "Nov",
        "cldr_month_format_abbreviated_12": "Dec",
        "cldr_month_format_abbreviated_2": "Feb",
        "cldr_month_format_abbreviated_3": "Mar",
        "cldr_month_format_abbreviated_4": "Apr",
        "cldr_month_format_abbreviated_5": "May",
        "cldr_month_format_abbreviated_6": "Jun",
        "cldr_month_format_abbreviated_7": "Jul",
        "cldr_month_format_abbreviated_8": "Aug",
        "cldr_month_format_abbreviated_9": "Sep",
        "cldr_month_format_wide_1": "January",
        "cldr_month_format_wide_10": "October",
        "cldr_month_format_wide_11": "November",
        "cldr_month_format_wide_12": "December",
        "cldr_month_format_wide_2": "February",
        "cldr_month_format_wide_3": "March",
        "cldr_month_format_wide_4": "April",
        "cldr_month_format_wide_5": "May",
        "cldr_month_format_wide_6": "June",
        "cldr_month_format_wide_7": "July",
        "cldr_month_format_wide_8": "August",
        "cldr_month_format_wide_9": "September",
        "cldr_month_stand-alone_narrow_1": "J",
        "cldr_month_stand-alone_narrow_10": "O",
        "cldr_month_stand-alone_narrow_11": "N",
        "cldr_month_stand-alone_narrow_12": "D",
        "cldr_month_stand-alone_narrow_2": "F",
        "cldr_month_stand-alone_narrow_3": "M",
        "cldr_month_stand-alone_narrow_4": "A",
        "cldr_month_stand-alone_narrow_5": "M",
        "cldr_month_stand-alone_narrow_6": "J",
        "cldr_month_stand-alone_narrow_7": "J",
        "cldr_month_stand-alone_narrow_8": "A",
        "cldr_month_stand-alone_narrow_9": "S",
        "cldr_number_decimal_separator": ".",
        "cldr_number_group_separator": ",",
        "cldr_number_percent_format": "#,##0%",
        "cldr_pm": "PM",
        "cldr_time_format_full": "h:mm:ss a zzzz",
        "cldr_time_format_long": "h:mm:ss a z",
        "cldr_time_format_medium": "h:mm:ss a",
        "cldr_time_format_short": "h:mm a",
        "quotationEnd": "”",
        "quotationStart": "“"
    };

    qx.$$locales["C"] = cldrMap;
    qx.$$locales["en"] = cldrMap;

    var readyStateValue = { "complete": true };
    if (document.documentMode && document.documentMode < 10 ||
        (typeof window.ActiveXObject !== "undefined" && !document.documentMode)) {
        readyStateValue["loaded"] = true;
    }

    var fireContentLoadedEvent = function () {
        qx.$$domReady = true;
        document.removeEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
    };
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
    }

    qx.$$loader.signalStartup = function () {
        qx.$$loader.scriptLoaded = true;
        if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) {
            qx.event.handler.Application.onScriptLoaded();
            qx.$$loader.applicationHandlerReady = true;
        } else {
            qx.$$loader.applicationHandlerReady = false;
        }
    }

    // Load all stuff
    qx.$$loader.init = function () {
        var l = qx.$$loader;
        window.setTimeout(function () {
            l.signalStartup();
        }, 0);
    }

})();

qx.$$loader.init();

