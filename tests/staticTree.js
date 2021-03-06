var staticTree = require('./../src/staticTree.js')
var suite = {}

suite['should convert actions to objects'] = function (test) {
  var signal = [
    function sync1 () {}
  ]
  var tree = staticTree(signal).branches
  test.deepEqual(tree, [{
    name: 'sync1',
    options: {
      output: undefined,
      outputs: undefined,
      defaultOutput: undefined,
      defaultInput: undefined,
      input: undefined
    },
    duration: 0,
    path: [0],
    isExecuting: false,
    hasExecuted: false,
    isAsync: false,
    outputs: null,
    actionIndex: 0
  }])
  test.done()
}

suite['should use display name of action if available'] = function (test) {
  var action = function () {}
  action.displayName = 'foo'
  var signal = [
    action
  ]
  var tree = staticTree(signal).branches
  test.equal(tree[0].name, 'foo')
  test.done()
}

suite['should bring along arrays and indicate async'] = function (test) {
  function async1 () {}
  async1.async = true

  var signal = [
    async1
  ]
  var tree = staticTree(signal).branches
  test.equals(tree.length, 1)
  test.ok(Array.isArray(tree[0]))
  test.equals(tree[0][0].name, 'async1')
  test.equals(tree[0][0].isAsync, true)
  test.done()
}

suite['should keep paths'] = function (test) {
  function async1 () {}
  async1.async = true

  var signal = [
    async1, {
      success: [
        function sync1 () {}
      ]
    }
  ]
  var tree = staticTree(signal).branches
  test.equals(tree[0].length, 1)
  test.deepEqual(Object.keys(tree[0][0].outputs), ['success'])
  test.equals(tree[0][0].outputs.success.length, 1)
  test.equals(tree[0][0].outputs.success[0].name, 'sync1')
  test.equals(tree[0][0].outputs.success[0].actionIndex, 1)
  test.done()
}

suite['should handle deeply nested structures'] = function (test) {
  function async1 () {}
  async1.async = true
  function async2 () {}
  async2.async = true

  var signal = [
    async1, {
      success: [
        function sync1 () {},
        async2
      ]
    }
  ]
  var tree = staticTree(signal).branches
  test.equals(tree[0][0].outputs.success[1][0].name, 'async2')
  test.deepEqual(tree[0][0].outputs.success[1][0].path, [0, 0, 'outputs', 'success', 1, 0])
  test.deepEqual(tree[0][0].outputs.success[1][0].actionIndex, 2)
  test.done()
}

suite['should only keep one reference to an action'] = function (test) {
  var action = function sync1 () {}
  var signal = [
    action,
    action
  ]
  var tree = staticTree(signal).branches
  test.equals(tree[0].actionIndex, 0)
  test.equals(tree[1].actionIndex, 0)
  test.done()
}

suite['should throw if output path doesn\'t matches to action outputs'] = function (test) {
  var action = function sync1 () {}
  action.outputs = ['foo']
  var signal = [
    action, {
      foo: [],
      bar: []
    }
  ]
  test.throws(function () {
    staticTree(signal).branches
  })
  test.done()
}

module.exports = { staticTree: suite }
