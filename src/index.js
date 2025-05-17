import "./style.css";
import { Pane } from "tweakpane";

export function App() {
  this.video = document.querySelector("video");
  this.canvas = document.getElementById("canvas");
  this.offscreen = document.getElementById("canvasoff");
  this.config = {
    color: "",
    pixelSize: 9,
    ascii: " ,.WQq+,;*.       ",
    colors: []
  };


  this.setupTweakpane = () => {
    const PARAMS = {
      primaryColor: "#ffffff",
      secondaryColor: "#db001c",
      pixelSize: this.config.pixelSize,
      ascii: this.config.ascii
    };

    const pane = new Pane({
      title: "Parameters",
      expanded: false
    });

    this.config.color = PARAMS.primaryColor;

    const primaryColorInput = pane.addBinding(PARAMS, "primaryColor", {
      label: "Primary Color"
    });

    const secondaryColorInput = pane.addBinding(PARAMS, "secondaryColor", {
      label: "Secondary Color"
    });

    const asciiInput = pane.addBinding(PARAMS, "ascii", { label: "ASCII" });

    const pixelSize = pane.addBinding(PARAMS, "pixelSize", {
      view: "slider",
      label: "Pixel Size",
      min: 5,
      max: 20,
      step: 1,
      value: this.config.pixelSize
    });

    primaryColorInput.on("change", (ev) => {
      this.config.color = ev.value;
    });

    asciiInput.on("change", (ev) => {
      this.config.ascii = ev.value;
    });

    secondaryColorInput.on("change", (ev) => {
      document.body.style.backgroundColor = ev.value;
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
  }

  this.setup = () => {
    this.offscreenCtx = this.offscreen.getContext("2d", { willReadFrequently: true });
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  this.updateCanvas = () => {
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
        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;
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
            totalRed += red;
            totalGreen += green;
            totalBlue += blue;
            sampleCount++;
          }
        }

        const averageBrightness = totalBrightness / sampleCount;

        const charIndex = Math.floor(
          (averageBrightness / 256) * this.config.ascii.length
        );

        const char = this.config.ascii[charIndex] || "";

        this.ctx.fillStyle = this.config.color;
        this.ctx.fillText(char, posX + cellWidth * 0.5, posY + cellWidth);
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