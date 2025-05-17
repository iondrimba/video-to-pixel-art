import "./style.css";
import { Pane } from "tweakpane";
import chroma from "chroma-js";

export function App() {
  this.config = {
    pixelSize: 8,
    colorInterval: 5,
    colors: []
  };
  
  this.video = document.querySelector("video");
  this.canvas = document.getElementById("canvas");
  this.offscreen = document.getElementById("canvasoff");
  
  this.setupTweakpane = (params) => {
    let PARAMS = {
      primaryColor: "#070242",
      secondaryColor: "#d6ff34",
      pixelSize: this.config.pixelSize,
      colorInterval: this.config.colorInterval,
    };
  
    const pane = new Pane({
      title: "Parameters",
      expanded: false
    });
  
    this.color = PARAMS.primaryColor;
  
    const primaryColorInput = pane.addBinding(PARAMS, "primaryColor", {
      label: "Primary Color"
    });
  
    const secondaryColorInput = pane.addBinding(PARAMS, "secondaryColor", {
      label: "Secondary Color"
    });
    
    const colorIntervalInput = pane.addBinding(PARAMS, "colorInterval", {
      view: "slider",
      label: "Color Depth",
      min: 2,
      max: 20,
      step: 1,
      value: this.config.colorInterval
    });
  
    const pixelSize = pane.addBinding(PARAMS, "pixelSize", {
      view: "slider",
      label: "Pixel Size",
      min: 5,
      max: 20,
      step: 1,
      value: this.config.pixelSize
    });
  
    primaryColorInput.on("change", (ev) => {
      this.color = ev.value;
      document.body.style.backgroundColor = ev.value;
  
      this.config.colors = chroma
        .scale([PARAMS.primaryColor, PARAMS.secondaryColor])
        .mode("lch")
        .colors(this.config.colorInterval);
    });
    
    secondaryColorInput.on("change", (ev) => {
      this.config.colors = chroma
        .scale([PARAMS.primaryColor, PARAMS.secondaryColor])
        .mode("lch")
        .colors(this.config.colorInterval);
    });
    
    colorIntervalInput.on("change", (ev) => {
      this.config.colorInterval = ev.value;
      
      this.config.colors = chroma
        .scale([PARAMS.primaryColor, PARAMS.secondaryColor])
        .mode("lch")
        .colors(this.config.colorInterval);
    });
    
    pixelSize.on("change", (ev) => {
      this.config.pixelSize = ev.value;
    });
  
    const btnShowVideo = pane.addButton({
      title: "Show video"
    });
  
    btnShowVideo.on("click", () => {
      this.video.classList.toggle("hidden");
    });
  
    this.config.colors = chroma
      .scale([PARAMS.primaryColor, PARAMS.secondaryColor])
      .mode("lch")
      .colors(this.config.colorInterval);
  }
  
  this.setup = () => {
    this.offscreenCtx = this.offscreen.getContext("2d", { willReadFrequently: true });
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  
  this.updateCanvas = (params) => {
    this.canvas.width = Math.floor(this.video.videoWidth);
    this.canvas.height = Math.floor(this.video.videoHeight);
  
    this.offscreen.width = this.canvas.width;
    this.offscreen.height = this.canvas.height;
  
    this.offscreenCtx.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  
    this.renderPixels();
  }
  
  this.renderPixels = () => {
    const imageData = this.offscreenCtx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    
    const cellWidth = this.config.pixelSize;
    const cellHeight = cellWidth;
    const numCols = Math.floor(imageData.width / cellWidth);
    const numRows = Math.floor(imageData.height / cellHeight);
  
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        const posX = x * cellWidth;
        const posY = y * cellHeight;
  
        let totalBrightness = 0;
        let sampleCount = 0;
  
        for (let sy = 0; sy < cellHeight; sy++) {
          for (let sx = 0; sx < cellWidth; sx++) {
            const sampleX = posX + sx;
            const sampleY = posY + sy;
            const offset = (sampleY * imageData.width + sampleX) * 4;
            const red = imageData.data[offset];
            const green = imageData.data[offset + 1];
            const blue = imageData.data[offset + 2];
            const brightness = (red + green + blue) / 3;
  
            totalBrightness += brightness;
            sampleCount++;
          }
        }
  
        const averageBrightness = totalBrightness / sampleCount;
        const colorIndex = Math.floor((averageBrightness / 256) * this.config.colorInterval);
  
        this.ctx.fillStyle = this.config.colors[colorIndex];
        this.ctx.fillRect(posX, posY, cellWidth, cellWidth);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();

  app.setup();

  app.setupTweakpane();

  setTimeout(() => {
    setInterval(() => {
      app.updateCanvas();
    }, 1000 / 30);
  }, 1000);
});