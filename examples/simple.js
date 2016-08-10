/**
 * reittiopas-js
 *
 * Examples
 * Author: Konrad Markus <konker@luxvelocitas.com>
 *
 * Copyright (c) 2016, Konrad Markus <konker@luxvelocitas.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
 * CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var USER = process.env.USER;
var PASS = process.env.PASS;

// Require the library
var Reittiopas = require('../lib/reittiopas');

// Instantiate a client
var client = new Reittiopas(USER, PASS);

//----------------------------------------------------------------------
// Get usage statistics
client
    .stats()
    .then(function(data) {
        console.log("\n------------------------------------------------");
        console.log(data);
    })
    .catch(function(err) {
        console.log("Darn it: " + err);
    });


//----------------------------------------------------------------------
// Geocode an address and print out the WSG84 coordinates
client.opts().setEpsgOut(Reittiopas.CoordinateSystem.WGS84);
client
    .geocode("Aleksanterinkatu 52, 00100 Helsinki")
    .then(function(data) {
        console.log("\n------------------------------------------------");
        console.log("Coordinates of Stockmann: " + data[0]['coords']);
    })
    .catch(function(err) {
        console.log("Darn it: " + err);
    });


//----------------------------------------------------------------------
// Reverse Geocode a coordinate and print out the address
client.opts().setEpsgIn(Reittiopas.CoordinateSystem.WGS84);
client.opts().setEpsgOut(Reittiopas.CoordinateSystem.WGS84);
client
    .reverseGeocode("24.942203753257,60.168310532054")
    .then(function(data) {
        console.log("\n------------------------------------------------");
        console.log("Address of Stockmann: " + data[0]['name']);
    })
    .catch(function(err) {
        console.log("Darn it: " + err);
    });


//----------------------------------------------------------------------
// Get stop information for stop E2221 at 13:25 and print out the next 5 departures
client
    .stop('E2221', null, '1325')
    .then(function(data) {
        console.log("\n------------------------------------------------");
        console.log("Departures from stop E2221 at 13:25");
        if (data[0]['departures'] == null) {
            console.log("\t- None at this time");
        }
        else {
            for (var i in data[0]['departures']) {
                var dep = data[0]['departures'][i];
                var time = Reittiopas.formatTime(dep['time']);
                var code = Reittiopas.trimCode(dep['code']);
                console.log("\t- " + time + " " + code);
            }
        }
    })
    .catch(function(err) {
        console.log("Darn it: " + err);
    });

