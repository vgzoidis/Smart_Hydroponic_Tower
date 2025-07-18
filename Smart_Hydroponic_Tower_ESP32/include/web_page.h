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
        .pump-section{margin-top:30px;padding:20px;background:#e3f7e3;border-radius:10px;}
        .api-result{margin-top:10px;color:#444;font-size:0.95em;}
        .btn{padding:8px 16px;margin:5px;font-size:1em;border-radius:5px;border:none;background:#2196F3;color:white;cursor:pointer;}
        .btn:disabled{background:#aaa;}
        .input-group{margin:10px 0;}
        label{margin-right:10px;}
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
        <div class='pump-section'>
            <h2>🚰 Pump Control</h2>
            <div class='sensor'>Status: <span class='value' id='pumpStatus'>Loading...</span></div>
            <div class='sensor'>Mode: <span class='value' id='pumpMode'>Loading...</span></div>
            <div class='sensor'>Duration: <span class='value' id='pumpDuration'>Loading...</span> min</div>
            <div class='sensor'>Interval: <span class='value' id='pumpInterval'>Loading...</span> min</div>
            <div class='sensor'>Status Text: <span class='value' id='pumpStatusText'>Loading...</span></div>
            <button class='btn' id='toggleBtn' onclick='togglePump()'>Toggle Pump</button>
            <button class='btn' onclick='setPumpState(true)'>Set ON</button>
            <button class='btn' onclick='setPumpState(false)'>Set OFF</button>
            <div class='input-group'>
                <label for='duration'>Duration (min):</label>
                <input type='number' id='duration' min='1' value='1' style='width:60px;'>
                <label for='interval'>Interval (min):</label>
                <input type='number' id='interval' min='1' value='5' style='width:60px;'>
                <button class='btn' onclick='updateSchedule()'>Update Schedule</button>
            </div>
            <div class='input-group'>
                <label for='autoMode'>Auto Mode:</label>
                <select id='autoMode' onchange='setAutoMode()'>
                    <option value='true'>Enabled</option>
                    <option value='false'>Disabled</option>
                </select>
            </div>
            <div class='api-result' id='apiResult'></div>
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

        function updatePumpStatus() {
            fetch('/pump/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('pumpStatus').textContent = data.pumpStatus ? 'ON' : 'OFF';
                    document.getElementById('pumpMode').textContent = data.autoMode ? 'Auto' : 'Manual';
                    document.getElementById('pumpDuration').textContent = data.duration ? data.duration : (data.onTime ? data.onTime : 'N/A');
                    document.getElementById('pumpInterval').textContent = data.interval ? data.interval : (data.offTime ? data.offTime : 'N/A');
                    document.getElementById('pumpStatusText').textContent = data.statusText;
                    document.getElementById('autoMode').value = data.autoMode ? 'true' : 'false';
                });
        }

        function showApiResult(msg, isError) {
            var el = document.getElementById('apiResult');
            el.textContent = msg;
            el.style.color = isError ? 'red' : 'green';
        }

        function togglePump() {
            fetch('/pump/toggle', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Pump toggled: ' + (data.pumpStatus ? 'ON' : 'OFF'), false);
                })
                .catch(() => showApiResult('Failed to toggle pump', true));
        }

        function setPumpState(state) {
            fetch('/pump/state?state=' + (state ? 'on' : 'off'), {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Pump set to ' + (state ? 'ON' : 'OFF'), false);
                })
                .catch(() => showApiResult('Failed to set pump state', true));
        }

        function updateSchedule() {
            var duration = document.getElementById('duration').value;
            var interval = document.getElementById('interval').value;
            fetch('/pump/schedule?duration=' + duration + '&interval=' + interval, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Schedule updated: ' + duration + ' min ON, every ' + interval + ' min', false);
                })
                .catch(() => showApiResult('Failed to update schedule', true));
        }

        function setAutoMode() {
            var mode = document.getElementById('autoMode').value;
            fetch('/pump/config?autoMode=' + mode, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Auto mode set to ' + (mode === 'true' ? 'Enabled' : 'Disabled'), false);
                })
                .catch(() => showApiResult('Failed to set auto mode', true));
        }

        setInterval(updateSensors, 2000);
        setInterval(updatePumpStatus, 2000);
        updateSensors();
        updatePumpStatus();
    </script>
</body>
</html>
)rawliteral";

#endif