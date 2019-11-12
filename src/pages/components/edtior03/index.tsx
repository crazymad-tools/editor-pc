import React from 'react';
import { useEffect, useState, useRef } from 'react';
import EditorUtils from '@/utils/EditorUtils';
import './index.scss';

interface Props {}

interface Line {
  inlines: string[];
  content: string;
  // height: 0;
}

const LINE_HEIGHT: number = 18;
const DEFAULT_FONT_SIZE: number = 16;
const canvas: any = document.createElement('canvas');
const ctx: any = canvas.getContext('2d');

const Edtior: React.FC<Props> = props => {
  const inputRef = useRef(null);
  const [inputContent, setInputContent] = useState();
  const [cursorScreenCoor, setCursorScreenCoor] = useState({ x: 0, y: 0 });
  const [cursorCoor, setCursorCoor] = useState<number[]>([0, 0, 2]);
  const [lines, setLines] = useState<Line[]>([
    {
      inlines: ['超级大本营'],
      content: '超级大本营',
    },
    {
      inlines: ['啦啦啦啦啦啦啦啦啦啦'],
      content: '啦啦啦啦啦啦啦啦啦啦',
    },
    {
      inlines: ['不知道该说什么'],
      content: '不知道该说什么',
    },
  ]);

  useEffect(() => {
    let content = lines[cursorCoor[0]].inlines[cursorCoor[1]].substring(0, cursorCoor[2]);
    let x = EditorUtils.getTextWidthByCanvas(content);
    let y = 0;
    for (let i = 0; i < cursorCoor[0]; i++) {
      y += lines[i].inlines.length * LINE_HEIGHT;
    }
    setCursorScreenCoor({
      x,
      y,
    });
  }, [cursorCoor]);

  function toFocus() {}

  function checkKey(e: any) {
    let coor: number[] = cursorCoor;
    let line: Line = lines[coor[0]];
    switch (e.keyCode) {
      case 38: // up
        if (coor[1] === 0 && coor[0] > 0) {
          // 当前行的屏幕行第一行
          coor[0] -= 1;
          coor[1] = lines[coor[0]].inlines.length - 1;
          coor[2] = Math.min(lines[coor[0]].inlines[coor[1]].length, coor[2]);
        } else if (coor[1] > 0) {
          // 当前行的非屏幕行第一行
          coor[1] -= 1;
          coor[2] = Math.min(lines[coor[0]].inlines[coor[1]].length, coor[2]);
        } else {
          // 当前行是第一行的屏幕第一行
          coor[2] = 0;
        }
        break;
      case 40: // down
        if (coor[1] === line.inlines.length - 1 && coor[0] < lines.length - 1) {
          // 当前行的屏幕行最后一行
          coor[0] += 1;
          coor[1] = 0;
          coor[2] = Math.min(lines[coor[0]].inlines[0].length, coor[2])
        } else if (coor[1] < line.inlines.length) {
          
        }
        break;
      case 37: // left
        break;
      case 39: // right
        break;
    }
  }

  function onInput() {}

  return (
    <div className="editor-container" onFocus={toFocus} tabIndex={-1}>
      <textarea
        ref={inputRef}
        className="editor-real-input"
        onChange={onInput}
        value={inputContent}
        onKeyDown={checkKey}
      />
      {/* <canvas ref={canvasRef} width="600" height="800" /> */}
      <div
        className="editor-cursor"
        style={{ left: `${cursorScreenCoor.x}px`, top: `${cursorScreenCoor.y}px` }}
      />
      {lines.map((line: Line, index: number) => {
        return (
          <div
            className="line"
            key={index}
            onFocus={() => {
              console.log('focus');
            }}
          >
            {line.inlines.map((inline: string, index: number) => {
              return (
                <pre className="inline" key={index}>
                  {inline}
                </pre>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Edtior;
