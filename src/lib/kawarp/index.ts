// Modified from https://github.com/better-lyrics/kawarp
/**
 * Kawarp - Fluid Animated Background Renderer
 *
 * Creates a fluid, animated background effect similar to Apple Music's album art visualization.
 * Uses WebGL with Kawase blur and domain warping techniques.
 *
 * Optimized architecture:
 * - Blur runs on small textures (128x128) only when image changes
 * - Smooth crossfade transitions between images
 * - Per-frame work is minimal: just blend + warp + output
 */

import vertexShader from "~/shaders/kawarp/vertex.glsl";
import kawaseBlurShader from "~/shaders/kawarp/kawase_blur.glsl";
import blendShader from "~/shaders/kawarp/blend.glsl";
import tintShader from "~/shaders/kawarp/tint.glsl";
import domainWarpShader from "~/shaders/kawarp/domain_warp.glsl";
import outputShader from "~/shaders/kawarp/output.glsl";

export interface KawarpOptions {
  warpIntensity?: number;
  blurPasses?: number;
  animationSpeed?: number;
  transitionDuration?: number;
  saturation?: number;
  tintColor?: [number, number, number];
  tintIntensity?: number;
  dithering?: number;
  scale?: number;
  brightness?: number;
}

interface Framebuffer {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

// Size for blur operations (small = fast)
const BLUR_SIZE = 128;

export class Kawarp {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private halfFloatExt: OES_texture_half_float | null = null;
  private halfFloatLinearExt: OES_texture_half_float_linear | null = null;

  // Shader programs
  private blurProgram: WebGLProgram;
  private blendProgram: WebGLProgram;
  private tintProgram: WebGLProgram;
  private warpProgram: WebGLProgram;
  private outputProgram: WebGLProgram;

  // Buffers
  private positionBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;

  // Source texture (original image)
  private sourceTexture: WebGLTexture;

  // Small FBOs for blur (BLUR_SIZE x BLUR_SIZE)
  private blurFBO1: Framebuffer;
  private blurFBO2: Framebuffer;

  // Album FBOs for crossfade (BLUR_SIZE x BLUR_SIZE)
  private currentAlbumFBO: Framebuffer;
  private nextAlbumFBO: Framebuffer;

  // Full-res FBO for warp output
  private warpFBO: Framebuffer;

  // Animation state
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private accumulatedTime: number = 0;
  private isPlaying = false;
  private isDisposed = false;

  // Transition state
  private isTransitioning = false;
  private transitionStartTime = 0;
  private _transitionDuration: number;

  // Options
  private _warpIntensity: number;
  private _blurPasses: number;
  private _animationSpeed: number;
  private _targetAnimationSpeed: number;
  private _saturation: number;
  private _tintColor: [number, number, number];
  private _tintIntensity: number;
  private _dithering: number;
  private _scale: number;
  private _brightness: number;
  private hasImage = false;

  // Cached attribute locations
  private attribs!: {
    position: number;
    texCoord: number;
  };

  // Cached uniform locations
  private uniforms!: {
    blur: {
      resolution: WebGLUniformLocation;
      texture: WebGLUniformLocation;
      offset: WebGLUniformLocation;
    };
    blend: {
      texture1: WebGLUniformLocation;
      texture2: WebGLUniformLocation;
      blend: WebGLUniformLocation;
    };
    warp: {
      texture: WebGLUniformLocation;
      time: WebGLUniformLocation;
      intensity: WebGLUniformLocation;
    };
    tint: {
      texture: WebGLUniformLocation;
      tintColor: WebGLUniformLocation;
      tintIntensity: WebGLUniformLocation;
    };
    output: {
      texture: WebGLUniformLocation;
      saturation: WebGLUniformLocation;
      dithering: WebGLUniformLocation;
      time: WebGLUniformLocation;
      scale: WebGLUniformLocation;
      resolution: WebGLUniformLocation;
      brightness: WebGLUniformLocation;
    };
  };

