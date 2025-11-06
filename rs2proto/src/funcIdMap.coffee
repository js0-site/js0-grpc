> path > join
  @3-/yml/load.js
  @3-/yml/dump.js
  @3-/camel
  fs > existsSync

export default (dir_gen, func_li)=>
  fp = join dir_gen, 'funcId.yml'
  if existsSync fp
    func2id = load fp
  else
    func2id = {}
  next_id = 0
  for i from Object.values func2id
    if i > next_id
      next_id = i

  max_id = next_id

  for func from func_li
    func = camel func.join('_')
    if not (func of func2id)
      func2id[func] = ++next_id

  if max_id != next_id
    dump(fp, func2id)

  return func2id
