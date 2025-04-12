let scene, camera, renderer, globe, points = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    createGlobe();

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onDocumentClick, false);

    animate();

    fetchData();
    setInterval(fetchStats, 2000);
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://unpkg.com/three-globe@2.24.7/example/img/earth-blue-marble.jpg');
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe@2.24.7/example/img/earth-topology.png');

    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: bumpMap,
        bumpScale: 0.05,
        specular: new THREE.Color('grey'),
        shininess: 5
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
}

function fetchData() {
    fetch('/api/points')
        .then(response => response.json())
        .then(data => {
            updatePoints(data);
            setTimeout(fetchData, 1000);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setTimeout(fetchData, 5000);
        });
}

function fetchStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            updateStats(data);
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
        });
}

function updatePoints(newPoints) {
    points.forEach(point => scene.remove(point));
    points = [];

    newPoints.forEach(pointData => {
        const lat = pointData.lat;
        const lng = pointData.lng;
        const suspicious = pointData.sus === 1.0;

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const radius = 1.01;

        const x = - (radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const geometry = new THREE.SphereGeometry(0.01, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: suspicious ? 0xff0000 : 0x00ff00
        });
        const point = new THREE.Mesh(geometry, material);
        point.position.set(x, y, z);
        point.userData = { ip: pointData.ip };

        scene.add(point);
        points.push(point);
    });
}

function updateStats(stats) {
    const ipList = document.getElementById('ip-list');
    ipList.innerHTML = '';

    stats.top_ips.forEach(ipData => {
        const li = document.createElement('li');
        li.textContent = `${ipData.ip}: ${ipData.count} signals`;
        ipList.appendChild(li);
    });

    const percElement = document.getElementById('suspicious-percentage');
    percElement.textContent = `${stats.suspicious_percentage.toFixed(1)}%`;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(points);

    if (intersects.length > 0) {
        const ip = intersects[0].object.userData.ip;
        alert(`IP Address: ${ip}`);
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();