(function() {

  var citiesData = [];
  var map;

  //one info window for all markers
  var infowindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, 15)
  });

  var app = angular.module('weatherapp', []);

  app.controller('MainController', function($scope, $http, weather) {

    var mapElement = document.getElementById('map');
    map = new google.maps.Map(mapElement, {
      center: {lat: 39.099727, lng: -94.578567},
      zoom: 4
    });

    var cityIds = [4180439, 5128638, 4560349, 4726206, 4671654, 5809844, 5368361, 5391811, 5308655, 4684888, 4887398, 5391959, 5392171, 4164138, 4273837, 5746545, 4699066, 5419384, 4990729];

    weather.getWeather(cityIds, function(response) {
      console.log('the response is ', response);
      response.data.list.forEach(function(city) {
        citiesData.push(city);
      });
      createMarkers();
      $scope.cityData = citiesData;
    });

    $scope.openInfoWindow = function(cityMarker) {
      openInfoWindow(cityMarker);
    };

  }); //end MainController

  app.factory('weather', function($http) {
    var url = 'http://api.openweathermap.org/data/2.5/group';
    var APPID = '2316d4952cbc949469b1675923056c70';
    return {
      getWeather: function(cityIds, callback) {
        $http({
          url: url,
          params: {
            id: cityIds.join(','),
            units: 'imperial',
            APPID: APPID
          }
        }).then(callback, function(response) {
          console.log('error is ', response);
        });
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

      //construct URL for weather icon
      var imageWeatherIcon = 'http://openweathermap.org/img/w/' + city.weather[0].icon + '.png';

      //initialize marker icon with imageTempGauge
      var image = setupIconImage(imageTempGauge, 20, 47, 10, 25);

      //initialize google maps marker; put marker object on city object
      city.marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image
      });

      //set each marker on the map
      city.marker.setMap(map);

      //build HTML content for InfoWindow
      var contentString = createInfoWindowHTML(city);

      city.marker.contentString = contentString;
      city.marker.cityName = city.name;
      city.marker.imageTempGauge = imageTempGauge; //use this if iconState is true
      city.marker.imageWeatherIcon = imageWeatherIcon; //use this if iconState is false
      city.marker.iconState = false;

      //city.markers.push(marker);
      setInterval(function() {
        var image;
        if (city.marker.iconState) {
          image = setupIconImage(city.marker.imageTempGauge, 20, 47, 10, 25);
          city.marker.iconState = false;
        } else {
          image = setupIconImage(city.marker.imageWeatherIcon, 50, 50, 25, 25);
          city.marker.iconState = true;
        }
        city.marker.setIcon(null);
        city.marker.setIcon(image);
      }, 5000);

      //bind event listener
      city.marker.addListener('click', function() {
        openInfoWindow(city.marker);
      });

    }); // end citiesData forEach


  } //end createMarkers

  function setupIconImage(iconUrl, sizeW, sizeH, pointX, pointY) {
    return {
      url: iconUrl,
      size: new google.maps.Size(sizeW, sizeH),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(pointX, pointY)
    };
  }

  function createInfoWindowHTML(city) {
    return '<div id="content">'+
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
  }

  function openInfoWindow(marker) {
    infowindow.setContent(marker.contentString);
    infowindow.open(map, marker);
  }

})();
