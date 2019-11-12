import React from 'react';
import { useEffect, useState, useRef } from 'react';
import './index.scss';
import * as _ from 'lodash';

interface Props {}

const ROW_SPACING = 21;

const App: React.FC<Props> = props => {
  const input = useRef<any>(null);
  const contentRef = useRef<any>(null);
  const [content, setContent] = useState<string>('');
  const [cursorOffset, setcursorOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lines, setLines] = useState<string[]>(['']);
  const [currentLine, setCurrentline] = useState<number>(0);
  const [inputCursor, setInputCursor] = useState<number>(0);
  
  function focusInput() {
    // input.current.focus();
    window.onkeydown = (e: any) => {
      input.current.focus();
      // input.input(e);
    };
  }

  function blurInput() {
    // console.log('blur');
    input.current.blur();
  }

  function inputChange(e: any) {
    let content = e.currentTarget.value;
    if (content.match('\n')) {
      let slice = content.split('\n');
      let prefix: string = slice.length > 1 ? slice[0] : '';
      let suffix: string = slice.length > 2 ? slice[2] : '';
      lines[currentLine] = prefix;
      let newLines = lines.splice(0, currentLine + 1);
      newLines.push(suffix);
      newLines.concat(lines);
      setContent(suffix);
      setCurrentline(currentLine + 1);
      setLines(newLines);
    } else {
      lines[currentLine] = content;
      setLines(lines.concat([]));
      setContent(content);
      let dom: any = document.getElementById('contentTextWidth');
      // dom.innerText = content;
      setcursorOffset({
        x: dom.clientWidth,
        y: cursorOffset.y
      });
    }
  }

  function focusLine(index: any, e?: any) {
    let event: any = window.event;
    setCurrentline(index);
    setContent(lines[index]);
    getPosition(lines[index], event);
    if (lines[index] === '') {
      // console.log(contentRef.current);
      // contentRef.current.getElementByTag();
    } else {
    }
  }

  function getPosition(text: any, event: { offsetX: number; offsetY: number }) {
    let x = event.offsetX;
    let y = Math.ceil(event.offsetY / ROW_SPACING);
    // console.log(event.offsetX, event.offsetY);
    let dom: any = document.getElementById('contentTextWidth');
    dom.innerText = text;
    let rowCount = dom.clientHeight / ROW_SPACING;
    let left: number = 0;
    let right: number = 0;
    if (rowCount === 1 || text === '') {
      left = 0;
      right = text.length;
    } else if (y === rowCount) {
      left = findRowLeft(0, text.length - 1, y, text);
      right = text.length;
    } else if (y === 0) {
      left = 0;
      right = findRowRight(left + 1, text.length, y, text) - 1;
    } else {
      left = findRowLeft(0, text.length - 1, y, text);
      right = findRowRight(left + 1, text.length, y, text) - 1;
    }
    // let center = text !== '' ? getXPosition(0, right - left, event.offsetX, text.substring(left, right)) : 0
    // center += left;
    let center = getXPosition(0, right - left, event.offsetX, text.substring(left, right));
    // let inputCursor = center[1] + left;
    setInputCursor(center[1] + left);
    input.current.selectionStart = input.current.selectionEnd = center[1] + left;
    setcursorOffset({
      x: center[0],
      y: (y - 1) * ROW_SPACING,
    });
  }

  function getXPosition(start: number, end: number, col: number, text: string): number[] {
    let dom: any = document.getElementById('contentTextWidth');
    dom.innerText = text.substring(0, end);
    let leftX: number = dom.clientWidth;
    if (col > leftX && end === text.length) {
      return [leftX, end];
    }

    let mid: number = end - Math.floor((end - start) / 2);
    dom.innerText = text.substring(0, mid - 1);
    leftX = dom.clientWidth;
    dom.innerText = text.substring(0, mid);
    let rightX: number = dom.clientWidth;
    if (col >= leftX && col <= rightX) {
      return [leftX, mid - 1];
    } else if (col <= leftX) {
      return getXPosition(start, mid, col, text);
    } else if (col >= rightX) {
      return getXPosition(mid, end, col, text);
    }
    return [0, 0];
  }

  function findRowLeft(start: number, end: number, row: number, text: string): number {
    let mid = Math.floor(end - (end - start) / 2);
    let dom: any = document.getElementById('contentTextWidth');
    dom.innerText = text.substring(0, mid);
    let count = dom.clientHeight / ROW_SPACING;
    if (count < row) {
      dom.innerText = text.substring(0, mid + 1);
      count = dom.clientHeight / ROW_SPACING;
      if (count === row) {
        return mid;
      } else {
        return findRowLeft(mid + 2, end, row, text);
      }
    } else if (count === row) {
      return findRowLeft(start, mid - 1, row, text);
    }
    return 0;
  }

  function findRowRight(start: number, end: number, row: number, text: string): number {
    let mid = Math.floor(end - (end - start) / 2);
    let dom: any = document.getElementById('contentTextWidth');
    dom.innerText = text.substring(0, mid);
    let count = dom.clientHeight / ROW_SPACING;
    if (count > row) {
      dom.innerText = text.substring(0, mid - 1);
      count = dom.clientHeight / ROW_SPACING;
      if (count === row) {
        return mid;
      } else {
        return findRowRight(start, mid - 1, row, text);
      }
    } else if (count === row) {
      dom.innerText = text.substring(0, mid + 1);
      count = dom.clientHeight / ROW_SPACING;
      if (count === row + 1) {
        return mid + 1;
      } else {
        return findRowRight(mid + 1, end, row, text);
      }
    }

    return 0;
  }

  function onSelect() {
    console.log('on select');
  }

  return (
    <div className="main-page">
      <div className="editor-container" onClick={focusInput} onBlur={blurInput}>
        <textarea ref={input} onChange={inputChange} value={content} />
        <div
          className="edtior-content"
          onSelect={onSelect}
          ref={contentRef}
          contentEditable={false}
        >
          {lines.map((line: string, index: number) => {
            return line === '' ? (
              <div className="blank-row" key={index} onClick={focusLine.bind(null, index)} />
            ) : (
              <p key={index} onClick={e => focusLine(index, e)}>
                {line}
              </p>
            );
          })}
        </div>
        <div
          className="editor-cursor"
          style={{ left: cursorOffset.x + 'px', top: cursorOffset.y + 'px' }}
        />
      </div>
      <span id="contentTextWidth" />
    </div>
  );
};

export default App;
