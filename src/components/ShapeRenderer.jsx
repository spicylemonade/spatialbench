import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BLOCK_COLOR, EDGE_COLOR } from '../utils/spatialLogic';

const ShapeRenderer = ({ voxels, width, height, cameraPosition = null, randomView = false }) => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    
    if (cameraPosition) {
        camera.position.set(...cameraPosition);
    } else if (randomView) {
      const radius = 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * (Math.PI / 2.5) + 0.2;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    } else {
      camera.position.set(10, 10, 10); 
    }
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Improved Lighting for "Professional" Look
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: BLOCK_COLOR, 
      roughness: 0.2,
      metalness: 0.1
    });
    const lineMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR });

    const geometries = voxels.map(([x, y, z]) => {
      const geo = baseGeometry.clone();
      geo.translate(x, y, z);
      return geo;
    });

    const mergedGeometry = mergeGeometries(geometries, true);
    const mesh = new THREE.Mesh(mergedGeometry, material);
    scene.add(mesh);

    const edgeGeometry = new THREE.EdgesGeometry(mergedGeometry, 1);
    const edgeLines = new THREE.LineSegments(edgeGeometry, lineMaterial);
    scene.add(edgeLines);

    renderer.render(scene, camera);

    return () => {
      if (mountRef.current) mountRef.current.innerHTML = '';
      baseGeometry.dispose();
      mergedGeometry.dispose();
      edgeGeometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [voxels, width, height, randomView, cameraPosition]);

  return <div ref={mountRef} className="overflow-hidden inline-block" />;
};

export default ShapeRenderer;
