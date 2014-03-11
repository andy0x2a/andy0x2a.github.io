var base = "http://arcturus.elasticbeanstalk.com/"
var lcn = "location/"
//var url = base + lcn;


var remainingRequests = 0;
var locationsDataMap = {};
var locationArray = null;
var map = null;


function get(url, successCallback) {
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
}             var superMarker;


function displayOnMap(locn, entries) {

    var latLng = new google.maps.LatLng(locn.latitude, locn.longitude);

    console.log("ADDING LOCATION AT " + locn.latitude + "," + locn.longitude)
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
            ratingString = ratingString.concat("<br> rating #" + (i + 1));
            var rating = entries[i].rating;
            ratingString = ratingString.concat(": " + rating + "/5");
            ctr += rating;

            console.log("\t" + ratingString);
        }

        ratingString = ratingString.concat("<br>");
    }


    if (!!entries) {

        entryString += ("<br> Average rating :" + ctr / entries.length);
    } else {
        entryString += ("<br> No Ratings Found ");
    }

    var contentString = '<div id="content_' + locn.id + '">' +
            '<h2 id="firstHeading" class="firstHeading">Apartment</h2>' +
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
        console.log("closure access to ratingString: " + ratingString)

        $("#data").empty();
        $("#data").html("" + ratingString);
    });
}
function getLocation(map) {
    this.map = map;
    get(base + lcn, showLocations);
//          var latLng = new google.maps.LatLng(49.208589, -123.124713);

    //setup clicker




}





function postLocation() {
    var addr = $("#inAddress").val();
    var lat = $("#inLat").val();
    var long = $("#inLong").val();
    var dta = {'address': addr,
        'latitude': lat,
        'longitude': long
    }


    post(base + lcn, dta, postNewLocationSuccessCallback)

}


function postNewLocationSuccessCallback(response, textSatus, jqXHR) {
    console.log(textSatus);
    console.log("LCN: " + JSON.stringify(response))
    console.log("NEW LOCATION AT " + response.latitude, response.longitude);

     locationsDataMap[response.id] = {'location': response, 'entries': null};
               var entriesLink = response.links[0];
     displayOnMap(response);


}


function postRating() {
    var rtng = $("#inRating").val();
    var s = $("#selLocation");
    var selectedId = s.find(":selected")[0].id
    console.log("RATING " + rtng);
    console.log("LOCATION: :" + selectedId);
    dta = {'rating' : rtng,
        'userId' : '1000',
        'locationId' : selectedId
    };


    post(base + "entries/", dta, postNewEntrySuccessCallback);

}

function postNewEntrySuccessCallback(response, textSatus, jqXHR) {

    console.log(textSatus);
    console.log("R: " + JSON.stringify(response));
}

function post(url, dta, successCallback) {

    var dtaStr = JSON.stringify(dta)


    $.ajax({
                url: url,
                type: 'POST',
                //        context: document.body,
                data: dtaStr,
                dataType: "json",
                crossDomain: true,
                contentType: "application/json; charset=utf-8"


            }).done(
            function() {
                $(this).addClass("done");
            }).success(successCallback)
}

//don't do this...


function buildLocationOptions(locns) {
    console.log("locations: " + JSON.stringify(locns));
    var s = $("#selLocation");
    for (var i in locns) {

        s.append($("<option id='" + locns[i].id + "'/>").html(locns[i].address));
    }
}
function populateLocationListCallback(locations, textSatus, jqXHR) {
    console.log("saving locations: " + JSON.stringify(locations));
    this.locationArray = locations;
    buildLocationOptions(this.locationArray);
}
function showLocationData() {
    var s = $("#selLocation");
    console.log(s.val());
    var selectedId = s.find(":selected")[0].id


}
function getLocations() {

    console.log("this.locationarray: " + this.locationArray);
    console.log("\t exists not: " + !this.locationArray);
    console.log("\t equals null: " + (this.locationArray == null));
    console.log("\t not not: " + !!this.locationArray)
    if (!this.locationArray) {

        get(base + lcn, populateLocationListCallback);
    } else {
        buildLocationOptions(this.locationArray);
    }


}





