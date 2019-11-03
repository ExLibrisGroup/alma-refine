export const Utils = {

  /* Return specified properties from object */
  pick: (props: Array<string>) => o => props.reduce((a, e) => ({ ...a, [e]: o[e] }), {}),

  /* Chunks array and returns array of arrays of specified size */
  chunk: (inputArray: Array<any>, size:number) => {
    return inputArray.reduce((all,one,i) => {
      const ch = Math.floor(i/size); 
      all[ch] = [].concat((all[ch]||[]),one); 
      return all;
    }, []);
  },

  /* Execute XPath */
  select: (doc: Document, expression: string, context: Node = null) => doc.evaluate(expression, context || doc, null, XPathResult.ANY_TYPE, null),

  /* Asynchronously executes the function for each element in the array */
  asyncForEach: async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },

  /* Removes elements of a certain class */
  removeElements: (elms) => elms.forEach(el => el.remove()),

  /* Filters objects by predicate */
  filter: (obj: Object, predicate: Function) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} ),

  // Element
  // {size = 'big', coords = {x: 0, y: 0}, radius = 25} = {}
  dom: (name: string, options: {parent?: Element, text?: string, className?: string, 
    id?: string, attributes?: {att: string, val: string}[]} = {}) => {

    let element = document.createElement(name);

    if (options.parent) {
      options.parent.appendChild(element);
    }

    if (options.text) {
      element.innerHTML = options.text;
    }

    if (options.className) {
      element.className = options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.attributes) {
      options.attributes.forEach(attr => {
        let att = attr['att'];
        let val = attr['val'];
        element.setAttribute(att, val);
      });
    }

    return element;  
  }

}

