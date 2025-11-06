> ./type2proto.js

< (li) =>
  li.map (i, pos)=>
    type2proto [
      '_'+(pos+1)
      i
    ]
