from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# 📂 Load JSON data
with open("safety_data.json") as f:
    data = json.load(f)


# 🔤 NORMALIZE TEXT
def normalize(text):
    return text.lower().replace(" ", "")


# 🔍 FIND CLOSE MATCH
def find_match(user_input):
    user_clean = normalize(user_input)

    for place in data.keys():
        place_clean = normalize(place)

        # partial match logic
        if place_clean in user_clean or user_clean in place_clean:
            return place

    return None


# 📊 ANALYZE ROUTE
def analyze_route(source, destination, time):

    source_match = find_match(source)
    dest_match = find_match(destination)

    if source_match and dest_match:

        s_score = data[source_match][time]
        d_score = data[dest_match][time]

        score = (s_score + d_score) // 2

        # Risk logic
        if score > 75:
            risk = "Safe"
        elif score > 50:
            risk = "Moderate"
        else:
            risk = "Risky"

        # Crowd
        crowd = "Low" if time == "Night" else "High"

        # Transport
        transport = "Metro" if time == "Night" else "Bus"

        return {
            "score": score,
            "risk": risk,
            "crowd": crowd,
            "transport": transport,
            "source_match": source_match,
            "dest_match": dest_match
        }

    return None


# 🏠 PAGE ROUTES (NEW FOR 3 PAGE SYSTEM)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/loading")
def loading():
    return render_template("loading.html")

@app.route("/result")
def result():
    return render_template("result.html")


# 🔍 AUTOCOMPLETE
@app.route("/suggest")
def suggest():
    q = request.args.get("q", "").strip().lower().replace(" ", "")

    results = []
    for loc in data.keys():
        clean_loc = loc.lower().replace(" ", "")

        if q in clean_loc:
            results.append(loc)

    return jsonify(results[:10])


# 🚀 ROUTE API
@app.route("/route", methods=["POST"])
def route():
    user_data = request.get_json()

    source = user_data.get("source", "")
    destination = user_data.get("destination", "")
    time = user_data.get("time", "Day")

    result = analyze_route(source, destination, time)

    if result:
        return jsonify(result)
    else:
        return jsonify({
            "score": None,
            "error": "Location not found in dataset"
        })

@app.route("/sos", methods=["POST"])
def sos():
    data = request.get_json()

    lat = data.get("lat")
    lon = data.get("lon")

    print("🚨 SOS ALERT RECEIVED")
    print(f"Location: https://maps.google.com/?q={lat},{lon}")

    # Save to file (proof for demo)
    with open("sos_log.txt", "a") as f:
        f.write(f"SOS: {lat},{lon}\n")

    return jsonify({"status": "ok"})

# ▶ RUN
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)