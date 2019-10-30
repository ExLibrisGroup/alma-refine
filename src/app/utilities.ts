/* Return specified properties from object */
export const pick = (props: Array<string>) => o => props.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

/* Chunks array and returns array of arrays of specified size */
export const chunk = (inputArray: Array<any>, size:number) => {
  return inputArray.reduce((all,one,i) => {
    const ch = Math.floor(i/size); 
    all[ch] = [].concat((all[ch]||[]),one); 
    return all;
  }, []);
}

/* Execute XPath */
export const select = (doc: Document, expression: string, context: Node = null) => doc.evaluate(expression, context || doc, null, XPathResult.ANY_TYPE, null)

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}