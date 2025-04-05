declare module 'pica' {
  interface PicaOptions {
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
  }

  interface PicaInstance {
    resize(
      from: HTMLCanvasElement,
      to: HTMLCanvasElement,
      options?: PicaOptions,
    ): Promise<HTMLCanvasElement>;
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>;
  }

  const Pica: {
    new (): PicaInstance;
    default: new () => PicaInstance;
  };

  export default Pica;
}
