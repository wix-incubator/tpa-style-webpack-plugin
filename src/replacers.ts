import {Declaration} from 'postcss';

const annotateDirection = (match) => `"direction(${match})"`;

function replaceRtlStrings(str) {
  return str.replace(/STARTSIGN/g, annotateDirection)
    .replace(/ENDSIGN/g, annotateDirection)
    .replace(/START/g, annotateDirection)
    .replace(/END/g, annotateDirection)
    .replace(/DIR/g, annotateDirection);
}

function replaceValue(str) {
  str = str.trim();

  if (str.match(/STARTSIGN\d/)) {
    str = str.replace('STARTSIGN', annotateDirection);
  }
  if (str.match(/ENDSIGN\d/)) {
    str = str.replace('ENDSIGN', annotateDirection);
  }
  if (str.match(/DEG-START/)) {
    str = str.replace('DEG-START', annotateDirection);
  }
  if (str.match(/DEG-END/)) {
    str = str.replace('DEG-END', annotateDirection);
  }

  if (str === 'DIR') {
    str = annotateDirection(str);
  } else if (str === 'END') {
    str = annotateDirection(str);
  } else if (str === 'START') {
    str = annotateDirection(str);
  }

  return str;
}

export function directionReplacer(decl: Declaration): Declaration {
  decl.prop = replaceRtlStrings(decl.prop);
  decl.value = replaceValue(decl.value);

  return decl;
}
