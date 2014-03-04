var base = "http://arcturus.elasticbeanstalk.com/"
var lcn = "location/"
//var url = base + lcn;


var remainingRequests = 0;
var locationsDataMap = {};
var locationArray = null;
var map = null;

function get(url, successCallback) {

    var locationArray = [];


    $.ajax({
                url: url,
                context: document.body
            }).done(
            function() {
                $(this).addClass("done");
            }).success(successCallback)
}


var showLocations = function(strData, textSatus, jqXHR) {
//                       $("#msgid").html(strData[0].latitude + ", " + strData[0].longitude);
//  alert(strData[0].latitude + ", " + strData[0].longitude);

    console.log("LENGTH: " + strData.length)
    locationArray = strData;

    remainingRequests = locationArray.length;
    for (var i = 0; i < locationArray.length; i++) {

        var locn = locationArray[i];

        var entriesLink = locn.links[0];

        locationsDataMap[locn.id] = {'location': locn, 'entries': null};

        get(base + entriesLink.url, showEntries);


    }


};

function showEntries(entries, textSatus, jqXHR) {

    console.log("ENTRIES LENGTH: " + entries.length)
    remainingRequests--;
    var hasEntries = false;


    if (!!entries[0]) {
        var locEntry = locationsDataMap[entries[0].locationId];
        if (!!locEntry) {
            locEntry['entries'] = entries;
        }
        locationsDataMap[entries[0].locationId] = locEntry;
    }


    if (remainingRequests <= 0) {

        for (var i = 0; i < locationArray.length; i++) {
            var mapVal = locationsDataMap[locationArray[i].id];
            if (!!mapVal) {
                console.log("map val found");
                displayOnMap(mapVal['location'], mapVal['entries']);
            }

        }


    }
}

function displayOnMap(locn, entries) {

    var latLng = new google.maps.LatLng(locn.latitude, locn.longitude);

    // To add the marker to the map, use the 'map' property
    var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                title:"Here!"
            });

    var entryString = "";
    var ctr = 0;

    var ratingString = " Ratings: ";
    if (!!entries) {

        for (var i = 0; i < entries.length; i++) {
           ratingString =  ratingString.concat("<br> rating #" + (i+1));
            var rating = entries[i].rating;
           ratingString =  ratingString.concat(": " + rating + "/5");
            ctr += rating;

            console.log("\t" + ratingString);
        }

        ratingString =  ratingString.concat("<br>");
    }


    if (!!entries) {

        entryString += ("<br> Average rating :" + ctr / entries.length);
    } else {
        entryString += ("<br> No Ratings Found ");
    }

    var contentString = '<div id="content_' + locn.id + '">' +
            '<h1 id="firstHeading" class="firstHeading">Apartment</h1>' +
            '<div id="bodyContent">' +
            '<p> ' + locn.address + ':' +
            entryString +

            '</div>' +
            '</div>';


    var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);

        $("#data").empty();
        $("#data").html("" + ratingString);
    });
}
function getLocation(map) {
    this.map = map;
    get(base + lcn, showLocations);
//          var latLng = new google.maps.LatLng(49.208589, -123.124713);


}





