import React from 'react';
import { useEffect, useState, useRef } from 'react';
import './index.scss';

interface Props {}

interface Line {
  inlines: string[];
  content: string;
}

const LINE_HEIGHT: number = 18;
const DEFAULT_FONT_SIZE: number = 16;

const Edtior: React.FC<Props> = props => {
  const inputRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  // 文档内容（行的列表
  const [lines, setLines] = useState<Line[]>([
    {
      inlines: [''],
      content: '',
    },
  ]);
  // 当前所在行（实际行，以回车为准
  const [currentLine, setCurrentLine] = useState<number>(0);
  // 当前行输入内容
  const [inputContent, setInputContent] = useState<string>('');
  // 光标实际位置（像素
  const [cursorCoor, setCursorCoor] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  // 光标于当前行所在位置（字符下标
  const [lineCoor, setLineCoor] = useState(0);

  useEffect(() => {
    let content = lines[0].inlines[0];
    let left = getTextWdith(content);
    setInputContent(content);
    setCursorCoor({
      x: left,
      y: 0,
    });
  }, []);

  function getTextWdith(text: string, fontSize: number = DEFAULT_FONT_SIZE) {
    let context: any = canvasRef.current.getContext('2d');
    context.font = `${fontSize}px Arial`;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    return context.measureText(text).width;
  }

  function moveCursor(content: string, inlines: string[], _lineCoor: number, _currentLine: number) {
    let sum: number = 0;
    let x: number = 0;
    let y: number = 0;
    for (let i = 0, len = inlines.length; i < len; i++) {
      let line = inlines[i];
      if (sum + line.length >= _lineCoor) {
        x = getTextWdith(content.substring(sum, _lineCoor));
        y = i * LINE_HEIGHT;
        break;
      }
      sum += line.length;
    }
    for (let i = 0; i < _currentLine; i++) {
      let line = lines[i];
      y += line.inlines.length * LINE_HEIGHT;
    }
    setCursorCoor({ x, y });
  }

  // function moveCursorInline(
  //   line: Line,
  //   _currentLine: number,
  //   inlineIndex: number,
  //   letterIndex: number,
  // ) {
  //   let x = getTextWdith(line.inlines[inlineIndex].substring(0, letterIndex));
  //   let y = inlineIndex * LINE_HEIGHT;
  //   for (let i = 0; i < _currentLine; i++) {
  //     y += LINE_HEIGHT * lines[i].inlines.length;
  //   }
  //   setCursorCoor({
  //     x,
  //     y,
  //   });
  // }

  function moveCursorAtInput(content: any, inlines: any) {
    let _lineCoor = lineCoor + inputRef.current.selectionStart - inputContent.length;
    setLineCoor(_lineCoor);
    moveCursor(content, inlines, _lineCoor, currentLine);
  }

  /**
   * 校验键盘事件(移动光标)
   * @param e
   */
  function checkKey(e: any) {
    let _lineCoor = lineCoor;
    let _currentLine = currentLine;
    let line = lines[_currentLine];
    let inlines = line.inlines;
    // console.log(line.content);
    switch (e.keyCode) {
      case 38: // up
        if (_lineCoor <= lines[currentLine].inlines[0].length) {
          _currentLine -= 1;
          _currentLine = _currentLine < 0 ? 0 : _currentLine;
          _lineCoor = 0;
        } else {
          // 行内移动
          let sum = 0;
          for (let i = 0; i < inlines.length; i++) {
            if (sum + inlines[i].length > _lineCoor) {
              _lineCoor = sum;
              break;
            }
            sum += inlines[i].length;
          }
        }
        break;
      case 40: // down
        if (inlines.length === 1 || _lineCoor > inlines[inlines.length - 2].length) {
          _currentLine += 1;
          _currentLine = _currentLine > lines.length - 1 ? lines.length - 1 : _currentLine;
          _lineCoor = 0;
        } else {
          // 行内移动
          let sum = 0;
          for (let i = 0; i < inlines.length; i++) {
            if (sum + inlines[i].length > _lineCoor) {
              _lineCoor = sum + inlines.length;
              break;
            }
            sum += inlines[i].length;
          }
        }
        break;
      case 37: // left
        _lineCoor = lineCoor - 1;
        if (_lineCoor < 0 && _currentLine > 0) {
          _currentLine -= 1;
          _lineCoor = lines[_currentLine].content.length;
          // console.log(lines[_currentLine].content.length);
        } else if (_lineCoor < 0) {
          _lineCoor = 0;
        }
        break;
      case 39: // right
        _lineCoor = lineCoor + 1;
        if (_lineCoor > line.content.length && _currentLine < lines.length - 1) {
          console.log('current line + 1');
          _currentLine += 1;
          _lineCoor = 0;
        } else if (_lineCoor > line.content.length) {
          _lineCoor = line.content.length;
        }
        break;
    }
    // _lineCoor = _lineCoor > inputContent.length ? inputContent.length : _lineCoor;
    if (_lineCoor !== lineCoor || _currentLine !== currentLine) {
      // inputRef.current.selectionStart = _lineCoor;
      // inputRef.current.selectionEnd = _lineCoor;
      setLineCoor(_lineCoor);
      // console.log(_lineCoor);
      moveCursor(inputContent, lines[currentLine].inlines, _lineCoor, _currentLine);
      if (currentLine !== _currentLine) {
        // console.log('set current line');
        // console.log('set current line');
        setInputContent(lines[_currentLine].content);
        setCurrentLine(_currentLine);
      }
      // e.preventDefault();
    }
  }

  /**
   * 分行
   */
  function splitRow(content: string) {
    let sum: number = 0;
    let inlines = lines[currentLine].inlines;
    let splitLineIndex = 0;
    for (let i = 0, len = inlines.length; i < len; i++) {
      let line = inlines[i];
      if (sum + line.length >= lineCoor) {
        splitLineIndex = i;
        break;
      }
      sum += line.length;
    }
    let nexRowContent: string = inlines[splitLineIndex].substring(lineCoor - sum, content.length);
    inlines[splitLineIndex] = inlines[splitLineIndex].substring(0, lineCoor - sum);
    lines[currentLine].inlines = inlines.splice(0, splitLineIndex + 1);

    let y: number = 0;
    let x: number = 0;
    for (let i = 0; i <= currentLine; i++) {
      y += lines[i].inlines.length * LINE_HEIGHT;
    }
    setCursorCoor({ x, y });

    setCurrentLine(currentLine + 1);
    setInputContent(nexRowContent);
    setLineCoor(0);
    setLines(
      lines.concat({
        content: nexRowContent,
        inlines: [nexRowContent],
      }),
    );
  }

  function onInput(e: any) {
    let content: string = e.currentTarget.value;
    if (content.match(/\n/g)) {
      splitRow(inputContent);
      return;
    }
    let inlines: string[] = [];
    lines[currentLine].content = content;
    do {
      let index: number = findNextRow(content);
      if (index === -1) {
        inlines.push(content);
        break;
      } else {
        inlines.push(content.substring(0, index));
        content = content.substring(index, content.length);
      }
    } while (true);
    lines[currentLine].inlines = inlines;
    setLines(lines.concat([]));
    moveCursorAtInput(lines[currentLine].content, inlines);
    setInputContent(lines[currentLine].content);
  }

  function findNextRow(text: string): number {
    for (let i = 1; i < text.length; i++) {
      if (getTextWdith(text.substring(0, i + 1)) > 600) {
        return i;
      }
    }
    return -1;
  }

  function toFocus() {
    inputRef.current.focus();
  }

  return (
    <div className="editor-container" onFocus={toFocus} tabIndex={-1}>
      <textarea
        ref={inputRef}
        className="editor-real-input"
        onChange={onInput}
        value={inputContent}
        onKeyDown={checkKey}
      />
      <canvas ref={canvasRef} width="600" height="800" />
      <div
        className="editor-cursor"
        style={{ left: `${cursorCoor.x}px`, top: `${cursorCoor.y}px` }}
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
