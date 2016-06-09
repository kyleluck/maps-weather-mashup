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
var markers = [];


//one info window for all markers
var infowindow = new google.maps.InfoWindow({
  pixelOffset: new google.maps.Size(0, 15)
});

var app = angular.module('weatherapp', []);

app.controller('MainController', function($scope, $http, weather) {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.099727, lng: -94.578567},
    zoom: 4
  });

  weather.getWeather(function(response) {
    console.log('the response is ', response);
    response.data.list.forEach(function(city) {
      citiesData.push(city);
    });
    createMarkers();
    $scope.cityData = citiesData;
  });

  $scope.openInfoWindow = function (city) {
    markers.forEach(function(marker) {
      if (marker.cityName === city) {
        openInfoWindow(marker);
        return;
      }
    });
  };
}); //end MainController

app.factory('weather', function($http) {
  var cities = cityIds.join(',');
  var url = 'http://api.openweathermap.org/data/2.5/group';
  var APPID = '2316d4952cbc949469b1675923056c70';
  return {
    getWeather: function(callback) {
      $http({
        url: url,
        params: {
          id: cities,
          units: 'imperial',
          APPID: APPID
        }
      }).then(callback);
    }
  };
}); //end weather factory

function getTempIcon(temp) {
  var imageTempGauge = "/images/";
  if (temp >= 80) {
    imageTempGauge += "hot.png";
  } else if (temp < 60) {
    imageTempGauge += "cold.png";
  } else {
    imageTempGauge += "normal.png";
  }
  return imageTempGauge;
}

function createMarkers() {
  citiesData.forEach(function(city) {
    var myLatLng = {lat: city.coord.lat, lng: city.coord.lon};

    //call function to get image temp icon depending on city temperature
    var imageTempGauge = getTempIcon(city.main.temp);

    var imageWeatherIcon = 'http://openweathermap.org/img/w/' + city.weather[0].icon + '.png';

    var image =
      {
        url: imageTempGauge,
        size: new google.maps.Size(20, 47),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 25)
      };

    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      icon: image
    });

    //set each marker on the map
    marker.setMap(map);

    //build HTML content for InfoWindow
    var contentString = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHeading">' + city.name + '</h1>'+
      '<div id="bodyContent" class="bodyContent">'+
      '<h3>' + city.weather[0].description + '</h3>' +
      '<ul><li>Temperature: ' + city.main.temp + '&deg;F</li>' +
      '<li>High: ' + city.main.temp_max + '&deg;F</li>' +
      '<li>Low: ' + city.main.temp_min + '&deg;F</li>' +
      '<li>Pressure: ' + city.main.pressure + '</li>' +
      '<li>Humidity: ' + city.main.humidity + '</li>' +
      '<li>Wind Speed: ' + city.wind.speed + '</li>' +
      '</ul>' +
      '</div>'+
      '</div>';

    marker.contentString = contentString;
    marker.cityName = city.name;
    marker.imageTempGauge = imageTempGauge; //use this if iconInUse is true
    marker.imageWeatherIcon = imageWeatherIcon; //use this if iconInUse is false
    marker.iconInUse = false;

    markers.push(marker);

  }); // end forEach

  markers.forEach(function(marker) {
    //switch icon images every 5 seconds
    setInterval(function() {
      var image;
      if (marker.iconInUse) {
        image =
          {
            url: marker.imageTempGauge,
            size: new google.maps.Size(20, 47),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 25)
          };
        marker.iconInUse = false;
      } else {
        image =
          {
            url: marker.imageWeatherIcon,
            size: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25, 25)
          };
        marker.iconInUse = true;
      }
      marker.setIcon(null);
      marker.setIcon(image);
    }, 5000);

    //bind event listener
    marker.addListener('click', function() {
      openInfoWindow(marker);
    });

  }); //end markers.forEach

} //end createMarkers

function openInfoWindow(marker) {
  infowindow.setContent(marker.contentString);
  infowindow.open(map, marker);
}
