/**
 * @file Parse Xml
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// https://github.com/segmentio/xml-parser
// MIT license

export type XMLNodeAttributes = { [k: string]: any }
export interface XMLNode {
  name?: string
  content?: string
  attributes: XMLNodeAttributes
  children?: XMLNode[]
}

const reStrip = /^['"]|['"]$/g
const reTag = /^<([\w-:.]+)\s*/
const reContent = /^([^<]*)/
const reAttr = /([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/

function strip (val: string) {
  return val.replace(reStrip, '')
}

export function parseXml (xml: string) {
  // trim and strip comments
  xml = xml.trim().replace(/<!--[\s\S]*?-->/g, '')

  return document()

  function document () {
    return {
      declaration: declaration(),
      root: tag()
    }
  }

  function declaration () {
    const m = match(/^<\?xml\s*/)
    if (!m) return

    // tag
    const node: XMLNode = {
      attributes: {}
    }

    // attributes
    while (!(eos() || is('?>'))) {
      const attr = attribute()
      if (!attr) return node
      node.attributes[attr.name] = attr.value
    }
    match(/\?>\s*/)
    return node
  }

  function tag () {
    const m = match(reTag)
    if (!m) return

    // name
    const node: XMLNode = {
      name: m[1],
      attributes: {},
      children: []
    }

    // attributes
    while (!(eos() || is('>') || is('?>') || is('/>'))) {
      const attr = attribute()
      if (!attr) return node
      node.attributes[attr.name] = attr.value
    }

    // self closing tag
    if (match(/^\s*\/>\s*/)) {
      return node
    }
    match(/\??>\s*/)

    // content
    node.content = content()

    // children
    let child
    while ((child = tag())) {
      node.children!.push(child)
    }

    // closing
    match(/^<\/[\w-:.]+>\s*/)
    return node
  }

  function content () {
    const m = match(reContent)
    if (m) return m[1]
    return ''
  }

  function attribute () {
    const m = match(reAttr)
    if (!m) return
    return { name: m[1], value: strip(m[2]) }
  }

  function match (re: RegExp) {
    const m = xml.match(re)
    if (!m) return
    xml = xml.slice(m[0].length)
    return m
  }

  function eos () {
    return xml.length === 0
  }

  function is (prefix: string) {
    return xml.indexOf(prefix) === 0
  }
}
