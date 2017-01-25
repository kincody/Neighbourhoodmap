var mtips={};
var markers = [];
var rplaces=[];

function ViewModel() {
    //initilize infowindow
    var infowindow = new google.maps.InfoWindow({maxWidth:200});

    //create map element
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13,
        mapTypeId: 'roadmap'
    });


    //setup hamburger button
    $('#hamburgericon').click(function(){
        $("#sidebar").toggle();
    });
    $('#hamburgericon').click(function(){
        google.maps.event.trigger(map, "resize");
    });


    var sydney = new google.maps.LatLng(-33.8665433,151.1956316);
    //create request object
    var request = {
    	location: sydney,
    	radius: '5000',
        query: "restaurant"
    };

    // function creates marker
    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            title: place.name,
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
        });
        markers.push(marker);


        google.maps.event.addListener(infowindow, 'closeclick', function() {
    		markers.forEach(function(marker) {
           			marker.setAnimation(null);
        		});
		});

    	//creates infowindows
        google.maps.event.addListener(marker, 'click', function() {
        	toggleBounce = function() {
        		markers.forEach(function(marker) {
           			marker.setAnimation(null);
        		});
        		if (marker.getAnimation() !== null) {
        			marker.setAnimation(null);
        		} else {
        			marker.setAnimation(google.maps.Animation.BOUNCE);
        		}
    		}();

        	get_venue_tips(place.name);
        	if (mtips[place.name]){
            	tips=mtips[place.name];
        	}
        	else{
        		tips="(no tips available)"
        	}
            infowindow.setContent(place.name+"<br>"+tips+"<br>Powered by Foursquare API");
            infowindow.open(map, this);


       });
    }



    //create callback request
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);


    //creates markers and populates sidebar
    function callback(results, status) {
    	rplaces=results
       	// Clear out the old markers.
       	markers.forEach(function(marker) {
           	marker.setMap(null);
        });
        markers = [];
        var placesList = document.getElementById('res');
        placesList.innerHTML="";
        var places=[];

        if (status == google.maps.places.PlacesServiceStatus.OK) {
           	for (var j = 0; j < results.length; j++) {
               	var place = results[j];
               	pat=new RegExp($('#pac-input').val(),'i');

               	if (pat.test(results[j].name) || pat.test(mtips[results[j].name]))
               	{
               		places.push(results[j]);
               		createMarker(results[j]);
               	}
           	}
           	i=0;
           	// populates the sidebar
           	placesList = document.getElementById('res');
           	places.forEach(function(place) {
               	get_venue_tips(place.name);
               	if (mtips[place.name]) {
               		tips=mtips[place.name];
               	}
           		else{
           			tips="(no tips available)"
           		}
           		infowindow.setContent(place.name+"<br>"+tips+"<br>Powered by Foursquare API");
               	placesList.innerHTML += '<li class="results" onclick="fun('+ i +')"  >' + place.name + '</li>';
               	fun=function(i){
               		google.maps.event.trigger(markers[i], 'click');
               	};
           	 	var bounds = new google.maps.LatLngBounds();

               	places.forEach(function(place) {
	               	if (!place.geometry) {
    	           		console.log("Returned place contains no geometry");
                  		return;
               		}
               	});

                if (place.geometry.viewport) {
                	// Only geocodes have viewport.
                	bounds.union(place.geometry.viewport);
              	}
              	else {
                	bounds.extend(place.geometry.location);
              	}
              	i=i+1;

           	});
       	}
    }
    $('#pac-input').keyup(function(){
        filter();
    });
    //filter function is a copy of the callback function with a few changes. This function uses rplaces insted of results.
	function filter() {

	   	// Clear out the old markers.
	   	markers.forEach(function(marker) {
	       	marker.setMap(null);
	    });
	    markers = [];
	    var placesList = document.getElementById('res');
	    placesList.innerHTML="";
	    var places=[];


       	for (var j = 0; j < rplaces.length; j++) {
           	var place = rplaces[j];
           	pat=new RegExp($('#pac-input').val(),'i');

           	if (pat.test(rplaces[j].name) || pat.test(mtips[rplaces[j].name]))
           	{
           		places.push(rplaces[j]);
           		createMarker(rplaces[j]);
           	}
       	}
       	i=0;
       	// populates the sidebar
       	placesList = document.getElementById('res');
       	places.forEach(function(place) {
           	get_venue_tips(place.name);
           	if (mtips[place.name]){
           		tips=mtips[place.name];
           	}
           	else{
           		tips="(no tips available)"
           	}
           	infowindow.setContent(place.name+"<br>"+tips+"<br>Powered by Foursquare API");
           	placesList.innerHTML += '<li class="results" onclick="fun('+ i +')"  >' + place.name + '</li>';
           	fun=function(i){
           		google.maps.event.trigger(markers[i], 'click');
           	};
       	 	var bounds = new google.maps.LatLngBounds();

           	places.forEach(function(place) {
               	if (!place.geometry) {
	           		console.log("Returned place contains no geometry");
              		return;
           		}
           	});

            if (place.geometry.viewport) {
            	// Only geocodes have viewport.
            	bounds.union(place.geometry.viewport);
          	}
          	else {
            	bounds.extend(place.geometry.location);
          	}
          	i=i+1;

       	});

    }
}







// nested ajax call matches places with infowindow tips
function get_venue_tips(query){
	var tip;
    var venue_id;
    url="https://api.foursquare.com/v2/venues/search?ll=-33.8688,%20151.2195&client_id=GXGEEJMGFJFDX30KQRRQXB5US1IK305XTJHCZNEHAPQWOUKF&client_secret=EI2MOU1DXX1LL54SQROWGEKTQOLRW1A3WIL3LF5LC11E32YU&v=20161229&query="+query+"&intent=browse&radius=5000&limit=1";

    $(($.ajax({
        url: url,
        dataType: "json",
        success: function( response ) {
        	try {
	          	venue_id = response.response.venues[0].id;
           	}
           	catch(err){
           		tip="(no tips available)"
           		mtips[query]=tip;
               	return;
           	}
           	url="https://api.foursquare.com/v2/venues/"+venue_id+"/tips?client_id=GXGEEJMGFJFDX30KQRRQXB5US1IK305XTJHCZNEHAPQWOUKF&client_secret=EI2MOU1DXX1LL54SQROWGEKTQOLRW1A3WIL3LF5LC11E32YU&v=20161229&limit=1";
           	$(($.ajax({
               	url: url,
               	dataType: "json",
               	success: function( response ) {
               		try {
               			tip = response.response.tips.items[0].text;
               		}
               		catch(err){
               			tip="(no tips available)"
                   		return;
               		}
               		mtips[query]=tip;
               	}

           	})));
        }
    })));

}


