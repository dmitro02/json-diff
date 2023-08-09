import * as React from 'react';
import './style.css';
import * as R from 'ramda';

import { left, right } from './data';

export default function App() {
  const rightWithDiff = diff(left, right);

  const original = syntaxHighlight(stringify(left));
  const changed = syntaxHighlight(stringify(rightWithDiff));

  return (
    <div>
      <div className="columns">
        <div className="column">
          <pre dangerouslySetInnerHTML={{ __html: original }} />
        </div>
        <div className="column">
          <pre dangerouslySetInnerHTML={{ __html: changed }} />
        </div>
      </div>
    </div>
  );
}

function stringify(obj: object) {
  return JSON.stringify(obj, null, 2)
}

function syntaxHighlight(json: string) {
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = 'number';
      if (/^"%%%/.test(match)) {
        cls = 'changed';
        match = match.replaceAll('%%%', '');
      } else if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }

      match = handleQuotes(match);

      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
}

function toPaths(value: object, stack = [], paths = []) {
  if (typeof value === 'object' && value !== null) {
    for (let key in value) {
      toPaths(value[key], [...stack, key], paths);
    }
  } else {
    paths.push(stack);
  }
  return paths;
}

function diff(left: object, right: object) {
  const leftPaths = toPaths(left);
  let rightWithDiff = R.clone(right);

  leftPaths.forEach((p) => {
    if (R.path(p, left) !== R.path(p, right)) {
      rightWithDiff = R.modifyPath(p, markAsChanged, rightWithDiff);
    }
  });

  return rightWithDiff;
}

function markAsChanged(val: any) {
  return '%%%' + val + '%%%';
}

function handleQuotes(str: string) {
  const strippedStr = str.replaceAll('"', '');
  if (
    !isNaN(strippedStr as unknown as number) ||
    str === '"true"' ||
    str === '"false"' ||
    str === '"null"'
  ) {
    return strippedStr;
  }
  return str;
}
