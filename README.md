reittiopas-js
==============================================================================

A thin wrapper around the HSL Reittiopas API.

See:

- (http://developer.reittiopas.fi/pages/en/http-get-interface.php)[http://developer.reittiopas.fi/pages/en/http-get-interface.php]
- (http://developer.reittiopas.fi/pages/en/http-get-interface/1.2.0.php)[http://developer.reittiopas.fi/pages/en/http-get-interface/1.2.0.php]


## Example Usage
    // Require the library
    var Reittiopas = require('reittiopas-js');

    // Create a client
    var client = new Reittiopas('your_username', 'your_password');

    // Set an option so that the API outputs WSG84 coordinates
    client.opts().setEpsgOut(Reittiopas.CoordinateSystem.WGS84);

    // Geocode an address and print out the coordinates
    client
        .geocode("Aleksanterinkatu 52, 00100 Helsinki")
        .then(function(data) {
            console.log("\n------------------------------------------------");
            console.log("Coordinates of Stockmann: " + data[0]['coords']);
        })
        .catch(function(err) {
            console.log("Darn it: " + err);
        });


### Examples
Further examples can be found in examples/

To run the examples:

    $ USER=some_user PASS=some_pass node examples/simple.js


## Status
Still a work in progress. Main things which still need to be done:
- Route API
- Automated tests


