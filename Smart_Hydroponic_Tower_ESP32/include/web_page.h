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
        .ph-section{margin-top:30px;padding:20px;background:#ffe3e3;border-radius:10px;}
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
            <div class='sensor'>⚗️ PH Level: <span class='value' id='pH'>Loading...</span></div>
            <div class='sensor'>⚡ EC Level: <span class='value' id='ec'>Loading...</span></div>
            <div class='sensor'>🌊 Water Level: <span class='value' id='waterLevel'>Loading...</span></div>
        </div>
        <div class='pump-section'>
            <h2>🚰 Pump Control</h2>
            <div class='sensor'>Status: <span class='value' id='pumpStatusText'>Loading...</span></div>
            <div class='sensor'>On Time: <span class='value' id='pumpOnTime'>Loading...</span></div>
            <div class='sensor'>Off Time: <span class='value' id='pumpOffTime'>Loading...</span></div>
            <button class='btn' id='toggleBtn' onclick='togglePump()'>Toggle Pump</button>
            <button class='btn' onclick='setPumpState(true)'>Set ON</button>
            <button class='btn' onclick='setPumpState(false)'>Set OFF</button>
            <div class='input-group'>
                <label for='onTime'>On Time (min):</label>
                <input type='number' id='onTime' min='1' value='15' style='width:60px;'>
                <label for='offTime'>Off Time (min):</label>
                <input type='number' id='offTime' min='1' value='45' style='width:60px;'>
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
        <div class='ph-section'>
            <h2>⚗️ pH Control</h2>
            <div class='sensor'>Status: <span class='value' id='phStatusText'>Loading...</span></div>
            <div class='sensor'>Target: <span class='value' id='phTarget'>Loading...</span></div>
            <div class='sensor'>Tolerance: <span class='value' id='phTolerance'>Loading...</span></div>
            <button class='btn' id='phUpBtn' onclick='togglePHUp()'>pH Up</button>
            <button class='btn' id='phDownBtn' onclick='togglePHDown()'>pH Down</button>
            <button class='btn' onclick='stopPHPumps()'>Stop pH Pumps</button>
            <div class='input-group'>
                <label for='phTargetInput'>Target pH:</label>
                <input type='number' id='phTargetInput' min='5.0' max='8.0' step='0.1' value='6.0' style='width:60px;'>
                <label for='phToleranceInput'>Tolerance:</label>
                <input type='number' id='phToleranceInput' min='0.1' max='1.0' step='0.1' value='0.5' style='width:60px;'>
                <button class='btn' onclick='updatePHControl()'>Update pH Control</button>
            </div>
            <div class='input-group'>
                <label for='phAutoMode'>Auto Mode:</label>
                <select id='phAutoMode' onchange='setPHAutoMode()'>
                    <option value='true'>Enabled</option>
                    <option value='false'>Disabled</option>
                </select>
            </div>
            <div class='api-result' id='phApiResult'></div>
        </div>
        <div class='pump-section' style='background:#e3f3ff;'>
            <h2>📊 Data Logging</h2>
            <div class='sensor'>Status: <span class='value' id='logStatus'>Loading...</span></div>
            <div class='sensor'>Last Upload: <span class='value' id='lastUpload'>Loading...</span></div>
            <div class='sensor'>Failed Uploads: <span class='value' id='failedUploads'>Loading...</span></div>
            <div class='sensor'>Next Log: <span class='value' id='nextLog'>Loading...</span></div>
            <button class='btn' id='logToggleBtn' onclick='toggleDataLogging()'>Toggle Logging</button>
            <button class='btn' onclick='triggerManualLog()'>Manual Upload</button>
            <button class='btn' onclick='testConnection()'>Test Connection</button>
            <div class='api-result' id='logApiResult'></div>
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
                    document.getElementById('ec').textContent = data.ecLevel + ' mS/cm';
                    document.getElementById('waterLevel').textContent = data.waterLevel ? 'OK' : 'LOW';
                });
        }

        function updatePumpStatus() {
            fetch('/pump/status')
                .then(response => response.json())
                .then(data => {
                    // Show status text in the main status field
                    let statusText = data.statusText;
                    document.getElementById('pumpStatusText').textContent = statusText;
                    
                    // Show On Time and Off Time in minutes, reflecting input
                    document.getElementById('pumpOnTime').textContent  =
                        data.onTime  ? data.onTime  + ' min' : 'N/A';
                    document.getElementById('pumpOffTime').textContent =
                        data.offTime ? data.offTime + ' min' : 'N/A';
                    document.getElementById('autoMode').value            = data.autoMode   ? 'true' : 'false';
             });
        }

        function showApiResult(msg, isError) {
            var el = document.getElementById('apiResult');
            el.textContent = msg;
            el.style.color = isError ? 'red' : 'green';
        }

        function togglePump() {
            // Set autoMode to false (manual) when toggling
            fetch('/pump/config?autoMode=false', {method: 'PUT'})
                .then(() => {
                    fetch('/pump/toggle', {method: 'POST'})
                        .then(response => response.json())
                        .then(data => {
                            updatePumpStatus();
                            showApiResult('Pump toggled: ' + (data.pumpStatus ? 'ON' : 'OFF'), false);
                        })
                        .catch(() => showApiResult('Failed to toggle pump', true));
                });
        }

        function setPumpState(state) {
            // Set autoMode to false (manual) when setting pump state
            fetch('/pump/config?autoMode=false', {method: 'PUT'})
                .then(() => {
                    fetch('/pump/state?state=' + (state ? 'on' : 'off'), {method: 'PUT'})
                        .then(response => response.json())
                        .then(data => {
                            updatePumpStatus();
                            showApiResult('Pump set to ' + (state ? 'ON' : 'OFF'), false);
                        })
                        .catch(() => showApiResult('Failed to set pump state', true));
                });
        }

        function updateSchedule() {
            var onTimeMin = document.getElementById('onTime').value;
            var offTimeMin = document.getElementById('offTime').value;
            // Set autoMode to true when updating schedule
           fetch('/pump/config?onTime=' + onTimeMin + '&offTime=' + offTimeMin + '&autoMode=true', { method: 'PUT' })
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Schedule updated: ' + onTimeMin + ' min ON, every ' + offTimeMin + ' min', false);
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

        // pH Control Functions
        function updatePHStatus() {
            fetch('/ph/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('phStatusText').textContent = data.statusText;
                    document.getElementById('phTarget').textContent = data.target;
                    document.getElementById('phTolerance').textContent = '±' + data.tolerance;
                    document.getElementById('phAutoMode').value = data.autoMode ? 'true' : 'false';
                    
                    // Update button styles based on pump status
                    document.getElementById('phUpBtn').textContent = data.phStatus ? 'pH Up (ON)' : 'pH Up (OFF)';
                    document.getElementById('phDownBtn').textContent = data.phDownStatus ? 'pH Down (ON)' : 'pH Down (OFF)';
                })
                .catch(() => {
                    document.getElementById('phStatusText').textContent = 'Error';
                });
        }

        function showPHApiResult(msg, isError) {
            var el = document.getElementById('phApiResult');
            el.textContent = msg;
            el.style.color = isError ? 'red' : 'green';
        }

        function togglePHUp() {
            fetch('/ph/up', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult(data.message, false);
                })
                .catch(() => showPHApiResult('Failed to toggle pH UP pump', true));
        }

        function togglePHDown() {
            fetch('/ph/down', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult(data.message, false);
                })
                .catch(() => showPHApiResult('Failed to toggle pH DOWN pump', true));
        }

        function stopPHPumps() {
            fetch('/ph/stop', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult(data.message, false);
                })
                .catch(() => showPHApiResult('Failed to stop pH pumps', true));
        }

        function updatePHControl() {
            var target = document.getElementById('phTargetInput').value;
            var tolerance = document.getElementById('phToleranceInput').value;
            fetch('/ph/config?target=' + target + '&tolerance=' + tolerance, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult('pH control updated: Target=' + target + ', Tolerance=±' + tolerance, false);
                })
                .catch(() => showPHApiResult('Failed to update pH control', true));
        }

        function setPHAutoMode() {
            var mode = document.getElementById('phAutoMode').value;
            fetch('/ph/config?autoMode=' + mode, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult('pH Auto mode set to ' + (mode === 'true' ? 'Enabled' : 'Disabled'), false);
                })
                .catch(() => showPHApiResult('Failed to set pH auto mode', true));
        }

        // Data Logging Functions
        function updateLogStatus() {
            fetch('/api/log/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('logStatus').textContent = data.enabled ? 'Enabled' : 'Disabled';
                    document.getElementById('lastUpload').textContent = data.lastStatus || 'Never';
                    document.getElementById('failedUploads').textContent = data.failedUploads || '0';
                    
                    // Calculate next log time (approximate)
                    if (data.enabled) {
                        document.getElementById('nextLog').textContent = 'Within 5 minutes';
                    } else {
                        document.getElementById('nextLog').textContent = 'Disabled';
                    }
                    
                    // Update button text
                    document.getElementById('logToggleBtn').textContent = 
                        data.enabled ? 'Disable Logging' : 'Enable Logging';
                })
                .catch(() => {
                    document.getElementById('logStatus').textContent = 'Error';
                });
        }

        function showLogApiResult(msg, isError) {
            var el = document.getElementById('logApiResult');
            el.textContent = msg;
            el.style.color = isError ? 'red' : 'green';
        }

        function toggleDataLogging() {
            // First get current status, then toggle
            fetch('/api/log/status')
                .then(response => response.json())
                .then(data => {
                    const newState = !data.enabled;
                    return fetch('/api/log/enable?enabled=' + newState, {method: 'PUT'});
                })
                .then(response => response.json())
                .then(data => {
                    updateLogStatus();
                    showLogApiResult('Data logging ' + (data.enabled ? 'enabled' : 'disabled'), false);
                })
                .catch(() => showLogApiResult('Failed to toggle data logging', true));
        }

        function triggerManualLog() {
            showLogApiResult('Uploading sensor data...', false);
            fetch('/api/log/trigger', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updateLogStatus();
                    showLogApiResult(data.message || 'Manual upload completed', false);
                })
                .catch(() => showLogApiResult('Failed to trigger manual upload', true));
        }

        function testConnection() {
            showLogApiResult('Testing connection...', false);
            fetch('/api/log/test', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    showLogApiResult(data.message || 'Connection test completed', data.success ? false : true);
                })
                .catch(() => showLogApiResult('Connection test failed', true));
        }

        setInterval(updateSensors, 1000);
        setInterval(updatePumpStatus, 1000);
        setInterval(updatePHStatus, 1000);  // Update pH status every 1 seconds
        setInterval(updateLogStatus, 5000);  // Update log status every 5 seconds
        updateSensors();
        updatePumpStatus();
        updatePHStatus();
        updateLogStatus();
    </script>
</body>
</html>
)rawliteral";

#endif