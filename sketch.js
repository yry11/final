const flowerArray = [5, 4, 6];
let flowerSize;
let shapes = [];
const MIN_PARTICLE_COUNT = 9000;//在画布上生成的粒子的最小和最大数量。
const MAX_PARTICLE_COUNT = 15000;
const MIN_PARTICLE_SIZE = 0.5;//最小和最大尺寸
const MAX_PARTICLE_SIZE = 9;
const MIN_FORCE = 0.1;
const MAX_FORCE = 0.4;//最小和最大力量将它们移动到目标位置。
const REPULSION_RADIUS = 40;//当鼠标接近粒子时的排斥半径
const REPULSION_STRENGTH = 0.5;//和强度
const IMG_RESIZED_WIDTH = 800;//图像大小
const IMG_SCAN_STEPS = 2;
var backgroundShapesCount = 500;
let oneCircle;


var imgNames = ["1.png", "2.png", "3.png", "4.png", "8.png","5.png","3.png", "2.png","1.png", "11.png",];//不同图像的名称
var particles = [];
var indices = [];//存储粒子可以生成的图像上的有效位置。
var imgIndex = 0;//跟踪当前图像的索引
var drawType = 1;//跟踪当前绘制类型
var particleCount = 900;//存储要生成的粒子数量
var maxSize = 0;
var img;
var currSchemeIndex = 0;  // 当前的调色板角标

let predictions = [];
let timer = 0;  // 计时器
let back = 0;
function setup() {
 // blendMode(SOFT_LIGHT);
  // colorMode(HSB, 360, 100, 10, 1.0);
  createCanvas(1200, 1000);
  // background(0, 1, 95);
  //  frameRate(30);
  let canvas = createCanvas(800, 700);
  canvas.canvas.oncontextmenu = () => false;//当用户右键点击画布时，它会阻止默认的右键菜单显示。也就是说，当用户在画布上右键点击时，不会弹出默认的右键菜单，从而防止意外的右键操作。
  loadImg(imgNames[0]);//加载第一个图像并进行相应的设置
  noStroke();
  angleMode(DEGREES);
  init();
  
 
}

function init() {
  oneCircle = new CircleGroup();

  let randomSchemeIndex = Math.floor(Math.random() * colorScheme.length);
  // 从该方案中随机选择一个颜色
//   for (let i = 0; i < 300; i++) {
//     let randomScheme = colorScheme[currSchemeIndex];
//     let randomColorIndex = Math.floor(Math.random() * randomScheme.colors.length);
//     let randomColorWithAlpha = randomScheme.colors[randomColorIndex] + "10";
//     fill(randomColorWithAlpha)

//     pattern(random(width), random(height), random(10, 100), random(3, 10))//边 背景
//   }

  flowerSize = random(40, 130);
  for (let i = 0; i < 5; i++) {
    shapes.push(new Shape());
  }
}

function pattern(x, y, radius, edge) {
  let angle = TWO_PI / edge;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);

  }
  endShape(CLOSE);
}

function draw() {
    timer++;
    back++
  // background(0, 1, 95);
  if (back = 2500) {
  // background(0, 1, 95);
   background(255,1);
   back=0
  }
  if (frameCount > 15000) {
    noLoop();
  }
  if (img == null) {
    return;
  }
  push();
  translate(width / 2 - img.width / 2, height / 2 - img.height / 2);
 
  noStroke();
 
  particles.forEach(particle => {
    particle.move();
    push();
    translate(particle.pos.x, particle.pos.y);
    let spin = particle.vel.mag();//计算旋转角度 spin，它是根据粒子的速度大小 particle.vel.mag() 乘以常量 SPIN_MULTIPLIER 得到的。
    rotate(radians(particle.mapped_angle + spin));//绕当前原点旋转坐标系particle.mapped_angle 是粒子的初始角度
    let original_red = red(particle.color);
    let original_green = green(particle.color);
    let original_blue = blue(particle.color);
    let new_alpha = 40;
    // Create a new color with modified alpha
    let new_color = color(original_red, original_green, original_blue, new_alpha);
    // Use the new_color with modified alpha to fill the particles
    fill(new_color);
    //  fill(particle.color);
    ellipse(0, 0, particle.size, particle.size);
    pop();
  });

 // rectMode(CORNER);

 // if (mouseIsPressed && mouseButton == RIGHT) {
 //    image(img, 0, 0);
 // }
// image(img, 0, 0);
  pop();
  oneCircle.addCircles();
  oneCircle.run();
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].move();
    if (i < 4)
      shapes[i].display1();
    else shapes[i].display();
  }
}

