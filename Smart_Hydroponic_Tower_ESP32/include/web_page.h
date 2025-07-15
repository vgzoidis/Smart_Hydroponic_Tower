#ifndef WEB_PAGES_H
#define WEB_PAGES_H

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>Smart Hydroponic Tower</title>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body{font-family:Arial,sans-serif;margin:20px;background:#f0f0f0;}
        .container{max-width:800px;margin:0 auto;background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}
        .sensor{margin:10px 0;padding:10px;background:#f9f9f9;border-radius:5px;display:flex;justify-content:space-between;}
        .value{font-weight:bold;color:#2196F3;}
        h1{color:#333;text-align:center;}
    </style>
</head>
<body>
    <div class='container'>
        <h1>🌱 Smart Hydroponic Tower</h1>
        <div id='sensors'>
            <div class='sensor'>💡 Light Level: <span class='value' id='light'>Loading...</span></div>
            <div class='sensor'>🌡️ Environment Temp: <span class='value' id='envTemp'>Loading...</span></div>
            <div class='sensor'>💧 Humidity: <span class='value' id='envHum'>Loading...</span></div>
            <div class='sensor'>🫁 CO2 Level: <span class='value' id='co2'>Loading...</span></div>
            <div class='sensor'>💦 Water Temp: <span class='value' id='waterTemp'>Loading...</span></div>
            <div class='sensor'>⚗️ pH Level: <span class='value' id='pH'>Loading...</span></div>
            <div class='sensor'>🌊 Water Level: <span class='value' id='waterLevel'>Loading...</span></div>
        </div>
        <p style='text-align:center;margin-top:20px;'><a href='/sensors'>📊 Raw JSON Data</a></p>
    </div>
    <script>
        function updateSensors() {
            fetch('/sensors')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('light').textContent = Math.round(data.lightLevel) + ' lux';
                    document.getElementById('envTemp').textContent = data.envTemp + ' °C';
                    document.getElementById('envHum').textContent = Math.round(data.envHum) + ' %';
                    document.getElementById('co2').textContent = data.CO2 + ' ppm';
                    document.getElementById('waterTemp').textContent = data.waterTemp + ' °C';
                    document.getElementById('pH').textContent = data.phLevel;
                    document.getElementById('waterLevel').textContent = data.waterLevel ? 'OK' : 'LOW';
                });
        }
        setInterval(updateSensors, 1000);
        updateSensors();
    </script>
</body>
</html>
)rawliteral";

#endif