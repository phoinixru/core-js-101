/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.assign(
    Object.create(proto),
    JSON.parse(json),
  );
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Selector {
  constructor(type, value, parent = null) {
    this.type = type;
    this.value = value;
    this.parent = parent;

    if (!parent) {
      return;
    }

    if (['element', 'id', 'pseudoElement'].includes(type) && parent.have([type])) {
      throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    const order = Object.keys(this.templates);
    const typeIdx = order.indexOf(type);
    const lowerTypes = order.slice(typeIdx + 1);

    if (parent.have(lowerTypes)) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  }

  stringify() {
    const template = this.templates[this.type];

    const selector = [
      this.parent ? this.parent.stringify() : null,
      template.replace('%value%', this.value),
    ]
      .filter((e) => e)
      .join``;

    return selector;
  }

  element(value) {
    return new Selector('element', value, this);
  }

  id(value) {
    return new Selector('id', value, this);
  }

  class(value) {
    return new Selector('class', value, this);
  }

  attr(value) {
    return new Selector('attr', value, this);
  }

  pseudoClass(value) {
    return new Selector('pseudoClass', value, this);
  }

  pseudoElement(value) {
    return new Selector('pseudoElement', value, this);
  }

  have(types) {
    return types.includes(this.type) || (this.parent && this.parent.have(types));
  }
}

Selector.prototype.templates = {
  element: '%value%',
  id: '#%value%',
  class: '.%value%',
  attr: '[%value%]',
  pseudoClass: ':%value%',
  pseudoElement: '::%value%',
};

const cssSelectorBuilder = {

  element(value) {
    return new Selector('element', value);
  },

  id(value) {
    return new Selector('id', value);
  },

  class(value) {
    return new Selector('class', value);
  },

  attr(value) {
    return new Selector('attr', value);
  },

  pseudoClass(value) {
    return new Selector('pseudoClass', value);
  },

  pseudoElement(value) {
    return new Selector('pseudoElement', value);
  },

  combine(selector1, combinator, selector2) {
    return {
      stringify() {
        return [selector1.stringify(), combinator, selector2.stringify()].join` `;
      },
    };
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
