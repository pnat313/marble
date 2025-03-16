from flask import Flask, jsonify, request
import pymavlink.mavutil as mavutil
import os
from flask_cors import CORS
import datetime
import subprocess
import platform

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
latest_file_path = None

def force_release_file(filepath):
    """Attempts to force release a file by terminating processes holding it."""

    try:
        if platform.system() == "Windows":
            powershell_command = f'Get-Process | Where-Object {{$_.Modules.FileName -like "*{os.path.basename(filepath)}*"}} | ForEach-Object {{ taskkill /F /PID $_.Id }}'
            subprocess.run(["powershell", "-Command", powershell_command], check=False)
        elif platform.system() == "Linux" or platform.system() == "Darwin":
            lsof_output = subprocess.check_output(["lsof", filepath]).decode()
            lines = lsof_output.strip().split("\n")[1:]
            for line in lines:
                pid = line.split()[1]
                subprocess.run(["kill", "-9", pid], check=False)
        else:
            print("Unsupported operating system.")
            return

        print(f"Attempted to release file: {filepath}")

    except Exception as e:
        print(f"Error releasing file: {e}")

def parse_tlog(file_path):
    if not os.path.exists(file_path):
        return []
    
    master = mavutil.mavlink_connection(file_path)
    flight_data = []
    
    while True:
        msg = master.recv_match()
        if msg is None:
            break
        
        if msg.get_type() == 'GPS_RAW_INT':
            data_entry = {
                "lat": msg.lat / 1e7,
                "lon": msg.lon / 1e7,
                "altitude": msg.alt / 1000,
                "speed": None,
                "heading": None,
                "timestamp": msg._timestamp, 
            }
            flight_data.append(data_entry)
        
        elif msg.get_type() == 'VFR_HUD' and flight_data:
            flight_data[-1]["speed"] = msg.groundspeed
            flight_data[-1]["heading"] = msg.heading
            flight_data[-1]["timestamp"] = msg._timestamp 
    
    return flight_data

def estimate_flight_duration(tlog_filepath):
    """
    Estimates the total flight duration in minutes from a MAVLink tlog file.
    """
    try:
        mlog = mavutil.mavlink_connection(tlog_filepath)

        start_time = None
        end_time = None

        while True:
            msg = mlog.recv_match(blocking=False)
            if not msg:
                break

            if msg.get_type() == "HEARTBEAT":
                if msg.system_status == mavutil.mavlink.MAV_STATE_ACTIVE and start_time is None:
                    start_time = msg._timestamp
                elif msg.system_status == mavutil.mavlink.MAV_STATE_STANDBY:
                    end_time = msg._timestamp

            elif msg.get_type() == "COMMAND_ACK" and msg.command == mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM:
                if msg.result == mavutil.mavlink.MAV_RESULT_ACCEPTED:
                    if msg.param1 == 1.0 and start_time is None:
                        start_time = msg._timestamp
                    elif msg.param1 == 0.0:
                        end_time = msg._timestamp

        if start_time and end_time:
            duration_seconds = end_time - start_time
            duration_minutes = duration_seconds / 60.0
            return duration_minutes
        else:
            return None

    except Exception as e:
        print(f"Error processing tlog file: {e}")
        return None

@app.route('/flight-data', methods=['GET'])
def get_flight_data():
    global latest_file_path
    if not latest_file_path or not os.path.exists(latest_file_path):
        return jsonify({"error": "No uploaded file available"}), 400
    
    data = parse_tlog(latest_file_path)
    return jsonify(data)

@app.route('/upload-tlog', methods=['POST'])
def upload_tlog():
    global latest_file_path
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if latest_file_path and os.path.exists(latest_file_path):
        force_release_file(latest_file_path) #force release
        os.remove(latest_file_path)
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    latest_file_path = file_path
    
    return jsonify({"message": "File uploaded successfully", "file_path": file_path})

if __name__ == '__main__':
    app.run(debug=True)