import pandas as pd
import requests
from gevent import spawn, sleep, monkey

monkey.patch_all()

def send_data():
    """
    This function:
    - reads the csv file;
    - updates timestamp so that between any point with different timestamp at least second will pass;
    - send points to the flask app
    :return:
    """
    df = pd.read_csv('/app/data/ip_addresses.csv')
    df['Timestamp'] = pd.to_datetime(df['Timestamp'] * 1000000000)
    df = df.sort_values('Timestamp')
    data = df.to_dict('records')
    initial_timestamp = data[0]['Timestamp']

    for point in data:
        point_time = point['Timestamp']
        time_diff = (point_time - initial_timestamp).total_seconds()
        initial_timestamp = point_time

        if time_diff > 0:
            print(time_diff, flush=True)
        sleep(time_diff)
        payload = {
            'ip': point['ip address'],
            'lat': point['Latitude'],
            'lng': point['Longitude'],
            'time': point['Timestamp'].isoformat(),
            'sus': point['suspicious']
        }
        try:
            response = requests.post(
                'http://localhost:5000/api/points',
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
        except Exception as e:
            print(f"Error sending point: {e}")

spawn(send_data).join()