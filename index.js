const { JSDOM } = require('jsdom');
const https = require('https');

const url = 'https://www.etymonline.com/word/' + process.argv[2];
const BOLD_UNDERLINED = '\033[1m\033[4m\033[7m';
const ITALIC = '\033[3m';
const NORMAL = '\033[0m';
const INDENT_N = 4;

let html = '';
https.get(url, res => {
  res.setEncoding('utf-8');
  res.on('data', data => { html += data; });
  res.on('end', () => { parse(html); });
});

function parse(html) {
  const dom = new JSDOM(html);
  dom.window.document.querySelectorAll('[class^="word--"]')
    .forEach(word => {
      const title = word.querySelector('[class^="word__name--"]').textContent;
      const detail = word.querySelector('[class^="word__defination--"]').textContent;
      printTitle(title);
      // IMPORTANT: typeof process.env.* === 'string'
      printLines(detail, parseInt(process.env.COLUMNS) || undefined);
    });
}

function printTitle(title) {
  console.log('\n' + BOLD_UNDERLINED + title + NORMAL + '\n');
}

function printLines(str, n=80) {
  let INDENT = ' '.repeat(INDENT_N);
  let start = 0;
  let end = 0;
  while (start < str.length) {
    end = start + Math.min(n, 80) - INDENT_N;
    while (
      end > start && end < str.length
      && str[end] !== ' ' && str[end - 1] !== ' '
    ) {
      end -= 1;
    };
    let slice = str.slice(start, end);
    slice = (
      slice
        .replace(/"(?=\w)/g, ITALIC + '"')
        .replace(/((?<=[\w,.])"(?=[ ,.\)\]])|"$)/g, '"' + NORMAL)
        .replace(/\n(?=\S)/g, '\n' + INDENT)
    );
    console.log(INDENT + slice.trim());
    start = end;
  }
  console.log();
}