  constructor(canvas: HTMLCanvasElement, options: KawarpOptions = {}) {
    this.canvas = canvas;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;

    this.halfFloatExt = gl.getExtension("OES_texture_half_float");
    this.halfFloatLinearExt = gl.getExtension("OES_texture_half_float_linear");

    this._warpIntensity = options.warpIntensity ?? 1.0;
    this._blurPasses = options.blurPasses ?? 8;
    this._animationSpeed = options.animationSpeed ?? 1.0;
    this._targetAnimationSpeed = this._animationSpeed;
    this._transitionDuration = options.transitionDuration ?? 1000;
    this._saturation = options.saturation ?? 1.5;
    this._tintColor = options.tintColor ?? [0.157, 0.157, 0.235];
    this._tintIntensity = options.tintIntensity ?? 0.15;
    this._dithering = options.dithering ?? 0.008;
    this._scale = options.scale ?? 1.0;
    this._brightness = options.brightness ?? 1.0;

    // Create shader programs
    this.blurProgram = this.createProgram(vertexShader, kawaseBlurShader);
    this.blendProgram = this.createProgram(vertexShader, blendShader);
    this.tintProgram = this.createProgram(vertexShader, tintShader);
    this.warpProgram = this.createProgram(vertexShader, domainWarpShader);
    this.outputProgram = this.createProgram(vertexShader, outputShader);

    // Cache attribute locations (same for all programs since they use same vertex shader)
    this.attribs = {
      position: gl.getAttribLocation(this.blurProgram, "a_position"),
      texCoord: gl.getAttribLocation(this.blurProgram, "a_texCoord"),
    };

    // Cache uniform locations
    this.uniforms = {
      blur: {
        resolution: gl.getUniformLocation(this.blurProgram, "u_resolution")!,
        texture: gl.getUniformLocation(this.blurProgram, "u_texture")!,
        offset: gl.getUniformLocation(this.blurProgram, "u_offset")!,
      },
      blend: {
        texture1: gl.getUniformLocation(this.blendProgram, "u_texture1")!,
        texture2: gl.getUniformLocation(this.blendProgram, "u_texture2")!,
        blend: gl.getUniformLocation(this.blendProgram, "u_blend")!,
      },
      warp: {
        texture: gl.getUniformLocation(this.warpProgram, "u_texture")!,
        time: gl.getUniformLocation(this.warpProgram, "u_time")!,
        intensity: gl.getUniformLocation(this.warpProgram, "u_intensity")!,
      },
      tint: {
        texture: gl.getUniformLocation(this.tintProgram, "u_texture")!,
        tintColor: gl.getUniformLocation(this.tintProgram, "u_tintColor")!,
        tintIntensity: gl.getUniformLocation(this.tintProgram, "u_tintIntensity")!,
      },
      output: {
        texture: gl.getUniformLocation(this.outputProgram, "u_texture")!,
        saturation: gl.getUniformLocation(this.outputProgram, "u_saturation")!,
        dithering: gl.getUniformLocation(this.outputProgram, "u_dithering")!,
        time: gl.getUniformLocation(this.outputProgram, "u_time")!,
        scale: gl.getUniformLocation(this.outputProgram, "u_scale")!,
        resolution: gl.getUniformLocation(this.outputProgram, "u_resolution")!,
        brightness: gl.getUniformLocation(this.outputProgram, "u_brightness")!,
      },
    };

    // Create buffers
    this.positionBuffer = this.createBuffer(
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    );
    this.texCoordBuffer = this.createBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));

    // Create source texture
    this.sourceTexture = this.createTexture();

    // Create small FBOs for blur operations (high precision to avoid banding)
    this.blurFBO1 = this.createFramebuffer(BLUR_SIZE, BLUR_SIZE, true);
    this.blurFBO2 = this.createFramebuffer(BLUR_SIZE, BLUR_SIZE, true);

