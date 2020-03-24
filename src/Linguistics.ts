import React from "react";
// graph, phone, phoneme 
// graph : letters
// group of graphs 
type graph = 'a' | 'b'|'A' | 'sch'| 'Sch'| 'SCH'
enum graphAttribute {
  capital,
  punctunation,
  number,
}
function getGraphAttributes(graph:graph) {
  const array: graphAttribute[] = []
  return array
}
type grapheme = {
  alographs : graph[] // alternatives
} 

const graphemes:{[key in string]:grapheme} = {
  a:{alographs:['a','A']},
  sch:{alographs:['sch','SCH','Sch']}
}

enum attribute {
  // articulation modifiers: font face? 
  aspirated,
  liquid,
  plosive,
  rounded,
  vocal, 

  // sonarances: hue,weight
  voiced,
  long,
// postion  : crosshair background
  high,
  low,
  front,
  back,

  labial,
  dental,
  avelar,
  palatal,
  glotal,
}

type attributeDisplayMapping = {
  aspirated: {color:'green'},
  liquid: {color:'blue'},
  plosive: {color:'black'},
  vocal: { color:'red'}

  rounded: { textDecoration: ' line-through wavy'},

  // sonarances: hue,weight
  voiced: {fontWeight:'bold'},
  long: {fontWeight:'bold'},
// postion  : crosshair background
  high: {textDecoration: 'lineover'},
  low: {textDecoration: 'underline'},
  mid: {textDecoration: 'line-through'}
  // horizontal
  front: {backgroundImage:'front'},
  back: {backgroundImage:'back'},

  labial: {backgroundImage:'labial'},
  dental: {},
  avelar: {},
  palatal: {},
  glotal: {},
} 
type phone = {
  graphemes : grapheme[] // compositions
  attributes : attribute[] 
} 
const phones:{[key in string]:phone} = {
  a: {
    graphemes: [graphemes.a],
    attributes : [attribute.vocal, attribute.low] 
  },
  SCH: {
    graphemes: [graphemes.sch],
    attributes : [attribute.palatal, attribute.aspirated] 
  }
}

// all graphs
type phoneme = {
  alophones : phone[],
}

function filterUniques(unique: attribute[], alophone: phone) {
  return unique.filter(attr=>alophone.attributes.includes(attr))
}
function uniqueAttributes(phoneme:phoneme) {
  const keys = Object.keys(attribute).filter(k => typeof attribute[k as any] === "number"); // ["A", "B"]
  const values = keys.map(k => {const attr= attribute[k as any]; return attr as unknown as attribute; } ); // [0, 1]
  return phoneme.alophones.reduce(filterUniques,  values)
}
// comp phone keyboard: grid vx2 (3x3) l(1x4) stops(?x2) aspirated(?x2)
// findphones and order category: find by attributes(...attributes) // vocal ! rounded, front, back, !back, !front 
// phone to display symbol, 
// comp phone
// toPhones = grapheme => searchPhone(phones, grapheme)
// const style=attributesStyles(phone) // phone.attributes.map(attributeDisplayMapping[attribute])
// <span style={style}>{toStandardDisplay(phone)}</span>  // lower case
// 
// const graphemes = splitGraphemes(text) // order by longest, split off start
// const graphemeStyles = graphemes.map(toPhones).map(phone=>phone.attributes.map(attributeDisplayMapping[attribute]))
// graphemes.forEach(
//    <span style={graphemeStyles[index]}>{grapheme}</span> 
// )
// 
// find vocal phones- not rounded - high, mid, low - order front to back, mid?
// find vocal phones - rounded
// 
// how to handle ambiguous: e, long short schwa, or s z  or d t 
