import { Scene } from 'phaser';

export abstract class BaseScene extends Scene {
  protected uiElements: Map<string, Phaser.GameObjects.GameObject> = new Map();

  create() {
    this.setupResizeListener();
    this.createScene();
  }

  protected abstract createScene(): void;

  protected setupResizeListener() {
    this.scale.on('resize', this.handleResize, this);
    
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });
  }

  protected handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    
    this.cameras.main.setSize(width, height);
    this.repositionUI(width, height);
    
    // Emit global resize event for HTML overlays
    window.dispatchEvent(new CustomEvent('gameResize', {
      detail: { width, height }
    }));
  }

  protected abstract repositionUI(width: number, height: number): void;

  protected registerUIElement(key: string, element: Phaser.GameObjects.GameObject) {
    this.uiElements.set(key, element);
  }

  protected getUIElement<T extends Phaser.GameObjects.GameObject>(key: string): T | undefined {
    return this.uiElements.get(key) as T;
  }

  protected getRelativePosition(percentage: number, dimension: number): number {
    return dimension * percentage;
  }

  protected centerX(width: number): number {
    return width * 0.5;
  }

  protected centerY(height: number): number {
    return height * 0.5;
  }

  protected topPadding(height: number, padding: number = 0.05): number {
    return height * padding;
  }

  protected bottomPadding(height: number, padding: number = 0.05): number {
    return height * (1 - padding);
  }

  protected leftPadding(width: number, padding: number = 0.05): number {
    return width * padding;
  }

  protected rightPadding(width: number, padding: number = 0.05): number {
    return width * (1 - padding);
  }

  protected scaleText(baseSize: number, width: number, referenceWidth: number = 1920): number {
    return Math.max(12, Math.floor(baseSize * (width / referenceWidth)));
  }

  protected scaleValue(baseValue: number, dimension: number, referenceDimension: number = 1920): number {
    return baseValue * (dimension / referenceDimension);
  }
}