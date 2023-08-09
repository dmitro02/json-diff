import * as React from 'react';
import './style.css';
import { diff } from 'deep-object-diff';
import * as R from 'ramda';

import { left, right } from './data';

export default function App() {
  const leftPaths = toPaths(left);
  let newRight = R.clone(right);

  leftPaths.forEach((p) => {
    if (R.path(p, left) !== R.path(p, right)) {
      console.log(R.path(p, right));
      newRight = R.modifyPath(p, markAsChanged, newRight);
    }
  });

  const original = syntaxHighlight(JSON.stringify(left, null, 2));
  const changed = syntaxHighlight(JSON.stringify(newRight, null, 2));
  console.log(changed);

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

function markAsChanged(val) {
  return '%%%' + val + '%%%';
}
