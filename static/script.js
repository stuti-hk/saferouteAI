// ==============================
// 🔍 AUTOCOMPLETE (SMART + FALLBACK)
// ==============================
function getSuggestions(field) {

    let input = document.getElementById(field).value.trim();
    let list = document.getElementById(field + "List");

    if (!input || input.length < 2) {
        list.style.display = "none";
        list.innerHTML = "";
        return;
    }

    // 🔹 Try backend first (offline / local)
    fetch(`/suggest?q=${encodeURIComponent(input)}`)
    .then(res => res.json())
    .then(localData => {

        if (localData && localData.length > 0) {
            showSuggestions(list, field, localData);
        } else {
            fallbackAPI(input, list, field);
        }

    })
    .catch(() => {
        fallbackAPI(input, list, field);
    });
}


// ==============================
// 🌍 FALLBACK (OPENSTREETMAP)
// ==============================
function fallbackAPI(input, list, field) {

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=in&limit=5`)
    .then(res => res.json())
    .then(data => {

        let places = data.map(p => p.display_name);
        showSuggestions(list, field, places);

    })
    .catch(err => {
        console.error("API error:", err);
    });
}


// ==============================
// 📍 SHOW DROPDOWN
// ==============================
function showSuggestions(list, field, places) {

    list.innerHTML = "";

    if (!places || places.length === 0) {
        list.style.display = "none";
        return;
    }

    list.style.display = "block";

    places.forEach(place => {

        let div = document.createElement("div");
        div.innerText = place;

        div.onclick = () => {
            document.getElementById(field).value = place;
            list.style.display = "none";
            list.innerHTML = "";
        };

        list.appendChild(div);
    });
}


// ==============================
// 🚀 FIND ROUTE (MAIN BUTTON)
// ==============================
function findRoute() {

    let source = document.getElementById("source").value.trim();
    let destination = document.getElementById("destination").value.trim();
    let time = document.getElementById("time").value;

    if (!source || !destination) {
        alert("⚠ Please enter both source and destination");
        return;
    }

    // 🔄 Go to loading page
    window.location.href =
        `/loading?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&time=${time}`;
}


// ==============================
// 🧠 OPTIONAL FETCH (NOT USED IN MULTI PAGE)
// ==============================
function fetchRouteData(source, destination, time, callback) {

    fetch("/route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({source, destination, time})
    })
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}


// ==============================
// ❌ CLOSE DROPDOWN OUTSIDE CLICK
// ==============================
document.addEventListener("click", function(e) {

    if (!e.target.closest(".autocomplete")) {
        document.querySelectorAll(".suggestions").forEach(list => {
            list.style.display = "none";
        });
    }
});

// ==============================
// 🚨 SOS (FULL EMERGENCY SYSTEM)
// ==============================
function sendSOS() {

    if (!navigator.geolocation) {
        alert("❌ Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {

        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        // 🔹 SEND TO BACKEND
        fetch("/sos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ lat, lon })
        });

       

        // 📳 VIBRATION (mobile only)
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500, 200, 1000]);
        }

        // 🔴 FLASH SCREEN
        flashScreen();

        // ALERT
        alert(
            "🚨 SOS SENT!\n\n" +
            "📍 Location:\n" +
            `https://maps.google.com/?q=${lat},${lon}\n\n` +
            "Emergency system activated"
        );

    }, () => {
        alert("⚠ Unable to get location");
    });
}

function flashScreen() {

    let flash = document.createElement("div");

    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "rgba(255,0,0,0.5)";
    flash.style.zIndex = "9999";

    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 500);
}
