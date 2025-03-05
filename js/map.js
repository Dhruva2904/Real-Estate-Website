let map;
    let geocoder;

    // Initialize map
    function initMap() {
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
        zoom: 8,
      });
      geocoder = new google.maps.Geocoder();
    }

    document.getElementById("doneButton").addEventListener("click", () => {
      const country = document.getElementById("country").value;
      const state = document.getElementById("state").value;
      const address = document.getElementById("address").value;

      if (!country || !state || !address) {
        alert("Please fill in all fields to adjust the map.");
        return;
      }

      const fullAddress = `${address}, ${state}, ${country}`;

      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === "OK") {
          map.setCenter(results[0].geometry.location);
          new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
          });
          alert("Location successfully set! You can proceed.");
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    });
  <script
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCDntvDkKepIRK-wsBiKR56rj42-A9v3D8&callback=initMap"
    async
  ></script>