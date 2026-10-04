import React, { useEffect, useMemo, useRef, useState } from "react";

const TILE_SIZE = 256;
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function toWorld({ lat, lng }, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const safeLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const sin = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function fromWorld(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const wrappedX = ((x % scale) + scale) % scale;
  const lng = (wrappedX / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

export default function Map({ region, reports = [], regions = [], onSelectRegion }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [center, setCenter] = useState({ lat: region.lat, lng: region.lng });
  const [zoom, setZoom] = useState(7);

  useEffect(() => {
    setCenter({ lat: region.lat, lng: region.lng });
  }, [region.id, region.lat, region.lng]);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const centerWorld = useMemo(() => toWorld(center, zoom), [center, zoom]);
  const tiles = useMemo(() => {
    if (!size.width || !size.height) return [];
    const x0 = Math.floor((centerWorld.x - size.width / 2) / TILE_SIZE);
    const x1 = Math.floor((centerWorld.x + size.width / 2) / TILE_SIZE);
    const y0 = Math.floor((centerWorld.y - size.height / 2) / TILE_SIZE);
    const y1 = Math.floor((centerWorld.y + size.height / 2) / TILE_SIZE);
    const count = 2 ** zoom;
    const result = [];
    for (let tileY = y0; tileY <= y1; tileY += 1) {
      if (tileY < 0 || tileY >= count) continue;
      for (let tileX = x0; tileX <= x1; tileX += 1) {
        const wrappedX = ((tileX % count) + count) % count;
        result.push({
          key: `${zoom}/${wrappedX}/${tileY}`,
          src: TILE_URL.replace("{z}", zoom).replace("{x}", wrappedX).replace("{y}", tileY),
          left: tileX * TILE_SIZE - centerWorld.x + size.width / 2,
          top: tileY * TILE_SIZE - centerWorld.y + size.height / 2,
        });
      }
    }
    return result;
  }, [centerWorld, size, zoom]);

  const markers = useMemo(() => regions.map((district) => ({
    ...district,
    ...toWorld(district, zoom),
    selected: district.id === region.id,
  })), [regions, region.id, zoom]);

  function startDrag(event) {
    if (event.button !== 0) return;
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, worldX: centerWorld.x, worldY: centerWorld.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    setCenter(fromWorld(drag.worldX - (event.clientX - drag.pointerX), drag.worldY - (event.clientY - drag.pointerY), zoom));
  }

  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div
      className="map osmMap"
      ref={mapRef}
      role="region"
      aria-label={`OpenStreetMap centered on ${region.name}`}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={(event) => {
        if (event.deltaY === 0) return;
        setZoom((value) => Math.max(5, Math.min(12, value + (event.deltaY < 0 ? 1 : -1))));
      }}
    >
      <div className="osmTiles" aria-hidden="true">
        {tiles.map((tile) => <img key={tile.key} src={tile.src} alt="" draggable="false" style={{ left: tile.left, top: tile.top }} />)}
      </div>
      <div className="osmDistricts">
        {markers.map((district) => {
          const left = district.x - centerWorld.x + size.width / 2;
          const top = district.y - centerWorld.y + size.height / 2;
          if (left < -25 || left > size.width + 25 || top < -25 || top > size.height + 25) return null;
          return (
            <button
              type="button"
              className={`osmMarker${district.selected ? " selected" : ""}`}
              key={district.id}
              style={{ left, top }}
              title={district.name}
              aria-label={`Select ${district.name}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelectRegion?.(district.id)}
            >
              <span />
              {district.selected && <b>{district.name}</b>}
            </button>
          );
        })}
        {reports.filter((report) => Number.isFinite(report.lat) && Number.isFinite(report.lng)).map((report, index) => {
          const point = toWorld(report, zoom);
          const left = point.x - centerWorld.x + size.width / 2;
          const top = point.y - centerWorld.y + size.height / 2;
          if (left < -18 || left > size.width + 18 || top < -18 || top > size.height + 18) return null;
          return <span className="osmReportMarker" key={report.id || `report-${index}`} title={`${report.area ? `${report.area} · ` : ""}${report.type || "Affected area"}${report.sample ? " · Sample report" : ""}`} style={{ left, top }} />;
        })}
      </div>
      <div className="osmZoom" aria-label="Map zoom controls">
        <button type="button" aria-label="Zoom in" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.min(12, value + 1))}>+</button>
        <button type="button" aria-label="Zoom out" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.max(5, value - 1))}>−</button>
      </div>
      <a className="osmAttribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()}>© OpenStreetMap contributors</a>
    </div>
  );
}