function mousePressed() {
  if (mouseButton == LEFT) {
    loadNextImg();
    init();
  //  tint(255, 127); push();
  //    push();
  // translate(width / 2 - img.width / 2, height / 2 - img.height / 2);
  // tint(255, 127);
  //  image(img, 0, 0);
  //     pop();
     currSchemeIndex++;
    currSchemeIndex = currSchemeIndex % colorScheme.length;

  }
}


function Particle(_x, _y, _size, _color) {
  this.pos = new p5.Vector(img.width / 2, img.height / 2);
  this.vel = new p5.Vector(0, 0);//粒子当前的速度粒子初始时静止不动
  this.acc = new p5.Vector(0, 0);//加速度
  this.target = new p5.Vector(_x, _y);
  this.size = _size;
  this.mapped_angle = map(_x, 0, img.width, -180, 180) + map(_y, 0, img.height, -180, 180);
  this.color = _color;
  this.maxForce = random(MIN_FORCE, MAX_FORCE);//移动变慢

  this.goToTarget = function () {
    let steer = new p5.Vector(this.target.x, this.target.y);//导航力

    let distance = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);//直线距离
    if (distance > 0.5) {
      let distThreshold = 2;//在哪个距离范围内粒子开始受到目标点的吸引力
      steer.sub(this.pos)//steer 减去当前位置向量 this.pos，并将结果保存在 steer ，向量差值。
      steer.normalize();//单位向量，长度为一，只有方向
      steer.mult(map(min(distance, distThreshold), 0, distThreshold, 0, this.maxForce));
      this.acc.add(steer);
    }
  }
  //this.pos 原始位置会逐渐靠近 this.target直到达到目标位置
  this.avoidMouse = function () {
    let mx = mouseX - width / 2 + img.width / 2;
    let my = mouseY - height / 2 + img.height / 2;

    let mouseDistance = dist(this.pos.x, this.pos.y, mx, my);

    if (mouseDistance < REPULSION_RADIUS) {
      let repulse = new p5.Vector(this.pos.x, this.pos.y);
      repulse.sub(mx, my);
      repulse.mult(map(mouseDistance, REPULSION_RADIUS, 0, 0, REPULSION_STRENGTH));
      this.acc.add(repulse);
    }
  }

  this.move = function () {
    this.goToTarget();

    this.avoidMouse();

    this.vel.mult(0.95);

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}

function loadNextImg() {
  imgIndex++;
  if (imgIndex >= imgNames.length) {
    imgIndex = 0;
  }
  loadImg(imgNames[imgIndex]);
}
function loadImg(imgName) {
  loadImage(imgName, newImg => {
    img = newImg;
    img.loadPixels();
    img.resize(IMG_RESIZED_WIDTH, 0);
    spawnParticles();
  });
}
// Collects valid positions where a particle can spawn onto.
function setupImg() {//扫描图像像素并收集可以生成粒子的有效位置。
  indices = [];
  for (let x = 0; x < img.width; x += IMG_SCAN_STEPS * 4) {
    for (let y = 0; y < img.height; y += IMG_SCAN_STEPS * 4) {
      let index = (x + y * img.width) * 4;
      print(index);
      let a = img.pixels[index + 3];
      if (a > 10) {
        indices.push(index);
      }
    }
  }
}

function spawnParticles() {//根据当前粒子数量和大小在画布上生成粒子。
  // 清空之前的粒子数组
  particles = [];
  // 扫描图像像素并收集可以生成粒子的有效位置
  setupImg();
  // 根据当前粒子数量和大小来设置最大粒子大小
  maxSize = map(
    particleCount,
    MIN_PARTICLE_COUNT, MAX_PARTICLE_COUNT,
    MAX_PARTICLE_SIZE, MIN_PARTICLE_SIZE);

  if (indices.length == 0) {
    return;
  }
  //根据粒子数量生成粒子
  for (let i = 0; i < particleCount; i++) {
    let max_attempts = 20;
    let attempts = 0;
    let newParticle = null;
    // Pick a random position from the active image and attempt to spawn a valid particle.中随机选择一个位置
    while (newParticle == null) {
      let index = indices[int(random(indices.length))];
      //计算该位置在图像上的像素坐标
      let x = (index / 4) % img.width;
      let y = (index / 4) / img.width;
      // 获取该位置的颜色信息
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let a = img.pixels[index + 3]
      if (particles.length > 0) {
        let smallestSize = null;
        // 遍历所有已有的粒子，计算当前粒子与它们的距离并计算合适的大小				
        for (let i = 0; i < particles.length; i++) {
          let otherParticle = particles[i];
          let d = dist(x, y, otherParticle.target.x, otherParticle.target.y);
          let newSize = (d - (otherParticle.size / 2)) * 2;
          // 选择最小的合适大小			
          if (smallestSize == null || newSize < smallestSize) {
            smallestSize = newSize;
          }
        }
        // 如果找到了合适的大小，则创建新的粒子对象			
        if (smallestSize > 0) {
          newParticle = new Particle(x, y, min(smallestSize, maxSize) * 0.75,
            color(r, g, b, a));
        }
      } else {
        newParticle = new Particle(
          x, y,
          maxSize,//// 使用最大大小
          color(r, g, b, a));
      }

      attempts += 1;//如果在最大尝试次数内无法找到合适位置，则跳出循环
      if (attempts > max_attempts) {
        break;
      }
    }
    // 将新的粒子对象添加到粒子数组中
    if (newParticle != null) {
      particles.push(newParticle);
    }
  }
}
//如果在这个次数内找不到合适的位置，则停止生成粒子。生成的粒子对象会被添加到particles数组中。

