#!/usr/bin/env coffee

> @3-/read
  path > join

Parse = (index, func_li, paths, mod)=>
  exist = new Set
  parse = (item_id, mod_li)=>
    item = index[item_id]
    if not item
      # console.log paths[item_id]
      return
    if item.visibility != 'public'
      return
    if exist.has item_id
      return
    exist.add item_id
    {
      use
    } = item.inner
    if use
      {
        name
        id
      } = use
      parse(
        id
        mod_li
      )
    else
      {
        name
        inner
      } = item
      if item.docs == 'rs2proto::ignore'
        return
      if inner.function
        func_li.push [
          item_id
          mod_li.concat([name])
          inner.function
          mod
        ]
      else if inner.module
        _mod_li = [...mod_li, name]
        for i from inner.module.items
          parse(
            i
            _mod_li
          )
    return

  return parse

gen = (dir_target, func_li)=>
  _gen = (project, mod_li)=>
    await $"cargo rustdoc --output-format json -Z unstable-options -p #{project}"

    mod = JSON.parse read join(
      dir_target
      'doc/'+project+'.json'
    )

    {
      index
      paths
    } = mod

    # console.log(JSON.stringify mod,null,2)

    rename = new Map

    for [_,val] from Object.entries index
      {use} = val.inner
      if use
        {id} = use
        (
          index[id] || paths[id]
        ).name = use.name

    for [id,val] from Object.entries index
      if 'public' == val.visibility
        {
          inner
          name
        } = val

        module = inner.module
        if module
          if name == project
            parse = Parse(index, func_li, paths, mod)
            module.items.forEach (i)=>parse(i, mod_li)
        else
          {use} = inner
          if use
            {
              crate_id
              kind
              name
            } = paths[inner.use.id]
            if kind == 'module'
              await _gen(
                mod.external_crates[crate_id].name
                mod_li.concat([name])
              )
    return

export default (dir_target, project)=>
  func_li = []

  await gen(dir_target, func_li)(
    project
    []
  )

  func_li.sort(
    (a,b)=>
      if a[0]>b[0]
        return 1
      return -1
  )
  func_li.forEach (li)=>
    li.shift()
    return
  return func_li
