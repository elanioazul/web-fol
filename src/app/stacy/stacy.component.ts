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
  @ViewChild('loading')
  private loaderRef: ElementRef;

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

  private neck: any;
  private waist: any;
  private mixer: THREE.AnimationMixer;
  private idle: any;



  //? Helper Properties (Private Properties);

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private loaderGLTF = new GLTFLoader();

  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  //Model
  public MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';

  constructor() { }

  private animateModel() {
    if (this.model) {
      this.model.rotation.z += 0.005;
    }
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
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
    //Init renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    document.body.appendChild(this.renderer.domElement);
    // Model
    this.loaderGLTF.load(
      this.MODEL_PATH,
      (gltf) => {
        this.model = gltf.scene;
        console.log(this.model);
        let fileAnimations = gltf.animations;
        this.model.traverse((o: any) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            //o.material = stacy_mtl;
          }
          // Reference the neck and waist bones
          if (o.isBone && o.name === 'mixamorigNeck') {
            this.neck = o;
          }
          if (o.isBone && o.name === 'mixamorigSpine') {
            this.waist = o;
          }
        });
        this.model.scale.set(7, 7, 7);
        this.model.position.y = -11;
        this.scene.add(this.model);
        this.loaderRef.nativeElement.remove();

        this.mixer = new THREE.AnimationMixer(this.model);

        let clips = fileAnimations.filter(val => val.name !== 'idle');
        let possibleAnims: any[];
        possibleAnims = clips.map(val => {
          let clip = THREE.AnimationClip.findByName(clips, val.name);

          clip.tracks.splice(3, 3);
          clip.tracks.splice(9, 3);
          let finalClip;
          finalClip = this.mixer.clipAction(clip);
          return finalClip;
        }
       );
       let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
       idleAnim.tracks.splice(3, 3);
       idleAnim.tracks.splice(9, 3);

       this.idle = this.mixer.clipAction(idleAnim);
       this.idle.play();
      },
      undefined,
      (error: any) => {
        console.error(error)
      }
    );

    //Camera
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
    requestAnimationFrame(() => this.update);
  }

  private resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize: boolean =
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
    //this.startRenderingLoop();
    this.update();
  }

}
