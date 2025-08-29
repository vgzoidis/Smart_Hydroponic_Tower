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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, rgba(0, 255, 242, 1) 0%, rgba(0, 50, 47, 1)  100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(128, 128, 128, 0.3);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .header {
            background: linear-gradient(135deg, #00ff84ff 0%, #109756ff 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="20" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .main-content {
            padding: 30px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }
        
        .card {
            background: rgba(128, 128, 128, 0.2);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: bold;
            color: white;
            font-size: 1.2rem;
        }
        
        .sensors-icon { background: linear-gradient(135deg, #2196F3, #21CBF3); }
        .pump-icon { background: linear-gradient(135deg, rgb(0, 230, 118), rgb(0, 200, 100)); }
        .ph-icon { background: linear-gradient(135deg, #FF9800, #F57C00); }
        .data-icon { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }
        
        .card-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: white;
            margin: 0;
        }
        
        .sensor-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .sensor-item {
            background: rgba(128, 128, 128, 0.15);
            padding: 15px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .sensor-label {
            font-weight: 500;
            color: white;
        }
        
        .sensor-value {
            font-weight: 700;
            color: rgba(0, 255, 242, 1);
            font-size: 1.1rem;
        }
        
        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #2196F3, #21CBF3);
            color: white;
        }
        
        .btn-success {
            background: linear-gradient(135deg, rgb(0, 230, 118), rgb(0, 200, 100));
            color: white;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #FF9800, #F57C00);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        /* Toggle Switch Styles */
        .toggle-container {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 15px 0;
            padding: 12px;
            background: rgba(128, 128, 128, 0.15);
            border-radius: 10px;
            transition: background-color 0.3s ease;
        }
        
        .toggle-container:hover {
            background: rgba(128, 128, 128, 0.25);
        }
        
        .toggle-label {
            font-weight: 500;
            color: white;
            flex: 1;
        }
        
        .toggle-switch {
            position: relative;
            width: 60px;
            height: 30px;
            background: #ccc;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .toggle-switch.active {
            background: linear-gradient(135deg, rgb(0, 230, 118), rgb(0, 200, 100));
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .toggle-switch.pump-toggle.active {
            background: linear-gradient(135deg, rgb(0, 230, 118), rgb(0, 200, 100));
        }
        
        .toggle-switch.ph-toggle.active {
            background: linear-gradient(135deg, #FF9800, #F57C00);
        }
        
        .toggle-switch.auto-toggle.active {
            background: linear-gradient(135deg, #2196F3, #21CBF3);
        }
        
        .toggle-switch.data-toggle.active {
            background: linear-gradient(135deg, #9C27B0, #7B1FA2);
        }
        
        .toggle-slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            transition: all 0.3s ease;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .toggle-switch.active .toggle-slider {
            transform: translateX(30px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .input-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
            flex-wrap: wrap;
        }
        
        .input-group label {
            font-weight: 500;
            color: white;
            min-width: 100px;
        }
        
        .input-group input,
        .input-group select {
            padding: 8px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 0.95rem;
            transition: border-color 0.3s ease;
        }
        
        .input-group input:focus,
        .input-group select:focus {
            outline: none;
            border-color: #2196F3;
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        
        .api-result {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .status-indicators {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 20px 0;
        }
        
        .status-indicator {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(128, 128, 128, 0.15);
            border-radius: 10px;
            font-size: 0.95rem;
            color: white;
            transition: background-color 0.3s ease;
        }
        
        .status-indicator:hover {
            background: rgba(128, 128, 128, 0.25);
        }
        
        .status-indicator strong {
            color: rgba(0, 255, 242, 1);
            font-weight: 700;
        }
        
        .footer {
            background: linear-gradient(135deg, #00ff84ff 0%, #109756ff 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="20" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .footer a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .footer p {
            position: relative;
            z-index: 1;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .main-content {
                padding: 20px;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .controls {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Smart Hydroponic Tower</h1>
            <div class='subtitle'>Advanced Agricultural Monitoring System</div>
        </div>
        <div class='main-content'>
            <div class='grid'>
                <div class='card'>
                    <div class='card-header'>
                        <div class='card-icon sensors-icon'>S</div>
                        <h2 class='card-title'>Sensor Readings</h2>
                    </div>
                    <div class='sensor-grid'>
                        <div class='sensor-item'>
                            <span class='sensor-label'>Light Level</span>
                            <span class='sensor-value' id='light'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>Environment Temperature</span>
                            <span class='sensor-value' id='envTemp'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>Humidity</span>
                            <span class='sensor-value' id='envHum'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>CO2 Level</span>
                            <span class='sensor-value' id='co2'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>Water Temperature</span>
                            <span class='sensor-value' id='waterTemp'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>pH Level</span>
                            <span class='sensor-value' id='pH'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>EC Level</span>
                            <span class='sensor-value' id='ec'>Loading...</span>
                        </div>
                        <div class='sensor-item'>
                            <span class='sensor-label'>Water Level</span>
                            <span class='sensor-value' id='waterLevel'>Loading...</span>
                        </div>
                    </div>
                </div>

                <div class='card'>
                    <div class='card-header'>
                        <div class='card-icon pump-icon'>P</div>
                        <h2 class='card-title'>Pump Control</h2>
                    </div>
                    <div class='status-indicators'>
                        <div class='status-indicator'>
                            <span>Status:</span>
                            <span><strong id='pumpStatusText'>Loading...</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>On Time:</span>
                            <span> <strong id='pumpOnTime'>Loading...</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>Off Time:</span>
                            <span><strong id='pumpOffTime'>Loading...</strong></span>
                        </div>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>Water Pump</span>
                        <div class='toggle-switch pump-toggle' id='pumpToggle' onclick='togglePump()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    
                    <div class='input-group'>
                        <label for='onTime'>On Time (min):</label>
                        <input type='number' id='onTime' min='1' value='15' style='width:70px;'>
                        <label for='offTime'>Off Time (min):</label>
                        <input type='number' id='offTime' min='1' value='45' style='width:70px;'>
                        <button class='btn btn-success' onclick='updateSchedule()'>Update Schedule</button>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>Auto Mode</span>
                        <div class='toggle-switch auto-toggle' id='autoModeToggle' onclick='toggleAutoMode()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    <div class='api-result' id='apiResult'></div>
                </div>

                <div class='card'>
                    <div class='card-header'>
                        <div class='card-icon ph-icon'>pH</div>
                        <h2 class='card-title'>pH Control</h2>
                    </div>
                    <div class='status-indicators'>
                        <div class='status-indicator'>
                            <span>Status:</span>
                            <span><strong id='phStatusText'>Loading...</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>Target:</span>
                            <span><strong id='phTarget'>Loading...</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>Tolerance:</span>
                            <span><strong id='phTolerance'>Loading...</strong></span>
                        </div>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>pH Up Pump</span>
                        <div class='toggle-switch ph-toggle' id='phUpToggle' onclick='togglePHUp()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>pH Down Pump</span>
                        <div class='toggle-switch ph-toggle' id='phDownToggle' onclick='togglePHDown()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    
                    <div class='input-group'>
                        <label for='phTargetInput'>Target pH:</label>
                        <input type='number' id='phTargetInput' min='5.0' max='8.0' step='0.1' value='6.0' style='width:70px;'>
                        <label for='phToleranceInput'>Tolerance:</label>
                        <input type='number' id='phToleranceInput' min='0.1' max='1.0' step='0.1' value='0.5' style='width:70px;'>
                        <button class='btn btn-success' onclick='updatePHControl()'>Update pH Control</button>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>pH Auto Mode</span>
                        <div class='toggle-switch auto-toggle' id='phAutoModeToggle' onclick='togglePHAutoMode()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    <div class='api-result' id='phApiResult'></div>
                </div>

                <div class='card'>
                    <div class='card-header'>
                        <div class='card-icon data-icon'>D</div>
                        <h2 class='card-title'>Data Logging</h2>
                    </div>
                    <div class='status-indicators'>
                        <div class='status-indicator'>
                            <span>Status:</span>
                            <span><strong id='logStatus'>Loading...</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>Successful Uploads:</span>
                            <span><strong id='successfulUploads'>0</strong></span>
                        </div>
                        <div class='status-indicator'>
                            <span>Failed Uploads:</span>
                            <span><strong id='failedUploads'>Loading...</strong></span>
                        </div>
                    </div>
                    
                    <div class='toggle-container'>
                        <span class='toggle-label'>Data Logging</span>
                        <div class='toggle-switch data-toggle' id='dataLogToggle' onclick='toggleDataLogging()'>
                            <div class='toggle-slider'></div>
                        </div>
                    </div>
                    
                    <div class='controls'>
                        <button class='btn btn-success' onclick='triggerManualLog()'>Manual Upload</button>
                        <button class='btn btn-warning' onclick='testConnection()'>Test Connection</button>
                    </div>
                    <div class='api-result' id='logApiResult'></div>
                </div>
            </div>
        </div>
        <div class='footer'>
            <p><a href='https://supabase.com/dashboard/project/jnvbsbphxvypcuorolen/editor/17474?schema=public' target='_blank'>View Historical Data</a></p>
        </div>
    </div>
    <script>
        // Toggle helper functions
        function updateToggle(toggleId, statusId, isActive) {
            const toggle = document.getElementById(toggleId);
            
            if (isActive) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
        
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
                    document.getElementById('pumpStatusText').innerHTML = statusText;
                    
                    // Show On Time and Off Time in minutes, reflecting input
                    document.getElementById('pumpOnTime').textContent  =
                        data.onTime  ? data.onTime  + ' min' : 'N/A';
                    document.getElementById('pumpOffTime').textContent =
                        data.offTime ? data.offTime + ' min' : 'N/A';
                    
                    // Update toggle switches
                    updateToggle('pumpToggle', null, data.pumpStatus);
                    updateToggle('autoModeToggle', null, data.autoMode);
             });
        }

        function showApiResult(msg, isError) {
            var el = document.getElementById('apiResult');
            el.textContent = msg;
            el.style.color = isError ? '#f44336' : '#4CAF50';
            el.style.background = isError ? '#ffebee' : '#e8f5e8';
            el.style.padding = '12px';
            el.style.borderRadius = '8px';
            el.style.border = '1px solid ' + (isError ? '#ffcdd2' : '#c8e6c9');
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
        
        // New toggle functions
        function toggleAutoMode() {
            const toggle = document.getElementById('autoModeToggle');
            const isActive = toggle.classList.contains('active');
            const newMode = !isActive;
            
            fetch('/pump/config?autoMode=' + newMode, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePumpStatus();
                    showApiResult('Auto mode ' + (newMode ? 'Enabled' : 'Disabled'), false);
                })
                .catch(() => showApiResult('Failed to toggle auto mode', true));
        }

        // pH Control Functions
        function updatePHStatus() {
            fetch('/ph/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('phStatusText').innerHTML = data.statusText;
                    document.getElementById('phTarget').textContent = data.target;
                    document.getElementById('phTolerance').textContent = '±' + data.tolerance;
                    
                    // Update toggle switches
                    updateToggle('phUpToggle', null, data.phStatus);
                    updateToggle('phDownToggle', null, data.phDownStatus);
                    updateToggle('phAutoModeToggle', null, data.autoMode);
                })
                .catch(() => {
                    document.getElementById('phStatusText').innerHTML = 'Loading...';
                });
        }

        function showPHApiResult(msg, isError) {
            var el = document.getElementById('phApiResult');
            el.textContent = msg;
            el.style.color = isError ? '#f44336' : '#4CAF50';
            el.style.background = isError ? '#ffebee' : '#e8f5e8';
            el.style.padding = '12px';
            el.style.borderRadius = '8px';
            el.style.border = '1px solid ' + (isError ? '#ffcdd2' : '#c8e6c9');
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
        
        // New pH toggle functions
        function togglePHAutoMode() {
            const toggle = document.getElementById('phAutoModeToggle');
            const isActive = toggle.classList.contains('active');
            const newMode = !isActive;
            
            fetch('/ph/config?autoMode=' + newMode, {method: 'PUT'})
                .then(response => response.json())
                .then(data => {
                    updatePHStatus();
                    showPHApiResult('pH Auto mode ' + (newMode ? 'Enabled' : 'Disabled'), false);
                })
                .catch(() => showPHApiResult('Failed to toggle pH auto mode', true));
        }

        // Data Logging Functions
        function updateLogStatus() {
            fetch('/api/log/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('logStatus').textContent = data.enabled ? 'Enabled (Every 5 mins)' : 'Disabled';
                    document.getElementById('successfulUploads').textContent = data.successfulUploads || '0';
                    document.getElementById('failedUploads').textContent = data.failedUploads || '0';
                    
                    // Update toggle switch
                    updateToggle('dataLogToggle', null, data.enabled);
                })
                .catch(() => {
                    document.getElementById('logStatus').textContent = 'Error';
                });
        }

        function showLogApiResult(msg, isError) {
            var el = document.getElementById('logApiResult');
            el.textContent = msg;
            el.style.color = isError ? '#f44336' : '#4CAF50';
            el.style.background = isError ? '#ffebee' : '#e8f5e8';
            el.style.padding = '12px';
            el.style.borderRadius = '8px';
            el.style.border = '1px solid ' + (isError ? '#ffcdd2' : '#c8e6c9');
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