require(["esri/Map",/*"esri/WebScene",*/ "esri/views/SceneView", "esri/layers/SceneLayer", "esri/layers/FeatureLayer", /*"esri/layers/WebTileLayer", "esri/Basemap",*/ "esri/widgets/Zoom", "esri/widgets/Search", "esri/geometry/Polygon", "esri/tasks/Locator", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/core/watchUtils", "esri/symbols/TextSymbol" /*"esri/symbols/SimpleMarkerSymbol", "esri/symbols/PointSymbol3D"*/], (Map,/* WebScene,*/ SceneView, SceneLayer, FeatureLayer, /*WebTileLayer, Basemap,*/ Zoom, Search, Polygon, Locator, Graphic, GraphicsLayer, Point, watchUtils, TextSymbol /*SimpleMarkerSymbol, PointSymbol3D*/ ) => {

  // Add WebTileLayer

  /*const stamen = new WebTileLayer({
    urlTemplate: 'http://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png',
    subDomains: ["a","b","c"],
    copyright: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    visible: true
  })

  const baseLayer = new WebTileLayer({
    urlTemplate: "https://stamen-tiles-{subDomain}.a.ssl.fastly.net/terrain/{level}/{col}/{row}.png",
    subDomains: ["a", "b", "c", "d"],
    copyright:
      'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ' +
      'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
      'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ' +
      'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
  });

  const stamen = new Basemap({
    baseLayers: [baseLayer],
    title: "Toner-Lite",
    id: "Toner-Lite",
    thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
  });*/

  // Individual Landmarks Boundaries

  const manhattanMask = new FeatureLayer({
    url:
      "https://services9.arcgis.com/uX5kr9HIx4qXytm9/arcgis/rest/services/Lower_MN_Mask/FeatureServer",
    elevationInfo: {
      mode: "on-the-ground",
    },
    popupEnabled: false,
    maxScale: 0,
    minScale: 0,  
    renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [{
            type: "fill",
            material: {
              color: [255,255,255, 1]
            },
            outline: {
              color: "#000",
              width: 2, 
              style: "solid"
            }
          }]
        }
      }
  });

  const arrowLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "relative-to-scene",
      offset: 20
    }
  });

  const letterGraphicsLayer = new GraphicsLayer ({
    elevationInfo: {
      mode: "absolute-height"
    }
  });

  const infoGraphicsLayer = new GraphicsLayer ({
    id: "infoLayer",
    elevationInfo: {
      mode: "absolute-height"
    }
  });

  const desBuildings = new SceneLayer({                    
    url: "https://tiles.arcgis.com/tiles/uX5kr9HIx4qXytm9/arcgis/rest/services/All_Buildings/SceneServer", 
    outFields: ["*"], 
    popupEnabled: false,                   
    renderer: desRenderer40,
    visible: true
  });

  var map = new Map({
      layers: [ manhattanMask, desBuildings, arrowLayer, letterGraphicsLayer, infoGraphicsLayer],
      basemap: {
        portalItem: {
          id: "75a08e8cd8b64dcfa6945bb7f624ccc5"
        }
      },
      ground: "world-elevation"
  });

  map.ground.opacity = 1

  const highlight40 = {
    color: [236, 56, 188],
    fillOpacity: 0.4,
    haloOpacity: 0.8,
    haloColor: [236, 56, 188],
    shadowOpacity: 0.2
  }

  const highlight80 = {
    color: [16, 231, 226],
    fillOpacity: 0.4,
    haloOpacity: 0.8,
    haloColor: [16, 231, 226],
    shadowOpacity: 0.2
  }

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    qualityProfile: "medium",
    highlightOptions: highlight40,
    camera: {
      position: {
        latitude: 40.68490602479135,
        longitude: -73.9311857129305,
        z: 5099.451669022441
      },
      tilt: 51.63913994833819,
      heading: 299.01357418438283
    },
    constraints: {
      altitude: {
        min: 500,
        max: 10000,
      },
      /*tilt: {
          max: 75
      }*/
    },
    environment: {
      background:{
          type: "color", 
          color: [255,255,255,1]
      },
      lighting: {
          directShadowsEnabled: true
        },  
      atmosphereEnabled: false,
      starsEnabled: false
    },
    ui: {
      components: [""]
    }
  });

  view.popup.viewModel.includeDefaultActions = false;

  /*view.watch('camera.tilt', function(newValue, oldValue, property, object) {
    console.log(property , newValue);
  });
    
  view.watch('camera.position', function(newValue, oldValue, property, object) {
    console.log(property , newValue);
  });
    
  view.watch('camera.heading', function(newValue, oldValue, property, object) {
    console.log(property , newValue);
  });*/

  /*******Close Loader Div after Layer Load*********/

  view.whenLayerView(desBuildings).then(function(lyrView){
    watchUtils.whenFalse(lyrView, "updating", function(){
      document.getElementById("loaderDiv").style.display="none";
    });
  })


  /*******Launch Info Div*********/

  document.getElementById("info").addEventListener("click", openInfo);

  function openInfo() {
    document.getElementById("infoHolder").style.display = "flex";
    document.getElementById("cardImageId").src = "#";
    document.getElementById("cardId").style.display="none";
    document.getElementById("infoText").scroll(0,0);
    highlight && highlight.remove(); 
    highlight = view.highlight(infoGraphicsLayer.graphics.items[0]); 
  }

  /*******Close Info Div*********/

  document.getElementById("infoX").addEventListener("click", closeInfo);

  function closeInfo() {
    document.getElementById("infoHolder").style.display = "none";
    highlight.remove();
    
  }

  /*******Launch Search Bar*********/

  let searchFlag = 1;

  document.getElementById("search").addEventListener("click", openSearch);

  function openSearch() {
    if (searchFlag == 1) {
      document.getElementById("searchBarHolder").style.display = "flex";
      highlight.remove();
      document.getElementById("cardImageId").src = "#";
      document.getElementById("cardId").style.display="none";
    } else if (searchFlag == 0) {
      addSearch.clear();
      searchFlag = 1;
      document.getElementById("search").innerHTML = "Search";
    }
  }

  /*******Close Search Bar*********/

  document.getElementById("searchX").addEventListener("click", closeSearch);

  function closeSearch() {
    document.getElementById("searchBarHolder").style.display = "none";
  }

  /*******Launch Era Switch*********/

  document.getElementById("timeWarp").addEventListener("click", timeWarp);

  function timeWarp() {
    document.getElementById("decadeButtonHolder").style.display = "flex";
    highlight.remove();
    document.getElementById("cardImageId").src = "#";
    document.getElementById("cardId").style.display="none";
  }

  /*******Close Era *********/

  document.getElementById("switchX").addEventListener("click", closeTimeWarp);

  function closeTimeWarp() {
    document.getElementById("decadeButtonHolder").style.display = "none";
  }

  /*******Era Switch*********/

  function year1940() {
    desBuildings.renderer = desRenderer40;
    document.getElementsByClassName("titleText")[0].style.color="#000";
    document.getElementsByClassName("switchText80")[0].style.opacity=0.5;
    document.getElementsByClassName("switchText40")[0].style.opacity=1;
    document.getElementsByClassName("switchSubText80")[0].style.opacity=0.5;
    document.getElementsByClassName("switchSubText40")[0].style.opacity=1;
    document.getElementById("cardClose").style.borderColor="#000";
    document.getElementById("cardX").style.color="#000";
    document.getElementsByClassName("titleText")[0].style.textShadow = "4px 4px #c2c2c2, 8px 8px #575757";
    letterGraphicsLayer.add(letterGraphic1940);
    letterGraphicsLayer.remove(letterGraphic1980);
    infoGraphicsLayer.add(infoGraphic1940);
    infoGraphicsLayer.remove(infoGraphic1980);
    if (arrowLayer.graphics.items.length > 0) {
      arrowLayer.graphics.items[0].symbol.symbolLayers.items[0].material.color = [48,48,48];
    } else {
      ""
    };
    if (highlight == undefined) {
      ""
    } else {
    highlight.remove();
    };
    view.highlightOptions = highlight40;
    document.getElementById("cardImageId").style.maxWidth = "500px";
  };

  function year1980() {
    desBuildings.renderer = desRenderer80;
    document.getElementsByClassName("titleText")[0].style.color="#20D4CF";
    document.getElementsByClassName("switchText80")[0].style.opacity=1;
    document.getElementsByClassName("switchText40")[0].style.opacity=0.5;
    document.getElementsByClassName("switchSubText80")[0].style.opacity=1;
    document.getElementsByClassName("switchSubText40")[0].style.opacity=0.5;
    document.getElementById("cardClose").style.borderColor="#ec38bc";
    document.getElementById("cardX").style.color="#ec38bc";
    document.getElementsByClassName("titleText")[0].style.textShadow = "4px 4px #ec38bc, 8px 8px #7303c0";
    letterGraphicsLayer.add(letterGraphic1980);
    letterGraphicsLayer.remove(letterGraphic1940);
    infoGraphicsLayer.add(infoGraphic1980);
    infoGraphicsLayer.remove(infoGraphic1940);
    if (arrowLayer.graphics.items.length > 0) {
      arrowLayer.graphics.items[0].symbol.symbolLayers.items[0].material.color = [16, 231, 226];
    } else {
      ""
    };
    if (highlight == undefined) {
      ""
    } else {
    highlight.remove();
    };
    view.highlightOptions = highlight80;
    document.getElementById("cardImageId").style.maxWidth = "600px";
  };

  const timeWarpSwitch = document.getElementById("switch");
  timeWarpSwitch.addEventListener("click", function() {
    if (setImageYear == 1) {
        setImageYear = 0;
        document.getElementById("cardId").style.display="none";
        year1980();
    } else if (setImageYear == 0) {
        setImageYear = 1;
        document.getElementById("cardId").style.display="none";
        year1940();
    }
});

  /*******HitTest Hover Code************/

  view.on("pointer-move", (event) => {
    const opts = {
      include: infoGraphicsLayer
    }
    view.hitTest(event, opts).then((response) => {
      if (response.results.length) {
        document.getElementById("viewDiv").style.cursor = "pointer";
      } else {
        document.getElementById("viewDiv").style.cursor = "default";
      }
    });
  });

  /*******HitTest Click Code************/

  let highlight;
  let currentGraphic;
  let setImageYear = 1;

  view.on("immediate-click", (event) => {
    view.hitTest(event).then((hitTestResult) => {

      if (hitTestResult.results.length > 0 && hitTestResult.results[0].graphic.layer.url == "https://tiles.arcgis.com/tiles/uX5kr9HIx4qXytm9/arcgis/rest/services/All_Buildings/SceneServer" && setImageYear == 1) {

        document.getElementById("cardImageId").src = "#";

        desType = hitTestResult.results[0].graphic.attributes.DesType;
        one_block = hitTestResult.results[0].graphic.attributes.one_block;
        one_lot = hitTestResult.results[0].graphic.attributes.one_lot;
        address = hitTestResult.results[0].graphic.attributes.address;

        document.getElementById("cardId").style.display="block";
        
        //Add Graphics//

        let result = hitTestResult.results[0];

        if (result.graphic === currentGraphic) {}
        else {
          highlight && highlight.remove(); 
          highlight = view.highlight(result.graphic); 
          currentGraphic = result.graphic;
        };

        //1940s Photos Ajax Call

        const rootStart = "https://nycma.lunaimaging.com/luna/servlet/as/search?lc=NYCMA%7E5%7E5&q=block%3D"
        let block = one_block
        let lot = one_lot
        const and = "+AND+lot%3D"
        const rootEnd = "&os=0&bs=10&excludeFacets=0&excludeMetadata=0"
  
        //Luna URL and Ajax Code
        
        var getUrl = function () {
          var tmp = [];
          $.ajax({
              'async': false,
              'type': "GET",
              //'global': false,
              'dataType': 'json',
              'url': rootStart+block+and+lot+rootEnd,
              success: function(data) {  
                $.each(data.results, function(index, value) {
                  tmp.push(value.urlSize4);
                });
              },
          });
          return tmp;
        }();
  
        var length= getUrl.length

        if (length == 0) {
          getUrl.push('./assets/Image40.png')
          document.getElementById("buttonHolder").style.display="none";
        } else if (length == 1) {
          document.getElementById("buttonHolder").style.display="none";
        } else if (length > 1) {
          document.getElementById("buttonHolder").style.display="flex";
        } else {}

        //Set initial Image Source 
  
        let image = getUrl[0];
     
        //Slide Code//
  
        let slides = getUrl;
        let currentSlideIndex = 0;
  
        function show_image(direction) {
          
          let currentImage = document.getElementById("cardImageId");
          currentImage.src = slides[currentSlideIndex];
  
          if (direction == 'left') {
            currentSlideIndex--;
          }
          else {
            currentSlideIndex++;
            currentSlideIndex %= slides.length;
          }
          if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
          }
          currentImage.src = slides[currentSlideIndex];
          
          counter = currentSlideIndex +1;
          $('#counterText').text(counter);
        };
  
        length = getUrl.length;
  
        $(document).on("click" , '#left' , function(){
          show_image('left');
        });
  
        $(document).on("click" , '#right' , function(){
          show_image('right');
        });

        document.getElementById("cardImageId").src=`${image}`
        $('#totalText').html(`${length}`);
        $('#addressText').html(`${address}`);
        $('#blockText').html(`${one_block}`);
        $('#lotText').html(`${one_lot}`);
        $('#counterText').text("1");

/****************Begin 1980s Code*****************/

      } else if (hitTestResult.results.length > 0 && hitTestResult.results[0].graphic.layer.url == "https://tiles.arcgis.com/tiles/uX5kr9HIx4qXytm9/arcgis/rest/services/All_Buildings/SceneServer" && setImageYear == 0) {

        document.getElementById("cardImageId").src = "#";

        desType = hitTestResult.results[0].graphic.attributes.DesType;
        one_block = hitTestResult.results[0].graphic.attributes.one_block;
        one_lot = hitTestResult.results[0].graphic.attributes.one_lot;
        address = hitTestResult.results[0].graphic.attributes.address;

        document.getElementById("cardId").style.display="block";
        
        //Add Graphics//

        let result = hitTestResult.results[0];

        if (result.graphic === currentGraphic) {}
        else {
          highlight && highlight.remove(); 
          highlight = view.highlight(result.graphic); 
          currentGraphic = result.graphic;
        };
  
        //1980s Photos Ajax Call
  
        const rootStart1980 = "https://nycma.lunaimaging.com/luna/servlet/as/search?lc=RECORDSPHOTOUNITMAN%7E2%7E2&q=block%3D"
        let block1980 = one_block
        let lot1980 = one_lot
        const and1980 = "+AND+lot%3D"
        const rootEnd1980 = "&os=0&bs=10&excludeFacets=0&excludeMetadata=0"
  
        //Luna URL and Ajax Code
  
        var getUrl1980 = function () {
          var tmp1980 = [];
          $.ajax({
              'async': false,
              'type': "GET",
              //'global': false,
              'dataType': 'json',
              'url': rootStart1980+block1980+and1980+lot1980+rootEnd1980,
              success: function(data) {  
                $.each(data.results, function(index, value) {
                  tmp1980.push(value.urlSize3);
                });
              },
          });
          return tmp1980;
        }();
  
        //Get length of image array//
  
        var length1980 = getUrl1980.length

        if (length1980 == 0) {
          getUrl1980.push('./assets/Image80.png')
          document.getElementById("buttonHolder").style.display="none";
        } else if (length1980 == 1) {
          document.getElementById("buttonHolder").style.display="none";
        } else if (length1980 > 1) {
          document.getElementById("buttonHolder").style.display="flex";
        } else {}
  
        //Set initial Image Source 
  
        let image = getUrl1980[0];

        //Slide Code//
  
        let slides = getUrl1980;
        let currentSlideIndex = 0;
  
        function show_image(direction) {
          
          let currentImage = document.getElementById("cardImageId");
          currentImage.src = slides[currentSlideIndex];
  
          if (direction == 'left') {
            currentSlideIndex--;
          }
          else {
            currentSlideIndex++;
            currentSlideIndex %= slides.length;
          }
          if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
          }
          currentImage.src = slides[currentSlideIndex];
          
          counter = currentSlideIndex +1;
          $('#counterText').text(counter);
        };
  
        length = getUrl1980.length;
  
        $(document).on("click" , '#left' , function(){
          show_image('left');
        });
  
        $(document).on("click" , '#right' , function(){
          show_image('right');
        });

        document.getElementById("cardImageId").src=`${image}`
        $('#totalText').html(`${length}`);
        $('#addressText').html(`${address}`);
        $('#blockText').html(`${one_block}`);
        $('#lotText').html(`${one_lot}`);
        $('#counterText').text("1");

      } else if (hitTestResult.results.length > 0 && hitTestResult.results[0].graphic.layer.id == "infoLayer") {

        let result = hitTestResult.results[0];

        //console.log(infoGraphicsLayer.graphics.items[0]);

        highlight && highlight.remove(); 
        highlight = view.highlight(result.graphic); 
        currentGraphic = result.graphic;

        document.getElementById("cardId").style.display="none";
        //$('#infoHolder').fadeIn(500);
        document.getElementById("infoHolder").style.display="flex";

    } else {
        if (hitTestResult.results.length == 0) {
          highlight.remove();
        } else {};
        document.getElementById("cardImageId").src = "#";
        document.getElementById("cardId").style.display="none";
      }
    })
    .catch((error) => {
      console.error(error);
    });
  });

  /*********Mobile Close Card X************/

  document.getElementById("cardClose").addEventListener("click", closeCardX);

  function closeCardX() {
    highlight.remove();
    document.getElementById("cardImageId").src = "#";
    document.getElementById("cardId").style.display="none";   
  }
  
  /*************Info Graphics**************/

  const infoGraphic1940 = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/Info.glb'},
          material: { color: [48, 48, 48] },
          height: 200,
          heading: 0,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      latitude: 40.7077914352411,
      longitude: -74.042100273936,
      z: 40,
    })
  })

  const infoGraphic1980 = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/Info.glb'},
          material: { color: [16, 231, 226] },
          height: 200,
          heading: 0,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      latitude: 40.7077914352411,
      longitude: -74.042100273936,
      z: 40,
    })
  })

  infoGraphicsLayer.add(infoGraphic1940);

  /*************Letter Graphics**************/

  const letterGraphic1940 = new Graphic({
    layer: letterGraphicsLayer,
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/1940s.glb'},
          material: { color: [48, 48, 48] },
          height: 150,
          heading: 0,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      latitude: 40.738281,
      longitude: -74.020025,
      z: 40,
    })
  })

  letterGraphicsLayer.add(letterGraphic1940);

  const letterGraphic1980 = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/1980s.glb'},
          material: { color: [16, 231, 226] },
          height: 150,
          heading: 0,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      latitude: 40.738281,
      longitude: -74.020025,
      z: 40,
    }),
  })

  /*************Boat Graphic / Animation**************/

  var point11 = { latitude:40.735505, longitude:-74.02105}
  var point12 = { latitude:40.699483, longitude:-74.02496}

  var boatGraphicsLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "relative-to-ground"
    },
    opacity: 0.7
  });
  map.add(boatGraphicsLayer);

  const boatGraphic = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/MerchantShip.glb'},
          height: 50,
          heading: 185,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      ...point11,
      z: -6,
    })
  })

  boatGraphicsLayer.add(boatGraphic);

  const boatGeometry = boatGraphic.geometry;
  const boatSymbolLayer = boatGraphic.symbol.symbolLayers.getItemAt(0);

  var animateBoat = anime
  .timeline({
    autoplay: true,
    targets: [boatGeometry, boatSymbolLayer],
    loop: true,
    duration: 140000,
    update: function() {
      boatGraphic.geometry = boatGeometry.clone();
      boatGraphic.symbol = boatGraphic.symbol.clone();
      boatGraphic.symbol.symbolLayers = [boatSymbolLayer];
    }
  })
  .add({ ...point12,  easing: "linear"})

  animateBoat.play();

  /*************Boat Graphic Two / Animation**************/ 

  var point21 = { latitude:40.69426, longitude:-74.012585}
  var point22 = { latitude:40.702973, longitude:-74.000576}
  var point23 = { latitude:40.705567, longitude:-73.996583}
  var point24 = { latitude:40.707567, longitude:-73.989951}
  var point25 = { latitude:40.708864, longitude:-73.975905}


  var boatGraphicsLayerTwo = new GraphicsLayer({
    elevationInfo: {
      mode: "relative-to-ground"
    },
    opacity: 0.7
  });
  map.add(boatGraphicsLayerTwo);

  const boatGraphicTwo = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/MerchantShipTwo.glb'},
          height: 45,
          heading: 50,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      ...point21,
      z: -7,
    })
  })

  boatGraphicsLayerTwo.add(boatGraphicTwo);

  const boatGeometryTwo = boatGraphicTwo.geometry;
  const boatSymbolLayerTwo = boatGraphicTwo.symbol.symbolLayers.getItemAt(0);

  var animateBoatTwo = anime
  .timeline({
    autoplay: true,
    targets: [boatGeometryTwo, boatSymbolLayerTwo],
    loop: true,
    duration: 120000,
    update: function() {
      boatGraphicTwo.geometry = boatGeometryTwo.clone();
      boatGraphicTwo.symbol = boatGraphicTwo.symbol.clone();
      boatGraphicTwo.symbol.symbolLayers = [boatSymbolLayerTwo];
    }
  })
  .add({ ...point22, easing: "linear"})
  .add({ ...point23, heading: 65, easing: "linear"})
  .add({ ...point24, heading: 80, easing: "linear"})
  .add({ ...point25,  easing: "linear"})


  animateBoatTwo.play();

  /*************Boat Graphic Three / Animation**************/

  var point31 = { latitude:40.701814, longitude:-74.0299152805}
  var point32 = { latitude:40.728786, longitude:-74.0257328424}

  var boatGraphicsLayerThree = new GraphicsLayer({
    elevationInfo: {
      mode: "relative-to-ground"
    },
    opacity: 0.7
  });
  map.add(boatGraphicsLayerThree);

  const boatGraphicThree = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: './assets/MerchantShipThree.glb' },
          height: 36,
          heading: 5,
          tilt:0,
          anchor: "bottom"
        }
      ]
    },
    geometry: new Point({
      ...point31,
      z: -9,
    })
  })

  boatGraphicsLayerThree.add(boatGraphicThree);

  const boatGeometryThree = boatGraphicThree.geometry;
  const boatSymbolLayerThree = boatGraphicThree.symbol.symbolLayers.getItemAt(0);

  var animateBoatThree = anime
  .timeline({
    autoplay: true,
    targets: [boatGeometryThree, boatSymbolLayerThree],
    loop: true,
    duration: 120000,
    update: function() {
      boatGraphicThree.geometry = boatGeometryThree.clone();
      boatGraphicThree.symbol = boatGraphicThree.symbol.clone();
      boatGraphicThree.symbol.symbolLayers = [boatSymbolLayerThree];
    }
  })
  .add({ ...point32, easing: "linear"})

  animateBoatThree.play();

  /*************Address Finder**************/

  const addSource = [{
      locator: new Locator({
        url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer", 
      }),
      filter: {
          geometry: new Polygon({
              "rings": [
                [
                  [
                    -74.014273,
                    40.74473
              ],
              [
                -73.964534,
                40.72375
              ],
              [
                -73.992435,
                40.685754
              ],
              [
                -74.042173,
                40.706746
              ]
                ]
              ],
              "spatialReference": {
                "wkid": 4326
              }
          }) 
      },
      singleLineFieldName: "SingleLine",
      outFields: ["Addr_type"],
      name: "Search by Address or Place",
      placeholder: "Enter an Address or Place",
      zoomScale: 700,
      //resultSymbol: marker,
      resultGraphicEnabled: false,
      maxSuggestions: 5,
    }  
];

  const addSearch = new Search({
    view: view,
    includeDefaultSources: false,
    container: "addSearch",
    locationEnabled: false,
    outFields: ["Addr_Type"],
    sources: addSource,
    allPlaceholder: "Enter an Address or Place",
    popupEnabled: false,
  });
  
  addSearch.on('search-complete', function(result){
    if(result.results && result.results.length > 0 && result.results[0].results && result.results[0].results.length > 0){
      const lat = result.results[0].results[0].feature.geometry.latitude;
      const long = result.results[0].results[0].feature.geometry.longitude;
      const address = result.results[0].results[0].name;

      const splitAddress = address.split(",");
      const finalAddress = splitAddress[0] + ' ';

      const correction = {
        "St ":"Street",
        "Ave ": "Avenue",
        "Pl ": "Place",
        "Sq": "Square",
        "Ln": "Lane",
        "W ": "West ",
        "E ": "East "
      }

      const finalAddressFixed = finalAddress.replace(/St |Ave |Pl |Sq|W |E |Ln/g, matched => correction[matched]);

      let initColor;

      if (setImageYear == 1) {
        initColor = [48,48,48];
      } else {
        initColor = [16, 231, 226];
      };

      /********Practice Code*********/

      const textSymbol = {
        type: "text", // autocasts as new TextSymbol()
        color: "#303030",
        text: finalAddressFixed, 
        font: {
          // autocasts as new Font()
          size: 12,
          family: "Poppins",
          weight: "bolder"
        },
        haloColor: "#c2c2c2",
        haloSize: 0.5
      };

      const point = {
        type: "point",
        x: long,
        y: lat,
        z: 75
      }

      const textGraphic = new Graphic({
        geometry: point,
        symbol: textSymbol

      })

      /********End Practice Code*********/


      const arrowGraphic = new Graphic({
        geometry: {
          type: "point",
          latitude: lat,
          longitude: long,
        },
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "object",
              resource: { href: './assets/Arrow.glb'},
              material: { color: initColor },
              height: 60,
              tilt: 0,
              heading: 120,
              anchor: "bottom",
            },
          ],
        }
      });

      arrowLayer.removeAll();
      arrowLayer.addMany([arrowGraphic, textGraphic]);

      const arrowSymbolLayer = arrowGraphic.symbol.symbolLayers.getItemAt(0);

      const headingAnimation = anime({
        targets: arrowSymbolLayer,
        heading: "+=360",
        duration: 5000,
        easing: "linear",
        autoplay: true,
        loop: true,
        update: function () {
          arrowGraphic.symbol = arrowGraphic.symbol.clone();
          arrowGraphic.symbol.symbolLayers = [arrowSymbolLayer];
        }
      });

      headingAnimation.play();

      searchFlag = 0;
      document.getElementById("search").innerHTML = "Clear";
      document.getElementById("search").style.fontWeight = 700;
      document.getElementById("search").style.color = "#ec38bc";

    }else{
      ""
    }
  });

  addSearch.on("search-clear", function(event) {
    arrowLayer.removeAll();
    document.getElementById("search").removeAttribute('style');
  });

});