    // Create album FBOs for crossfade (high precision to avoid banding)
    this.currentAlbumFBO = this.createFramebuffer(BLUR_SIZE, BLUR_SIZE, true);
    this.nextAlbumFBO = this.createFramebuffer(BLUR_SIZE, BLUR_SIZE, true);

    // Create full-res warp FBO (will be resized)
    this.warpFBO = this.createFramebuffer(1, 1, true);

    this.resize();
  }

  // Getters and setters
  get warpIntensity(): number {
    return this._warpIntensity;
  }
  set warpIntensity(value: number) {
    this._warpIntensity = Math.max(0, Math.min(1, value));
  }

  get blurPasses(): number {
    return this._blurPasses;
  }
  set blurPasses(value: number) {
    const newValue = Math.max(1, Math.min(40, Math.floor(value)));
    if (newValue !== this._blurPasses) {
      this._blurPasses = newValue;
      // Re-blur with new pass count if we have an image
      if (this.hasImage) {
        this.reblurCurrentImage();
      }
    }
  }

  get animationSpeed(): number {
    return this._targetAnimationSpeed;
  }
  set animationSpeed(value: number) {
    this._targetAnimationSpeed = Math.max(0.1, Math.min(5, value));
  }

  get transitionDuration(): number {
    return this._transitionDuration;
  }
  set transitionDuration(value: number) {
    this._transitionDuration = Math.max(0, Math.min(5000, value));
  }

  get saturation(): number {
    return this._saturation;
  }
  set saturation(value: number) {
    this._saturation = Math.max(0, Math.min(10, value));
  }

  get tintColor(): [number, number, number] {
    return this._tintColor;
  }
  set tintColor(value: [number, number, number]) {
    const newValue = value.map((v) => Math.max(0, Math.min(1, v))) as [number, number, number];
    const changed = newValue.some((v, i) => v !== this._tintColor[i]);
    if (changed) {
      this._tintColor = newValue;
      if (this.hasImage) {
        this.reblurCurrentImage();
      }
    }
  }

  get tintIntensity(): number {
    return this._tintIntensity;
  }
  set tintIntensity(value: number) {
    const newValue = Math.max(0, Math.min(1, value));
    if (newValue !== this._tintIntensity) {
      this._tintIntensity = newValue;
      if (this.hasImage) {
        this.reblurCurrentImage();
      }
    }
  }

  get dithering(): number {
    return this._dithering;
  }
  set dithering(value: number) {
    this._dithering = Math.max(0, Math.min(0.1, value));
  }

  get scale(): number {
    return this._scale;
  }
  set scale(value: number) {
    this._scale = Math.max(0.01, Math.min(4, value));
  }

  get brightness(): number {
    return this._brightness;
  }
  set brightness(value: number) {
    this._brightness = Math.max(0, Math.min(3, value));
  }

  setOptions(options: Partial<KawarpOptions>): void {
    if (options.warpIntensity !== undefined) this.warpIntensity = options.warpIntensity;
    if (options.blurPasses !== undefined) this.blurPasses = options.blurPasses;
    if (options.animationSpeed !== undefined) this.animationSpeed = options.animationSpeed;
    if (options.transitionDuration !== undefined)
      this.transitionDuration = options.transitionDuration;
    if (options.saturation !== undefined) this.saturation = options.saturation;
    if (options.tintColor !== undefined) this.tintColor = options.tintColor;
    if (options.tintIntensity !== undefined) this.tintIntensity = options.tintIntensity;
    if (options.dithering !== undefined) this.dithering = options.dithering;
    if (options.scale !== undefined) this.scale = options.scale;
    if (options.brightness !== undefined) this.brightness = options.brightness;
  }

  getOptions(): Required<KawarpOptions> {
    return {
      warpIntensity: this._warpIntensity,
      blurPasses: this._blurPasses,
      animationSpeed: this._targetAnimationSpeed,
      transitionDuration: this._transitionDuration,
      saturation: this._saturation,
      tintColor: this._tintColor,
      tintIntensity: this._tintIntensity,
      dithering: this._dithering,
      scale: this._scale,
      brightness: this._brightness,
    };
  }

  // Image loading methods
  loadImage(src: string, crossOrigin: string | null = "anonymous"): Promise<void> {
    if (this.isDisposed) return Promise.reject(new Error("Kawarp disposed"));
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = crossOrigin;
      img.onload = () => {
        if (this.isDisposed || !this.sourceTexture) {
          resolve();
          return;
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          img,
        );
        this.processNewImage();
        resolve();
      };
      img.onerror = () => {
        if (this.isDisposed) {
          resolve();
          return;
        }
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  loadImageElement(source: TexImageSource): void {
    if (this.isDisposed) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      source,
    );
    this.processNewImage();
  }

  loadImageData(data: Uint8Array | Uint8ClampedArray, width: number, height: number): void {
    if (this.isDisposed) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data instanceof Uint8ClampedArray ? new Uint8Array(data.buffer) : data,
    );
    this.processNewImage();
  }

  loadFromImageData(imageData: ImageData): void {
    this.loadImageData(imageData.data, imageData.width, imageData.height);
  }

  async loadBlob(blob: Blob): Promise<void> {
    if (this.isDisposed) return;
    try {
      const bitmap = await createImageBitmap(blob);
      if (this.isDisposed) {
        bitmap.close();
        return;
      }
      this.loadImageElement(bitmap);
      bitmap.close();
    } catch (error) {
      if (!this.isDisposed) {
        console.error("Failed to load Kawarp blob:", error);
      }
    }
  }

  loadBase64(base64: string): Promise<void> {
    if (this.isDisposed) return Promise.resolve();
    const src = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
    return this.loadImage(src);
  }

  async loadArrayBuffer(buffer: ArrayBuffer, mimeType = "image/png"): Promise<void> {
    const blob = new Blob([buffer], { type: mimeType });
    return this.loadBlob(blob);
  }

  loadGradient(colors: string[], angle = 135): void {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const angleRad = (angle * Math.PI) / 180;
    const x1 = size / 2 - Math.cos(angleRad) * size;
    const y1 = size / 2 - Math.sin(angleRad) * size;
    const x2 = size / 2 + Math.cos(angleRad) * size;
    const y2 = size / 2 + Math.sin(angleRad) * size;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    this.loadImageElement(canvas);
  }

  /**
   * Process a new image: blur it and start transition
   * This is the key optimization - blur only runs here, not every frame!
   */
  private processNewImage(): void {
    if (this.isDisposed) return;
    // Swap album FBOs - current becomes the "from", we'll render "to" into next
    [this.currentAlbumFBO, this.nextAlbumFBO] = [this.nextAlbumFBO, this.currentAlbumFBO];

    // Blur into nextAlbumFBO
    this.blurSourceInto(this.nextAlbumFBO);

    // Mark that we have an image
    this.hasImage = true;

    // Start transition
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();
  }

  /**
   * Re-blur the current image (used when blurPasses changes)
   * Updates nextAlbumFBO in place without starting a transition
   */
  private reblurCurrentImage(): void {
    if (this.isDisposed) return;
    this.blurSourceInto(this.nextAlbumFBO);
  }

  /**
   * Blur the source texture into the target FBO (with tint applied before blur)
   */
  private blurSourceInto(targetFBO: Framebuffer): void {
    if (this.isDisposed) return;
    const gl = this.gl;

    // Step 1: Apply tint to source texture → blurFBO1
    gl.useProgram(this.tintProgram);
    this.setupAttributes();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO1.framebuffer);
    gl.viewport(0, 0, BLUR_SIZE, BLUR_SIZE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
    gl.uniform1i(this.uniforms.tint.texture, 0);
    gl.uniform3fv(this.uniforms.tint.tintColor, this._tintColor);
    gl.uniform1f(this.uniforms.tint.tintIntensity, this._tintIntensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Step 2: Kawase blur passes on the tinted texture
    gl.useProgram(this.blurProgram);
    this.setupAttributes();
    gl.uniform2f(this.uniforms.blur.resolution, BLUR_SIZE, BLUR_SIZE);
    gl.uniform1i(this.uniforms.blur.texture, 0);

    let readFBO = this.blurFBO1;
    let writeFBO = this.blurFBO2;

    for (let i = 0; i < this._blurPasses; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO.framebuffer);
      gl.viewport(0, 0, BLUR_SIZE, BLUR_SIZE);
      gl.bindTexture(gl.TEXTURE_2D, readFBO.texture);
      gl.uniform1f(this.uniforms.blur.offset, i + 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      [readFBO, writeFBO] = [writeFBO, readFBO];
    }

    // Step 3: Copy final blur result to target FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.framebuffer);
    gl.viewport(0, 0, BLUR_SIZE, BLUR_SIZE);
    gl.bindTexture(gl.TEXTURE_2D, readFBO.texture);
    gl.uniform1f(this.uniforms.blur.offset, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  resize(): void {
    if (this.isDisposed) return;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Only warpFBO needs to be canvas size
    if (this.warpFBO) this.deleteFramebuffer(this.warpFBO);
    this.warpFBO = this.createFramebuffer(width, height, true);
  }

  start(): void {
    if (this.isDisposed || this.isPlaying) return;
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.renderLoop);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  renderFrame(time?: number): void {
    if (this.isDisposed) return;
    const now = performance.now();
    if (time !== undefined) {
      this.render(time, now);
    } else {
      const dt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      this._animationSpeed += (this._targetAnimationSpeed - this._animationSpeed) * 0.05;
      this.accumulatedTime += dt * this._animationSpeed;
      this.render(this.accumulatedTime, now);
    }
  }

  dispose(): void {
    this.stop();
    this.isDisposed = true;
    const gl = this.gl;

    gl.deleteProgram(this.blurProgram);
    gl.deleteProgram(this.blendProgram);
    gl.deleteProgram(this.tintProgram);
    gl.deleteProgram(this.warpProgram);
    gl.deleteProgram(this.outputProgram);

    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.texCoordBuffer);
    gl.deleteTexture(this.sourceTexture);

    this.deleteFramebuffer(this.blurFBO1);
    this.deleteFramebuffer(this.blurFBO2);
    this.deleteFramebuffer(this.currentAlbumFBO);
    this.deleteFramebuffer(this.nextAlbumFBO);
    if (this.warpFBO) this.deleteFramebuffer(this.warpFBO);
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) {
      ext.loseContext();
    }
  }

  private renderLoop = (timestamp: DOMHighResTimeStamp): void => {
    if (this.isDisposed || !this.isPlaying) return;
    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    this._animationSpeed += (this._targetAnimationSpeed - this._animationSpeed) * 0.05;
    this.accumulatedTime += dt * this._animationSpeed;
    this.render(this.accumulatedTime, timestamp);
    this.animationId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Main render loop - very efficient!
   * Just: blend album FBOs → domain warp → output
   */
  private render(time: number, timestamp = performance.now()): void {
    if (this.isDisposed) return;
    const gl = this.gl;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Calculate transition blend factor
    let blendFactor = 1.0;
    if (this.isTransitioning) {
      const elapsed = timestamp - this.transitionStartTime;
      blendFactor = Math.min(1.0, elapsed / this._transitionDuration);
      if (blendFactor >= 1.0) {
        this.isTransitioning = false;
      }
    }

    // Step 1: Blend album FBOs (or use current if not transitioning)
    let blendedTexture: WebGLTexture;

    if (this.isTransitioning && blendFactor < 1.0) {
      // Blend current → next at small resolution (same as album FBOs)
      gl.useProgram(this.blendProgram);
      this.setupAttributes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO1.framebuffer);
      gl.viewport(0, 0, BLUR_SIZE, BLUR_SIZE);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.currentAlbumFBO.texture);
      gl.uniform1i(this.uniforms.blend.texture1, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.nextAlbumFBO.texture);
      gl.uniform1i(this.uniforms.blend.texture2, 1);

      gl.uniform1f(this.uniforms.blend.blend, blendFactor);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      blendedTexture = this.blurFBO1.texture;

      // Warp upscales the blended result to full resolution
      gl.useProgram(this.warpProgram);
      this.setupAttributes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.warpFBO.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, blendedTexture);
      gl.uniform1i(this.uniforms.warp.texture, 0);
      gl.uniform1f(this.uniforms.warp.time, time);
      gl.uniform1f(this.uniforms.warp.intensity, this._warpIntensity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Output with saturation and dithering
      gl.useProgram(this.outputProgram);
      this.setupAttributes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.bindTexture(gl.TEXTURE_2D, this.warpFBO.texture);
      gl.uniform1i(this.uniforms.output.texture, 0);
      gl.uniform1f(this.uniforms.output.saturation, this._saturation);
      gl.uniform1f(this.uniforms.output.dithering, this._dithering);
      gl.uniform1f(this.uniforms.output.time, time);
      gl.uniform1f(this.uniforms.output.scale, this._scale);
      gl.uniform2f(this.uniforms.output.resolution, width, height);
      gl.uniform1f(this.uniforms.output.brightness, this._brightness);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      // No transition - just warp the current album directly
      gl.useProgram(this.warpProgram);
      this.setupAttributes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.warpFBO.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.nextAlbumFBO.texture);
      gl.uniform1i(this.uniforms.warp.texture, 0);
      gl.uniform1f(this.uniforms.warp.time, time);
      gl.uniform1f(this.uniforms.warp.intensity, this._warpIntensity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Output with vignette, saturation and dithering
      gl.useProgram(this.outputProgram);
      this.setupAttributes();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.bindTexture(gl.TEXTURE_2D, this.warpFBO.texture);
      gl.uniform1i(this.uniforms.output.texture, 0);
      gl.uniform1f(this.uniforms.output.saturation, this._saturation);
      gl.uniform1f(this.uniforms.output.dithering, this._dithering);
      gl.uniform1f(this.uniforms.output.time, time);
      gl.uniform1f(this.uniforms.output.scale, this._scale);
      gl.uniform2f(this.uniforms.output.resolution, width, height);
      gl.uniform1f(this.uniforms.output.brightness, this._brightness);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  private setupAttributes(): void {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.attribs.position);
    gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.attribs.texCoord);
    gl.vertexAttribPointer(this.attribs.texCoord, 2, gl.FLOAT, false, 0, 0);
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${error}`);
    }
    return shader;
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const gl = this.gl;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link error: ${error}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }

  private createBuffer(data: Float32Array): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Failed to create buffer");

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  private createTexture(): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) throw new Error("Failed to create texture");

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  }

  private createFramebuffer(width: number, height: number, useHighPrecision = false): Framebuffer {
    const gl = this.gl;
    const texture = this.createTexture();

    const canUseHalfFloat = useHighPrecision && this.halfFloatExt && this.halfFloatLinearExt;
    const type = canUseHalfFloat ? this.halfFloatExt!.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);

    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) throw new Error("Failed to create framebuffer");

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { framebuffer, texture };
  }

  private deleteFramebuffer(fbo: Framebuffer): void {
    this.gl.deleteFramebuffer(fbo.framebuffer);
    this.gl.deleteTexture(fbo.texture);
  }
}

export default Kawarp;
