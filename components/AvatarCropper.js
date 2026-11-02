'use client';
import { useEffect, useRef, useState } from 'react';

// Profielfoto bijsnijden: slepen om te verschuiven, knijpen/schuifje om in te zoomen
const V = 280; // grootte van het kader op het scherm

export default function AvatarCropper({ file, onDone, onCancel }) {
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinch = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => {
      setImg(i);
      const s0 = V / Math.min(i.naturalWidth, i.naturalHeight);
      // begin gecentreerd, iets boven het midden (gezicht)
      setPos({ x: (V - i.naturalWidth * s0) / 2, y: Math.min(0, (V - i.naturalHeight * s0) * 0.35) });
    };
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!img) return <div className="cropper-wrap"><div className="cropper skeleton" /></div>;

  const w = img.naturalWidth, h = img.naturalHeight;
  const s = (V / Math.min(w, h)) * zoom;
  const clamp = (p, sc = s) => ({
    x: Math.min(0, Math.max(V - w * sc, p.x)),
    y: Math.min(0, Math.max(V - h * sc, p.y)),
  });
  const view = clamp(pos);

  // inzoomen rond het midden van het kader
  function setZoomAround(z) {
    const nz = Math.min(4, Math.max(1, z));
    const ns = (V / Math.min(w, h)) * nz;
    const cx = (V / 2 - view.x) / s, cy = (V / 2 - view.y) / s;
    setPos(clamp({ x: V / 2 - cx * ns, y: V / 2 - cy * ns }, ns));
    setZoom(nz);
  }

  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom };
    }
  }
  function move(e) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      setZoomAround(pinch.current.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d));
    } else if (pointers.current.size === 1) {
      setPos(clamp({ x: view.x + (cur.x - prev.x), y: view.y + (cur.y - prev.y) }));
    }
  }
  function up(e) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  function done() {
    const out = 400, c = document.createElement('canvas');
    c.width = out; c.height = out;
    c.getContext('2d').drawImage(img, -view.x / s, -view.y / s, V / s, V / s, 0, 0, out, out);
    onDone(c.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div className="cropper-wrap" role="dialog" aria-label="Profielfoto bijsnijden">
      <p className="small muted">Sleep om te verschuiven, knijp of gebruik het schuifje om in te zoomen.</p>
      <div className="cropper" style={{ width: V, height: V }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onWheel={(e) => setZoomAround(zoom * (e.deltaY < 0 ? 1.08 : 0.93))}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt="" draggable={false} style={{ width: w * s, height: h * s, transform: `translate(${view.x}px, ${view.y}px)` }} />
        <span className="cropper-ring" aria-hidden="true" />
      </div>
      <div className="zoom-row">
        <span aria-hidden="true">−</span>
        <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(e) => setZoomAround(+e.target.value)} aria-label="Inzoomen" id="crop-zoom" />
        <span aria-hidden="true">+</span>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-gold" onClick={done}>Gebruik deze foto</button>
        <button type="button" className="btn btn-line" onClick={onCancel}>Annuleren</button>
      </div>
    </div>
  );
}
