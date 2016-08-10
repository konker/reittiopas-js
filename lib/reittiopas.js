/**
 * reittiopas-js
 *
 * A thin wrapper around the HSL Reittiopas API
 *
 * Author: Konrad Markus <konker@luxvelocitas.com>
 *
 *
 */

'use strict';

var rp = require('request-promise');

//----------------------------------------------------------------------
// Constants
const FORMATS = {
    JSON: 'json',
    XML: 'xml',
    TXT: 'txt'
}

const LANGS = {
    FI: 'fi',
    SV: 'sv',
    EN: 'en',
    SLANGI: 'slangi'
}

const COORDINATE_SYSTEMS = {
    KKJ1: 2391,
    KKJ2: 2392,
    KKJ3: 2393,
    WGS84: 4326,
    MERCATOR: 3395,
};

//----------------------------------------------------------------------
// 'Statics'
Reittiopas.DEFAULT_HOST = 'api.reittiopas.fi';
Reittiopas.DEFAULT_PORT = '80';
Reittiopas.DEFAULT_BASE_PATH = '/hsl/prod/';
Reittiopas.DEFAULT_USER_AGENT = 'Reittiopas-Js'
Reittiopas.Format = FORMATS;
Reittiopas.CoordinateSystem = COORDINATE_SYSTEMS;
Reittiopas.Lang = LANGS;



//----------------------------------------------------------------------
// Main class
// See: http://developer.reittiopas.fi/pages/en/http-get-interface/1.2.0.php
function Reittiopas(userOrUserHash, pass) {
    this._general = new ReittiopasGeneralOptions(userOrUserHash, pass);
}

Reittiopas.prototype = {
    opts: function() {
        return this._general;
    },

    //----------------------------------------------------------------------
    // 1. Geocoding
    geocode: function(key, cities, loc_types, disable_error_correction, disable_unique_stop_names) {
        return rp(this._build_request(
                    'geocode',
                    {
                        key: key,
                        cities: cities,
                        loc_types: loc_types,
                        disable_error_correction: disable_error_correction,
                        disable_unique_stop_names: disable_unique_stop_names
                    })
                );
    },

    //----------------------------------------------------------------------
    // 2. Reverse Geocoding
    reverseGeocode: function(coordinate, limit, radius, result_contains) {
        return rp(this._build_request(
                    'reverse_geocode',
                    {
                        coordinate: coordinate,
                        limit: limit,
                        radius: radius,
                        result_contains: result_contains
                    })
                );
    },

    //----------------------------------------------------------------------
    // 3. Stop Information
    stop: function(code, date, time, time_limit, dep_limit) {
        return rp(this._build_request(
                    'stop',
                    {
                        code: code,
                        date: date,
                        time: time,
                        time_limit: time_limit,
                        dep_limit: dep_limit
                    })
                );
    },

    //----------------------------------------------------------------------
    // 4. Stops In Area
    stopsArea: function(center_coordinate, limit, diameter) {
        return rp(this._build_request(
                    'stops_area',
                    {
                        center_coordinate: center_coordinate,
                        limit: limit,
                        diameter: diameter
                    })
                );
    },

    //----------------------------------------------------------------------
    // 5. Line Information
    lines: function(query, transport_type, filter_variants, include_sort_id) {
        return rp(this._build_request(
                    'lines',
                    {
                        query: query,
                        transport_type: transport_type,
                        filter_variants: filter_variants,
                        include_sort_id: include_sort_id
                    })
                );
    },

    //----------------------------------------------------------------------
    // 6. Routing Between Two Points
    //[TODO]
    route: function() {
        return rp(this._build_request(
                    'route',
                    {
                    })
                );
    },

    //----------------------------------------------------------------------
    // 7. Cycling Route
    cycling: function(from, to, via, profile, elevation) {
        return rp(this._build_request(
                    'cycling',
                    {
                        from: from,
                        to: to,
                        via: via,
                        profile: profile,
                        elevation: elevation
                    })
                );
    },

    //----------------------------------------------------------------------
    // 8. Data Validity
    validity: function() {
        return rp(this._build_request('validity'));
    },

    //----------------------------------------------------------------------
    // 9. User Statistics
    stats: function() {
        return rp(this._build_request('stats'));
    },
}

