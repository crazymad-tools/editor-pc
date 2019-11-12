const canvas: any = document.createElement('canvas');

const context: any = canvas.getContext('2d');

export default class EditorUtils {
  static DEFAULT_FONT_SIZE: number = 16;

  static getTextWidthByCanvas (text: string, fontSize: number = this.DEFAULT_FONT_SIZE) {
    context.font = `${fontSize}px Arial`;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    return context.measureText(text).width;
  }
}
