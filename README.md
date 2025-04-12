# Traffic Visualization

This project visualizes signals obtained from data/ip_addresses.csv files using Three.js. 

## How to start

Ensure you have docker and docker-compose

```angular2html
docker-compose up --build
```

Go to localhost:5000

**Note**: The data is sent only once, and there is no way to reverse the process, except for restarting the container!

## What I learned

I have already used Docker for other subjects, however I have not used Three.js very much, so it was a new experience for me.
Managing two separate apps for data processing and backend was also little bit hard, and I am not sure if the implementation is very good.
I also had to tweek the timestamps, so that the data processes slower, otherwise my computer could not handle the visualization.

## Structure

### backend
Directory containing all the files needed for backend
1. Static - everything for javascript visualization: javascript file and css
2. Templates - basic html for visualization
3. app.py - backend app with api and data processing, also managed the frontend creation
4. Dockerfile - docker file for backend
5. requirements.txt - file with requirements needed for application to work
6. sender.py - file that processes data from data folder and sends it to Flask server created by app.py

### data
Simply contains the file with needed data

### docker-compose.yaml
Simple docker-compose file that starts the backend
