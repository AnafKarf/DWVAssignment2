from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
from gevent import monkey
from gevent.pywsgi import WSGIServer
from datetime import datetime, timedelta
from gevent import spawn

monkey.patch_all()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

active_points = []
active_ips = {}
suspicious_count = 0
total_count = 0
now = -1


def cleanup_points():
    """
    This function checks that all active points do not live for more than 10 seconds.
    :return:
    """
    global active_points, active_ips, suspicious_count, total_count, now
    while True:
        if len(active_points) != 0:
            if now == -1:
               now = datetime.fromisoformat(active_points[0]['time'])
            else:
                now += timedelta(seconds=1)
            points_to_keep = []
            ips_to_update = {}

            new_suspicious = 0
            new_total = 0

            for point in active_points:
                point_time = datetime.fromisoformat(point['time'])
                if (now - point_time) < timedelta(seconds=10):
                    points_to_keep.append(point)
                    ip = point['ip']
                    ips_to_update[ip] = ips_to_update.get(ip, 0) + 1
                    if point['sus'] == 1:
                        new_suspicious += 1
                    new_total += 1
                else:
                    print('removed', point)

            active_points = points_to_keep
            active_ips = ips_to_update
            suspicious_count = new_suspicious
            total_count = new_total

        from gevent import sleep
        print('sleep', flush=True)
        sleep(1)


spawn(cleanup_points)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


@app.route('/api/points', methods=['POST'])
def add_point():
    global suspicious_count, total_count
    data = request.json
    active_points.append(data)
    ip = data['ip']
    active_ips[ip] = active_ips.get(ip, 0) + 1
    if data['sus'] == 1:
        suspicious_count += 1
    total_count += 1

    return jsonify({"status": "success"})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    sorted_ips = sorted(active_ips.items(), key=lambda x: x[1], reverse=True)[:5]
    top_ips = [{"ip": ip, "count": count} for ip, count in sorted_ips]

    suspicious_percentage = (suspicious_count / total_count * 100) if total_count > 0 else 0

    return jsonify({
        "top_ips": top_ips,
        "suspicious_percentage": suspicious_percentage
    })


@app.route('/api/points', methods=['GET'])
def get_points():
    return jsonify(active_points)

http_server = WSGIServer(('0.0.0.0', 5000), app)
http_server.serve_forever()