//Open weather Map API Key: 2316d4952cbc949469b1675923056c70
//image: http://openweathermap.org/img/w/[ID].png

var cityIds = [
  4180439,
  5128638,
  4560349,
  4726206,
  4671654,
  5809844,
  5368361,
  5391811,
  5308655,
  4684888,
  4887398,
  5391959,
  5392171,
  4164138,
  4273837,
  5746545,
  4699066,
  5419384,
  4990729
];
var citiesData = [];
var map;


var app = angular.module('weatherapp', []);
app.controller('MainController', function($scope, $http) {
  var cities = cityIds.join(',');
  var url = 'http://api.openweathermap.org/data/2.5/group?id=' + cities + '&units=imperial&APPID=2316d4952cbc949469b1675923056c70';
  $http.get(url)
    .then(function(response) {
      console.log(response);
      response.data.list.forEach(function(city) {
        citiesData.push(city);
        createMarkers();
      });
      $scope.cityData = citiesData;
  }, function(response) {
    console.log('error is ', response);
  });
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.099727, lng: -94.578567},
    zoom: 4
  });
}

function createMarkers() {
  citiesData.forEach(function(city) {
    var myLatLng = {lat: city.coord.lat, lng: city.coord.lon};
    var image =
      {
        url: 'http://openweathermap.org/img/w/' + city.weather[0].icon + '.png',
        size: new google.maps.Size(50, 50),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 25)
      };

    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      icon: image
    });
    marker.setMap(map);

    var contentString = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHeading">' + city.name + '</h1>'+
      '<div id="bodyContent" class="bodyContent">'+
      '<h3>' + city.weather[0].description + '</h3>' +
      '<ul><li>Temperature: ' + city.main.temp + '</li>' +
      '<li>High: ' + city.main.temp_max + '</li>' +
      '<li>Low: ' + city.main.temp_min + '</li>' +
      '<li>Pressure: ' + city.main.pressure + '</li>' +
      '<li>Humidity: ' + city.main.humidity + '</li>' +
      '<li>Wind Speed: ' + city.wind.speed + '</li>' +
      '</ul>' +
      '</div>'+
      '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString,
    });

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

  }); // end forEach
}