class Circle {
  constructor() {
    this.xpos = random(0, width);
    this.ypos = random(0, height);
    // this.num = int(random(0, 100));
    this.r = int(random(5, 20));
    this.plusC = random(7, 15);//7，15
    this.plusA = random(10, 18);//4，8
    this.plusB = random(3, 5);//1，2
    this.randomSchemeIndex = Math.floor(Math.random() * colorScheme.length);
    // this.randomScheme = colorScheme[this.randomSchemeIndex];
    this.randomScheme = colorScheme[currSchemeIndex];
    this.randomColorIndex = Math.floor(Math.random() * this.randomScheme.colors.length);
    let randomColorWithAlpha = this.randomScheme.colors[this.randomColorIndex] + "10"; // 这里添加的 "80" 表示透明度为 50%

    this.col = color(randomColorWithAlpha)
    this.trans = random(0.5, 0.6);
    this.weight = parseInt(random(8, 14));
  }

  bigger() {
    if (this.r >= 0 && this.r < 30) {
      this.r += this.plusC;
    } else if (this.r >= 30 && this.r < 50) {
      this.r += this.plusB;
    } else if (this.r >= 50 && this.r < random(60, 100)) {
      this.r += this.plusA;
    }
  }
  disappear() {
    if (this.r > 60) {
      this.trans -= 0.1;
    }
  }

  update() {
    this.xpos += random(-15, 15);
    this.ypos += random(-15, 15);
  }

  display() {
    noStroke();

    fill(this.col)
    ellipse(this.xpos, this.ypos, this.r * 2, this.r * 2)
    this.bigger();
    this.update();
    this.disappear();
  }


  isDead() {//判断圆是否消失（即透明度是否小于 0.01）。如果透明度小于 0.01，说明圆已经基本消失了，那么返回 true，表示圆已经死亡。否则，返回 false，表示圆仍然存在。
    return this.trans < 0.01;
  }
}
class CircleGroup {
  constructor() {
    this.circleG = [];
    this.frameCounter = 0;
  }

  addCircles() {
    this.frameCounter++;
    if (this.frameCounter === 10) {
      this.circleG.push(new Circle());
      this.frameCounter = 0;
    }
  }
  run() {
    for (let i = 0; i < this.circleG.length; i++) {
      let a = this.circleG[i];
      a.display();
      if (a.isDead()) {
        this.circleG.splice(i, 1);
      }
    }
  }
}

function keyPressed() {
  if (keyCode === 1) { // Check if the spacebar is pressed (keyCode 32)
    generateImage(); // 重新生成图像
  }
}

class Shape {
  constructor() {
    this.init();
  }

  init() {
    this.ox = 100
    this.oy = 200
    this.oxRandom = random(-300, 300);
    this.oyRandom = random(-300, 300);
    this.r = [];
    this.rMax = random(60, 130);
    this.rNow = 0;
    this.rCount = 0;
    this.flowerNum = random(flowerArray);
    this.randomSchemeIndex = Math.floor(Math.random() * colorScheme.length);
    // this.randomScheme = colorScheme[this.randomSchemeIndex];
    this.randomScheme = colorScheme[currSchemeIndex];

    this.randomColorIndex = Math.floor(Math.random() * this.randomScheme.colors.length);
    // let randomColorWithAlpha = this.randomScheme.colors[this.randomColorIndex] + "15";
    let randomColorWithAlpha = this.randomScheme.colors[this.randomColorIndex] + "35";
    // let randomColorWithNoise = color(randomColorWithAlpha).levels.slice(0, 3).concat(map(noiseAlpha, -50, 50, 0, 255)); // 将随机透明度添加到颜色中


    // let randomColorWithAlpha = this.randomScheme.colors[this.randomColorIndex] + "10";
    for (let i = 0; i < 360; i++) {
      this.r.push(this.rMax * sin(i));
    }
    if (random() > 0.7) {
      // let col = img.get(this.ox + this.oxRandom, this.oy + this.oyRandom); // 提取图像颜色
      //   this.col = color(col[0], col[1], col[2], 15); // 创建新的颜色对象，并附加透明度
      //  this.col = color(randomColorWithAlpha)
      this.col = color(235, random(30, 215), 96, 30)

    } else {
      //   this.col = color(randomColorWithNoise)
      this.col = color(randomColorWithAlpha)
    }
    this.nx = random(1000);
    this.ny = random(1000);

  }

