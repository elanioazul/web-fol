import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as THREE from "three";
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

@Component({
  selector: 'app-stacy',
  templateUrl: './stacy.component.html',
  styleUrls: ['./stacy.component.scss']
})
export class StacyComponent implements OnInit, AfterViewInit {

  @ViewChild('c')
  private canvasRef: ElementRef;

  public backgroundColor = 0xf1f1f1;

  //* Stage Properties

  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPane: number = 1;

  @Input('farClipping') public farClippingPane: number = 1000;

  //? Scene properties
  private camera: THREE.PerspectiveCamera;

  private controls: OrbitControls;

  private ambientLight: THREE.AmbientLight;
  private hemiLight: THREE.HemisphereLight;
  private directionalLight: THREE.DirectionalLight;

  private light1: THREE.PointLight;
  private light2: THREE.PointLight;
  private light3: THREE.PointLight;
  private light4: THREE.PointLight;

  private floorGeometry: THREE.PlaneGeometry;
  private floorMaterial: THREE.MeshPhongMaterial;

  private model: any;



  //? Helper Properties (Private Properties);

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private loaderGLTF = new GLTFLoader();

  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  constructor() { }

  private animateModel() {
    if (this.model) {
      this.model.rotation.z += 0.005;
    }
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    let component: StacyComponent = this;
    (function render() {
      component.renderer.render(component.scene, component.camera);
      component.animateModel();
      requestAnimationFrame(render);
    }());
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);
    this.scene.fog = new THREE.Fog(this.backgroundColor, 60, 100);
    // this.loaderGLTF.load('assets/robot/scene.gltf', (gltf: GLTF) => {
    //   this.model = gltf.scene.children[0];
    //   console.log(this.model);
    //   var box = new THREE.Box3().setFromObject(this.model);
    //   box.getCenter(this.model.position); // this re-sets the mesh position
    //   this.model.position.multiplyScalar(-1);
    //   this.scene.add(this.model);
    // });
    //*Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    )
    this.camera.position.x = 30;
    this.camera.position.y = 0;
    this.camera.position.z = -3;

    //Lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    let d = 8.25;
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.54);
    this.directionalLight.position.set(-8, 12, 8);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 1500;
    this.directionalLight.shadow.camera.left = d * -1;
    this.directionalLight.shadow.camera.right = d;
    this.directionalLight.shadow.camera.top = d;
    this.directionalLight.shadow.camera.bottom = d * -1;
    this.scene.add(this.directionalLight);

    //Floor
    this.floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    this.floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
    });
    let floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    this.scene.add(floor);
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private update() {
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  }

  private resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
    this.update();
  }

}
