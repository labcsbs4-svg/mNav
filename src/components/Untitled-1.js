// ...existing code...

// Add delete options to the context menu
let contextMenu = L.popup();

map.on('contextmenu', function(e) {
    let content = `
        <div class="context-menu">
            <button onclick="addLocation(${e.latlng.lat}, ${e.latlng.lng})">Add Location</button>
            <button onclick="addRoad()">Add Road</button>
            <button onclick="deleteLocation()">Delete Location</button>
            <button onclick="deleteRoad()">Delete Road</button>
        </div>
    `;
    
    contextMenu
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);
});

// Add delete functions
function deleteLocation() {
    map.on('click', function onLocationClick(e) {
        let clickedPoint = e.latlng;
        let markers = [];
        
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                markers.push(layer);
            }
        });
        
        let nearestMarker = findNearestMarker(clickedPoint, markers);
        if (nearestMarker) {
            map.removeLayer(nearestMarker);
        }
        
        map.off('click', onLocationClick);
    });
}

function deleteRoad() {
    map.on('click', function onRoadClick(e) {
        let clickedPoint = e.latlng;
        let polylines = [];
        
        map.eachLayer((layer) => {
            if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                polylines.push(layer);
            }
        });
        
        let nearestRoad = findNearestRoad(clickedPoint, polylines);
        if (nearestRoad) {
            map.removeLayer(nearestRoad);
        }
        
        map.off('click', onRoadClick);
    });
}

// Helper function to find nearest marker
function findNearestMarker(clickedPoint, markers) {
    if (markers.length === 0) return null;
    
    let nearest = markers[0];
    let minDist = clickedPoint.distanceTo(nearest.getLatLng());
    
    markers.forEach(marker => {
        let dist = clickedPoint.distanceTo(marker.getLatLng());
        if (dist < minDist) {
            minDist = dist;
            nearest = marker;
        }
    });
    
    return minDist < 20 ? nearest : null; // Only delete if within 20 pixels
}

// Helper function to find nearest road
function findNearestRoad(clickedPoint, polylines) {
    if (polylines.length === 0) return null;
    
    let nearest = null;
    let minDist = Infinity;
    
    polylines.forEach(polyline => {
        let latlngs = polyline.getLatLngs();
        for (let i = 0; i < latlngs.length - 1; i++) {
            let dist = distanceToSegment(clickedPoint, latlngs[i], latlngs[i + 1]);
            if (dist < minDist) {
                minDist = dist;
                nearest = polyline;
            }
        }
    });
    
    return minDist < 20 ? nearest : null; // Only delete if within 20 pixels
}

// Helper function to calculate distance from point to line segment
function distanceToSegment(point, start, end) {
    let p = L.point(point.lat, point.lng);
    let a = L.point(start.lat, start.lng);
    let b = L.point(end.lat, end.lng);
    
    let dist = L.LineUtil.pointToSegmentDistance(p, a, b);
    return dist;
}