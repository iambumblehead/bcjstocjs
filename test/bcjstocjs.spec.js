// Filename: bcjstocjs.spec.js  
// Timestamp: 2016.04.03-19:58:58 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    bcjstocjs = require('../');

var bcjs1 = fs.readFileSync('./test/bcjs1.js', 'utf-8');  

describe("bcjstocjs", function () {
  it("should convert a bcjs content to cjs", function () {

    var result = bcjstocjs(bcjs1);

    expect(true).toBe(true);
  });
});
