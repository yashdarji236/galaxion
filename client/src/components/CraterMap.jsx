import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CraterMap({
  lat = -87.32,
  lon = 65.18,
  iceZones = null,
  landingSite = null,
  roverPath = [],
  isScanning = false,
  isDetected = false,
  activeFilters = { high: true, medium: true, low: true }
}) {
  const containerRef = useRef(null);
  
  // HUD popup overlays state
  const [popupInfo, setPopupInfo] = useState(null);

  // Rover texture preloading states
  const [roverLoaded, setRoverLoaded] = useState(false);
  const roverTextureRef = useRef(null);

  // References to keep track of Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moonGroupRef = useRef(null);
  const scannerShellRef = useRef(null);
  const sweepRingRef = useRef(null);
  const pulsingRingRef = useRef(null);
  const pulsingRingMatRef = useRef(null);
  const highDotsRef = useRef([]);
  const clickableDotsRef = useRef([]); // Target array for Raycasting
  const landingMarkerRef = useRef(null);
  const roverPathLineRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Lat/Lon to Cartesian 3D coordinates on sphere of radius R
  const getCartesian = (latitude, longitude, radius) => {
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;

    const x = radius * Math.cos(latRad) * Math.sin(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.cos(lonRad);

    return new THREE.Vector3(x, y, z);
  };

  // Helper to construct a canvas text sprite that always faces the camera
  const makeTextSprite = (mainText, subText = '') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Background card border/fill
    ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border color depending on Vikram vs Pragyan
    ctx.strokeStyle = subText ? '#00ff66' : '#FFD700'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Text labels
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    if (subText) {
      // Two lines layout (Lander)
      ctx.font = 'bold 14px monospace';
      ctx.fillText(mainText, canvas.width / 2, 22);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(subText, canvas.width / 2, 42);
    } else {
      // Single line layout (Rover)
      ctx.font = 'bold 13px monospace';
      ctx.fillText(mainText, canvas.width / 2, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.68, 0.17, 1.0);
    return sprite;
  };

  // Fallback procedural gray moon texture with crater shadows
  const generateProceduralMoonTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#55555c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 1.5;
      const grey = Math.floor(Math.random() * 40) + 50;
      ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
      ctx.fillRect(x, y, size, size);
    }

    const craterCount = 100;
    for (let i = 0; i < craterCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 5;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#222226';
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.stroke();

      const grad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, radius * 0.1, x, y, radius);
      grad.addColorStop(0, '#35353c');
      grad.addColorStop(1, '#4c4c54');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#7c7c84';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, radius, Math.PI * 0.75, Math.PI * 1.75);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    let currentZoom = 8.5;
    camera.position.set(0, 0, currentZoom);
    camera.up.set(0, 1, 0); // standard Y-up
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights - Sun Simulation for depth shadows
    const ambientLight = new THREE.AmbientLight(0x222230, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(6, -2, 6);
    scene.add(sunLight);

    // 5. Moon Globe Group
    const moonGroup = new THREE.Group();
    moonGroupRef.current = moonGroup;
    scene.add(moonGroup);

    const moonRadius = 3.5;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 64, 64);
    
    const moonMat = new THREE.MeshPhongMaterial({
      shininess: 5,
      bumpScale: 0.8
    });

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Texture loaders
    const primaryTexture = 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg';
    const fallbackTexture = 'https://threejs.org/examples/textures/planets/moon_1024.jpg';

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
      primaryTexture,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        moonMat.map = tex;
        moonMat.bumpMap = tex;
        moonMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('Primary NASA texture blocked, trying fallback...');
        textureLoader.load(
          fallbackTexture,
          (fallbackTex) => {
            fallbackTex.wrapS = THREE.RepeatWrapping;
            moonMat.map = fallbackTex;
            moonMat.bumpMap = fallbackTex;
            moonMat.needsUpdate = true;
          },
          undefined,
          (err2) => {
            console.warn('Fallback failed, drawing procedural craters.');
            const procTex = generateProceduralMoonTexture();
            moonMat.map = procTex;
            moonMat.bumpMap = procTex;
            moonMat.needsUpdate = true;
          }
        );
      }
    );

    // Preload & Chroma-key the Pragyan Rover asset image
    const img = new Image();
    img.src = '/pragyan_rover.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Filter out solid white background (R, G, B > 230)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) {
          data[i + 3] = 0; // alpha = transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      roverTextureRef.current = tex;
      setRoverLoaded(true);
    };

    // 6. Scanner Animations
    const scannerGeo = new THREE.SphereGeometry(moonRadius + 0.08, 24, 24);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0x4A90D9,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const scannerShell = new THREE.Mesh(scannerGeo, scannerMat);
    moonGroup.add(scannerShell);
    scannerShellRef.current = scannerShell;

    const sweepRingGeo = new THREE.RingGeometry(moonRadius + 0.03, moonRadius + 0.12, 64);
    const sweepRingMat = new THREE.MeshBasicMaterial({
      color: 0x4A90D9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const sweepRing = new THREE.Mesh(sweepRingGeo, sweepRingMat);
    sweepRing.rotation.x = Math.PI / 2;
    moonGroup.add(sweepRing);
    sweepRingRef.current = sweepRing;

    // 7. Interactive Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Angles matching the auto-tilted camera view (tilt Moon by -87 degrees around X-axis on load)
    let targetRotationX = -1.5184;
    let targetRotationY = 0;
    
    let idleTimer = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      idleTimer = 0;
      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      targetRotationY += deltaMove.x * 0.005;
      targetRotationX += deltaMove.y * 0.005;

      targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUpOrLeave = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      currentZoom += e.deltaY * 0.005;
      currentZoom = Math.max(5.5, Math.min(13.0, currentZoom));
    };

    // 8. Raycast Click handlers for clusters clicks
    const handleCanvasClick = (e) => {
      if (isScanning) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(clickableDotsRef.current);
      if (intersects.length > 0) {
        const dot = intersects[0].object;
        const xPos = e.clientX - rect.left;
        const yPos = e.clientY - rect.top;
        
        setPopupInfo({
          x: xPos,
          y: yPos,
          name: dot.userData.name,
          cpr: dot.userData.cpr,
          dop: dot.userData.dop,
          confidence: dot.userData.confidence
        });
      } else {
        setPopupInfo(null);
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUpOrLeave);
    container.addEventListener('mouseleave', handleMouseUpOrLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleCanvasClick);

    // 9. Render Loop
    let sweepProgress = 0;
    let pulseScale = 0.2;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Camera updates
      camera.position.z += (currentZoom - camera.position.z) * 0.15;
      camera.position.x = 0;
      camera.position.y = 0;
      camera.lookAt(0, 0, 0);

      // Group rotation updates
      moonGroup.rotation.x += (targetRotationX - moonGroup.rotation.x) * 0.15;
      moonGroup.rotation.y += (targetRotationY - moonGroup.rotation.y) * 0.15;

      // Idle Rotation
      if (!isDragging && !isScanning) {
        idleTimer++;
        if (idleTimer > 120) {
          targetRotationY += 0.0006;
        }
      } else {
        idleTimer = 0;
      }

      // 10. Pulsing ring animation around Landing Site
      const pulsingRing = pulsingRingRef.current;
      const pulsingRingMat = pulsingRingMatRef.current;
      if (pulsingRing && pulsingRingMat) {
        pulseScale += 0.015;
        pulsingRing.scale.set(pulseScale, pulseScale, 1);
        pulsingRingMat.opacity = Math.max(0, 0.9 - (pulseScale / 2.0));

        if (pulseScale >= 2.0 || pulsingRingMat.opacity <= 0.01) {
          pulseScale = 0.15;
          pulsingRingMat.opacity = 0.9;
        }
      }

      // 11. Breathing animation on High Probability dots
      const breathingScale = 1.0 + Math.sin(Date.now() * 0.006) * 0.25;
      highDotsRef.current.forEach((dot) => {
        dot.scale.setScalar(breathingScale);
      });

      // 12. Scanning radar sweep logic
      if (isScanning) {
        scannerShell.visible = true;
        scannerShell.rotation.y += 0.04;
        scannerMat.opacity = 0.25 + Math.sin(Date.now() * 0.012) * 0.1;

        sweepRing.visible = true;
        sweepRingMat.opacity = 0.7;
        
        sweepProgress += 0.035;
        if (sweepProgress > 1.0) sweepProgress = 0.0;
        sweepRing.position.y = moonRadius - (sweepProgress * moonRadius * 2);
      } else {
        scannerShell.visible = false;
        sweepRing.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUpOrLeave);
      container.removeEventListener('mouseleave', handleMouseUpOrLeave);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleCanvasClick);

      moonGeo.dispose();
      moonMat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
      sweepRingGeo.dispose();
      sweepRingMat.dispose();
      renderer.dispose();
    };
  }, [isScanning]);

  // Handle dynamic additions of pins, paths, and clickable dot clusters
  useEffect(() => {
    const moonGroup = moonGroupRef.current;
    if (!moonGroup) return;

    // Reset previous overlays
    if (landingMarkerRef.current) moonGroup.remove(landingMarkerRef.current);
    if (pulsingRingRef.current) moonGroup.remove(pulsingRingRef.current);
    if (roverPathLineRef.current) moonGroup.remove(roverPathLineRef.current);
    highDotsRef.current = [];
    
    // Remove previous clickable dots
    clickableDotsRef.current.forEach((dot) => moonGroup.remove(dot));
    clickableDotsRef.current = [];
    setPopupInfo(null); // Dismiss popups on target reset

    const moonRadius = 3.5;

    const alignWithNormal = (mesh, position) => {
      mesh.position.copy(position);
      const normal = position.clone().normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    };

    // 1. Rover Landing Site (Green Pin + Canvas Sprite Tag + Pulsing Radar Ring)
    if (landingSite) {
      const sitePos = getCartesian(landingSite.lat, landingSite.lon, moonRadius);
      
      const pinGroup = new THREE.Group();
      pinGroup.position.copy(sitePos);
      
      const normal = sitePos.clone().normalize();
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const pinGeo = new THREE.ConeGeometry(0.04, 0.22, 10);
      const pinMat = new THREE.MeshPhongMaterial({ color: 0x138808, emissive: 0x053303 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.y = 0.11;
      pinGroup.add(pinMesh);

      const sphereGeo = new THREE.SphereGeometry(0.045, 10, 10);
      const sphereMesh = new THREE.Mesh(sphereGeo, pinMat);
      sphereMesh.position.y = 0.22;
      pinGroup.add(sphereMesh);

      moonGroup.add(pinGroup);
      landingMarkerRef.current = pinGroup;

      // Pulse ring mesh
      const ringGeo = new THREE.RingGeometry(0.02, 0.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff66,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      
      alignWithNormal(ringMesh, sitePos.clone().multiplyScalar(1.002));
      moonGroup.add(ringMesh);
      pulsingRingRef.current = ringMesh;
      pulsingRingMatRef.current = ringMat;

      // Double-line Lander Sprite Tag
      const spriteLabel = makeTextSprite('Shiv Shakti Point', 'Vikram Lander');
      spriteLabel.position.copy(sitePos.clone().multiplyScalar(1.1)); 
      moonGroup.add(spriteLabel);
      pinGroup.add(spriteLabel);
    }

    // 2. Rover Path Curve (Glowing Red Tube + Solid Yellow core line)
    if (roverPath && roverPath.length > 0 && landingSite) {
      const generateVisualPath = (site, targetLat, targetLon) => {
        const points = [];
        const steps = 7;
        
        // Force the path to move away from the South Pole singularity to make it visually long and separated.
        const targetLatVisual = site.lat + 5.5; 
        const targetLonVisual = site.lon + 22.0; 
        
        const dLat = targetLatVisual - site.lat;
        const dLon = targetLonVisual - site.lon;
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          let pLat = site.lat + dLat * t;
          let pLon = site.lon + dLon * t;
          
          pLat = Math.max(-89.9, Math.min(-80.0, pLat));
          
          const wiggle = Math.sin(t * Math.PI) * 3.2; 
          pLon += wiggle;
          
          points.push(getCartesian(pLat, pLon, moonRadius + 0.015));
        }
        return points;
      };

      const pathPoints = generateVisualPath(landingSite, lat, lon);
      const splineCurve = new THREE.CatmullRomCurve3(pathPoints);
      
      // RED glowing envelope
      const tubeGeo = new THREE.TubeGeometry(splineCurve, 64, 0.018, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xFF3300,
        transparent: true,
        opacity: 0.45
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      moonGroup.add(tubeMesh);
      roverPathLineRef.current = tubeMesh;

      // Inner core spline line - Solid YELLOW line
      const linePoints = splineCurve.getPoints(80);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xFFD700,
        linewidth: 2
      });
      const coreLine = new THREE.Line(lineGeo, lineMat);
      tubeMesh.add(coreLine);

      // Yellow pin & label representing the Pragyan Rover at the end of the path
      const endPos = pathPoints[pathPoints.length - 1];
      const roverGroup = new THREE.Group();
      roverGroup.position.copy(endPos);
      
      const endNormal = endPos.clone().normalize();
      roverGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endNormal);

      // Yellow sphere for rover
      const roverGeo = new THREE.SphereGeometry(0.045, 10, 10);
      const roverMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, emissive: 0x332800 });
      const roverMesh = new THREE.Mesh(roverGeo, roverMat);
      roverMesh.position.y = 0.05;
      roverGroup.add(roverMesh);

      // Pragyan Rover Image Sprite (Chroma-keyed preloaded transparent texture)
      let rSprite;
      if (roverTextureRef.current) {
        const spriteMat = new THREE.SpriteMaterial({ map: roverTextureRef.current, transparent: true });
        rSprite = new THREE.Sprite(spriteMat);
        rSprite.scale.set(0.48, 0.48, 1.0); // clean, high-fidelity scale
      } else {
        // Fallback text if texture is still loading
        rSprite = makeTextSprite('Pragyan Rover');
      }
      
      rSprite.position.y = 0.28; // float slightly above the yellow sphere
      roverGroup.add(rSprite);

      tubeMesh.add(roverGroup);
    }

    // 3. Scattered Multi-Crater Ice Probability Clusters (Blue dots matching the neutron map)
    if (iceZones && isDetected) {
      const polarCraters = [
        { name: 'Cabeus', lat: -84.9, lon: -35.5, level: 'high', cpr: 1.52, dop: 0.08 },
        { name: 'Faustini', lat: -87.3, lon: 65.2, level: 'high', cpr: 1.34, dop: 0.09 },
        { name: 'Shackleton', lat: -89.9, lon: 0.0, level: 'high', cpr: 1.64, dop: 0.07 },
        { name: 'Haworth', lat: -87.4, lon: -5.0, level: 'medium', cpr: 0.88, dop: 0.13 },
        { name: 'Shoemaker', lat: -88.1, lon: 44.9, level: 'medium', cpr: 0.94, dop: 0.12 },
        { name: 'de Gerlache', lat: -88.5, lon: -88.7, level: 'medium', cpr: 0.82, dop: 0.15 },
        { name: 'Amundsen', lat: -84.5, lon: 82.8, level: 'low', cpr: 0.48, dop: 0.22 },
        { name: 'Sverdrup', lat: -88.5, lon: -152.0, level: 'low', cpr: 0.42, dop: 0.24 }
      ];

      polarCraters.forEach((crater) => {
        const isVisible = 
          (crater.level === 'high' && activeFilters.high) ||
          (crater.level === 'medium' && activeFilters.medium) ||
          (crater.level === 'low' && activeFilters.low);

        if (!isVisible) return;

        const color = 
          crater.level === 'high' ? 0x00E5FF : 
          crater.level === 'medium' ? 0x0080FF : 0x80C0FF;
        
        const dotSize = 
          crater.level === 'high' ? 0.045 : 
          crater.level === 'medium' ? 0.030 : 0.018;

        const dotCount = 
          crater.level === 'high' ? 8 : 
          crater.level === 'medium' ? 6 : 4;

        const latRadDisp = crater.level === 'high' ? 0.65 : crater.level === 'medium' ? 1.0 : 1.5;
        const lonRadDisp = crater.level === 'high' ? 3.5 : crater.level === 'medium' ? 5.5 : 8.5;

        for (let i = 0; i < dotCount; i++) {
          const angle = (i * 2 * Math.PI) / dotCount;
          const jitterLat = crater.lat + Math.sin(angle * 1.5) * latRadDisp;
          const jitterLon = crater.lon + Math.cos(angle * 2.1) * lonRadDisp;

          const finalLat = Math.max(-89.9, Math.min(-80.0, jitterLat));
          const dotPos = getCartesian(finalLat, jitterLon, moonRadius + 0.015);

          const dotGeo = new THREE.SphereGeometry(dotSize, 10, 10);
          const dotMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.85
          });
          const dotMesh = new THREE.Mesh(dotGeo, dotMat);
          dotMesh.position.copy(dotPos);

          dotMesh.userData = {
            name: crater.name,
            cpr: parseFloat((crater.cpr + Math.sin(i) * 0.05).toFixed(2)),
            dop: parseFloat((crater.dop + Math.cos(i) * 0.01).toFixed(3)),
            confidence: crater.level.toUpperCase()
          };

          moonGroup.add(dotMesh);
          clickableDotsRef.current.push(dotMesh);

          if (crater.level === 'high') {
            highDotsRef.current.push(dotMesh);
          }
        }
      });
    }

  }, [lat, lon, iceZones, landingSite, roverPath, activeFilters, isDetected, roverLoaded]);

  return (
    <div className="crater-map-wrapper" style={{ position: 'relative' }}>
      <div className="map-header">
        <span className="map-header-indicator"></span>
        <h3 className="map-header-title">3D LUNAR SPHERE TARGET SIMULATION</h3>
      </div>
      
      {/* 3D WebGL Canvas */}
      <div 
        className="map-canvas-container" 
        ref={containerRef}
        style={{ cursor: 'grab', position: 'relative' }}
      ></div>

      {/* Hover/Click Raycaster Popup Box */}
      {popupInfo && (
        <div 
          className="three-map-tooltip"
          style={{
            position: 'absolute',
            left: `${popupInfo.x + 10}px`,
            top: `${popupInfo.y - 45}px`,
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          <div className="tooltip-title">{popupInfo.name.toUpperCase()} DATA</div>
          <div className="tooltip-row">
            <span>Confidence:</span>
            <strong className={
              popupInfo.confidence === 'HIGH' ? 'green-highlight' : 
              popupInfo.confidence === 'MEDIUM' ? 'orange-highlight' : 'blue-highlight'
            }>{popupInfo.confidence}</strong>
          </div>
          <div className="tooltip-row">
            <span>CPR Ratio:</span>
            <strong>{popupInfo.cpr.toFixed(2)}</strong>
          </div>
          <div className="tooltip-row">
            <span>DOP Ratio:</span>
            <strong>{popupInfo.dop.toFixed(3)}</strong>
          </div>
        </div>
      )}

      {/* Legend Map Panel */}
      <div className="map-legend">
        <h4 className="legend-title">LEGEND</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color high-prob" style={{ backgroundColor: isDetected ? 'rgba(0,229,255,0.85)' : 'rgba(0,71,171,0.65)' }}></span>
            <span className="legend-label">High Prob Cluster (Pulsing)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color med-prob"></span>
            <span className="legend-label">Medium Prob Cluster</span>
          </div>
          <div className="legend-item">
            <span className="legend-color low-prob"></span>
            <span className="legend-label">Low Prob Cluster</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot-marker"></span>
            <span className="legend-label">Shiv Shakti Point Lander</span>
          </div>
          <div className="legend-item">
            <span className="legend-line-marker" style={{ borderBottomColor: '#FF3300' }}></span>
            <span className="legend-label">Red & Yellow Rover Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