//----------------------------------------------------------------------
// General options
// See: http://developer.reittiopas.fi/pages/en/http-get-interface.php
function ReittiopasGeneralOptions(userOrUserHash, pass) {
    if (!pass) {
        this.userHash = userOrUserHash;
        this.user = null;
        this.pass = null;
    }
    else {
        this.userHash = null;
        this.user = userOrUserHash;
        this.pass = pass;
    }

    // Set defaults
    this.debug = false;
    this.format = Reittiopas.Format.JSON;
    this.lang = Reittiopas.Lang.FI;
    this.epsgIn = Reittiopas.CoordinateSystem.KKJ2;
    this.epsgOut = Reittiopas.CoordinateSystem.KKJ2;
}

ReittiopasGeneralOptions.prototype = {
    setDebug: function(debug) {
        this.debug = !!debug;
    },
    setUserHash: function(userHash) {
        this.userHash = userHash;
        this.user = null;
        this.pass = null;
    },
    setUserPass: function(user, pass) {
        this.userHash = null;
        this.user = user;
        this.pass = pass;
    },
    setFormat: function(format) {
        if (_has_val(Reittiopas.Format, format)) {
            this.format = format;
        }
        else {
            console.warn("Reittiopas::setFormat: Unknown: " + format + ". Ignoring");
        }
    },
    setLang: function(lang) {
        if (_has_val(Reittiopas.Lang, lang)) {
            this.lang = lang;
        }
        else {
            console.warn("Reittiopas::setLang: Unknown: " + lang + ". Ignoring");
        }
    },
    setEpsgIn: function(epsg) {
        if (_has_val(Reittiopas.CoordinateSystem, epsg)) {
            this.epsgIn = epsg;
        }
        else {
            console.log("Reittiopas::setEpsgIn: Unknown: " + epsg + ". Ignoring");
        }
    },
    setEpsgOut: function(epsg) {
        if (_has_val(Reittiopas.CoordinateSystem, epsg)) {
            this.epsgOut = epsg;
        }
        else {
            console.log("Reittiopas::setEpsgOut: Unknown: " + epsg + ". Ignoring");
        }
    },
}


//----------------------------------------------------------------------
// Internal helper methods
Reittiopas.prototype._build_request = function(request, params) {
    // Set the general options
    var qs = {
        request: request,
        format: this._general.format,
        lang: this._general.lang,
        epsg_in: this._general.epsgIn,
        epsg_out: this._general.epsgOut
    };

    // Add authentication, either user_hash, or user/pass
    if (this._general.userHash) {
        qs['user_hash'] = this._general.userHash;
    }
    else {
        qs['user'] = this._general.user;
        qs['pass'] = this._general.pass;
    }

    // Add the rest of the given params
    if (params) {
        for (var k in params) {
            if (params[k] != null) {
                qs[k] = params[k];
            }
        }
    }

    // Build the request-promise options object
    var options = {
        uri: 'http://' + Reittiopas.DEFAULT_HOST + ':' + Reittiopas.DEFAULT_PORT + Reittiopas.DEFAULT_BASE_PATH,
        qs: qs,
        headers: {
            'User-Agent': Reittiopas.DEFAULT_USER_AGENT
        },
        json: (this._general.format == Reittiopas.Format.JSON)
    };
    if (this._general.debug) {
        console.log(options);
    }

    return options;
}


//----------------------------------------------------------------------
// Static Utils
Reittiopas.splitTime = function(n) {
    var ret = n.toString();
    return [ret.substring(0, 2), ret.substring(2, 4)];
}

Reittiopas.formatTime = function(n) {
    return Reittiopas.splitTime(n).join(':');
}

Reittiopas.trimCode = function(s) {
    var ret = s;
    // Trim everything after the first space
    if (ret.indexOf(' ') != -1) {
        ret = ret.substring(0, ret.indexOf(' '));
    }

    // Remove the first character
    ret = ret.substr(1);

    // If the first character is now a '0', remove it
    if (ret[0] == '0') {
        ret = ret.substr(1);
    }

    return ret;
}

//----------------------------------------------------------------------
// Internal util functions
function _has_val(obj, val) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k) && obj[k] == val) {
            return true;
        }
    }
    return false;
}

// Make it so
module.exports = Reittiopas;

