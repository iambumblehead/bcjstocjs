// Filename: bcjstocjs.js  
// Timestamp: 2016.04.03-19:56:14 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var estraverse = require('estraverse'),
    escodegen = require('escodegen'),
    esprima = require('esprima');

var bcjstocjs = module.exports = function (content) {

  // return `true` for node like below
  // 
  // Object.defineProperty(exports, '__esModule', {
  //   value: true
  // });
  function isdefineProp_esModule (expression) {
    return (
      expression &&
        expression.type === 'CallExpression' &&
        expression.callee.type === 'MemberExpression' &&
        expression.arguments.reduce(function (prev, arg) {
          return prev || (arg.type === 'Identifier' &&
                          arg.name === 'exports');
        }, false) &&
        expression.arguments.reduce(function (prev, arg) {
          return prev || (arg.type === 'Literal' &&
                          arg.value === '__esModule');
        }, false));
  }

  // module.exports = exports['default']; // false
  // exports.duration = duration;         // false
  // exports['default'] = resolveUrl;     // true  
  function isexportsdefault (expression) {
    var type = expression && expression.type,
        left = expression && expression.left;

    return (
      type === 'AssignmentExpression' &&
        left &&
        left.type === 'MemberExpression' &&
        left.object &&
        left.object.type === 'Identifier' &&
        left.object.name === 'exports' && 
        ((left.property.type === 'Literal' &&
          left.property.value === 'default') ||
         (left.property.type === 'Identifier' &&
          left.property.name === 'default'))
    );
  }

  // exports['default'] = resolveUrl;     // true
  // exports.duration = duration;         // true
  // exports.seekable = seekable;         // true
  // exports['default'] = Playlist;       // true
  function isexports (expression) {
    var type = expression && expression.type,
        left = expression && expression.left;
    
    return (
      type === 'AssignmentExpression' &&
        left &&
        left.type === 'MemberExpression' &&
        left.object &&
        left.object.type === 'Identifier' &&
        left.object.name === 'module' &&
        left.property.type === 'Identifier' &&
        left.property.name === 'exports'
    ) || (
      type === 'AssignmentExpression' &&
        left &&
        left.type === 'MemberExpression' &&
        left.object &&
        left.object.type === 'Identifier' &&
        left.object.name === 'exports'
    );
  }
  
  var ast = esprima.parse(content);
  ast.body = ast.body.filter(function (node) {
    var remove = false,
        expression = node.expression;

    remove = isdefineProp_esModule(expression);
    if (!remove && isexports(expression)) {
      // replace exports['default'] with module.exports
      if (isexportsdefault(expression)) {
        expression.left = {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'exports' }
        };
      } else {
        remove = true;
      }
    }
    
    return !remove;
  });

  return escodegen.generate(ast, {
    format: {
      indent: { style: '  ' },
      semicolons: true,
      compact: false
    }
  });  
  
  return content;
};


