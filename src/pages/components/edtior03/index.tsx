import React from 'react';
import { useEffect, useState, useRef } from 'react';
import EditorUtils from '@/utils/EditorUtils';
import './index.scss';

interface Props {}

interface Line {
  inlines: string[];
  content: string;
  selection?: number[]
  // height: 0;
}

const LINE_HEIGHT: number = 18;
const DEFAULT_FONT_SIZE: number = 16;
const canvas: any = document.createElement('canvas');
const ctx: any = canvas.getContext('2d');

const Edtior: React.FC<Props> = props => {
  const inputRef = useRef<any>(null);
  const [inputContent, setInputContent] = useState();
  const [cursorScreenCoor, setCursorScreenCoor] = useState({ x: 0, y: 0 });
  const [cursorCoor, setCursorCoor] = useState<number[]>([0, 0, 2]);
  const [lines, setLines] = useState<Line[]>([
    {
      inlines: ['超级大本营', 'dadas'],
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

  // useEffect(() => {
  //   setLines(lines.map((line: Line) => {
  //     return line;
  //   }));
  // }, []);

  useEffect(() => {
    let content = lines[cursorCoor[0]].inlines[cursorCoor[1]].substring(0, cursorCoor[2]);
    let x = EditorUtils.getTextWidthByCanvas(content);
    let y = cursorCoor[1] * LINE_HEIGHT;
    for (let i = 0; i < cursorCoor[0]; i++) {
      y += lines[i].inlines.length * LINE_HEIGHT;
    }
    setCursorScreenCoor({
      x,
      y,
    });
  }, [cursorCoor]);

  function toFocus() {
    inputRef.current.focus();
  }

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
          coor[2] = Math.min(lines[coor[0]].inlines[0].length, coor[2]);
        } else if (coor[1] < line.inlines.length - 1) {
          coor[1] += 1;
          coor[2] = Math.min(line.inlines[coor[1]].length, coor[2]);
        } else {
          coor[2] = line.inlines[line.inlines.length - 1].length;
        }
        break;
      case 37: // left
        coor[2] -= 1;
        if (coor[2] < 0) {
          if (coor[1] === 0 && coor[0] === 0) {
            coor[2] = 0;
          } else if (coor[1] > 0) {
            coor[1] -= 1;
            coor[2] = line.inlines[coor[1]].length;
          } else if (coor[1] === 0 && coor[0] > 0) {
            coor[0] -= 1;
            coor[1] = lines[coor[0]].inlines.length - 1;
            coor[2] = lines[coor[0]].inlines[coor[1]].length;
          }
        }
        break;
      case 39: // right
        coor[2] += 1;
        if (coor[2] > line.inlines[coor[1]].length) {
          if (coor[0] === lines.length - 1 && coor[1] === line.inlines.length - 1) {
            coor[2] = line.inlines[coor[1]].length;
          } else if (coor[1] < line.inlines.length - 1) {
            coor[1] += 1;
            coor[2] = 0;
          } else if (coor[0] < lines.length - 1 && coor[2] > line.inlines[coor[1]].length) {
            coor[0] += 1;
            coor[1] = 0;
            coor[2] = 0;
          }
        }
        break;
    }
    setCursorCoor(coor.concat([]));
  }

  function onInput() {}

  function onClickDown (e: any) {
    let event: any = window.event;
    let {layerX, layerY} = event;
    let rowCount = 0;
    for (let i = 0, len = lines.length; i < len; i++) {
      if (rowCount + lines[i].inlines.length * LINE_HEIGHT >= layerY) {
        let inlineIndex: number = Math.ceil((layerY - rowCount) / LINE_HEIGHT) - 1;
        let inline: string = lines[i].inlines[inlineIndex];
        cursorCoor[0] = i;
        cursorCoor[1] = inlineIndex;
        if (layerX > EditorUtils.getTextWidthByCanvas(inline)) {
          cursorCoor[2] = lines[i].inlines[inlineIndex].length;
        } else {
          for (let j = 0; j < inline.length; j++) {
            
          }
        }
        setCursorCoor(cursorCoor.concat([]));
        return;
      }
      rowCount += lines[i].inlines.length * LINE_HEIGHT;
    }
    if (rowCount < layerY) {
      cursorCoor[0] = lines.length - 1;
      cursorCoor[1] = lines[cursorCoor[0]].inlines.length - 1;
      cursorCoor[2] = lines[cursorCoor[0]].inlines[cursorCoor[1]].length;
    }
    setCursorCoor(cursorCoor.concat([]));
  }

  return (
    <div
      className="editor-container"
      onFocus={toFocus}
      tabIndex={-1}
      onMouseDown={onClickDown}
      onMouseUp={() => {}}
    >
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