  move() {
    this.ox = map(noise(this.nx), 0, 1, 0, width);
    this.oy = map(noise(this.ny), 0, 1, 0, height);

    this.nx += 0.001;
    this.ny += 0.001;

    // this.xxx += 0.001;
    //    this.yyy += 0.001;
    this.rNow = this.rMax * sin(this.rCount);
    this.r = [];
    for (let i = 0; i < 360; i++) {
      this.r.push(this.rNow * sin(i * this.flowerNum));
    }
    this.rCount = this.rCount + 1;
  }

  display() {
    noFill();
    stroke(this.col);

    push();
    //  translate(constrain(this.ox + this.oxRandom, 0, width), constrain(this.oy + this.oyRandom, 0, height));
    translate(this.ox + this.oxRandom, this.oy + this.oyRandom)
    beginShape();
    for (let t = 0; t < 360; t++) {
      let x = this.r[t] * cos(t);
      let y = this.r[t] * sin(t);
      strokeWeight(1);
      vertex(x, y);
    }
    endShape();
    pop();

    if (this.rCount > 100) {
      this.init();
    }
  }



  display1() {
    noFill();

    push();
    translate(this.ox + this.oxRandom, this.oy + this.oyRandom);
    // stroke(this.col);
    beginShape();
    for (let t = 0; t < 360; t++) {
      let x = this.r[t] * cos(t);
      let y = this.r[t] * sin(t);
      vertex(x, y);
      push();
      stroke(this.col);
      strokeWeight(2)
      if (random(1) < 0.4) { point(x, y); }
      pop();
    }
    endShape();
    pop();

    if (this.rCount > 100) {
      this.init();
    }
  }
}

let colorScheme = [
  {
  	name: "9",
   	colors: ["#ffad83", "#edbfb2", "#76d8f9", "#b4ecff", "#fcb79f", "#f6d293","#ecd374"],
  },
  	{
  		name: "4",
   		colors: ["#b4f3ed","#ebc560","#6ebdbf","#fc9837","#f27944","#e9bda2","#fed000","#fdda8f","#ffdf52"],
  	},
  {
  		name: "7",
   		colors: ["#b4f3ed","#ebc560","#ffc5c7","#d6b775","#f66e7c","#cee55e","#e9bda2","#fcb79f","#fed000"],
  	},
  
  	{
  		name: "10",
   		colors: ["#00b191","#9ccca8","#afe8d1","#d1da50","#ffa059","#ffc5c7","#cee55e","#fdda8f","#cde85c"],
  	},
  	{
  		name: "8",
   	colors: ["#f2eb8a", "#fed000", "#fc8405", "#e2f0f3", "#b3dce0", "#ffc5c7", "#f398c3", "#06b4b0", "#d7b298", "#9fc3b5"],
  	},
  
  	{ 
  	name: "5",
   	colors: ["#deacca", "#f1ad3b", "#e2f0f3", "#b3dce0", "#ffc5c7", "#f398c3", "#fc735b", "#a5b2c9",  "#777489","#a0e2e8","#adbbd6"],
  	},   
  	 {
  	name: "3",
   	colors: [ "#f1ad3b", "#c36e32", "#e2b86f", "#feefac", "#eacd4a", "#ffedd4",  "#788d62","#87b55e"],
  	},  
  	{
  	name: "2",
   	colors: ["#cee55e", "#ddb772", "#f6d293", "#dcc8c9","#f9926c", "#00718d","#f1d0b4","#e6b7a1",],
    	},  

  {//1
    name: "1",
    colors: ["#f09339", "#eee9d7", "#c4463d", "#dcc8c9",  "#f9926c", "#f1d0b4", "#e3c55b"],
  },
  {//2
    name: "2",
    colors: ["#cee55e", "#eee9d7", "#ffe3b4", "#bed392", "#54935d", "#faf9ee", "#f1d0b4", "#87b55e"],
  },
];