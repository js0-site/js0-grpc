#!/usr/bin/env coffee

> @3-/zx > cd
  path > join
  @3-/write
  ./rs/mod.js
  ./genJs.js
  ./genProto.js
  ./genVolo.js
  ./funcIdMap.js

export default (cargo_dir)=>
  cwd = process.cwd()
  if cargo_dir
    if cargo_dir != cwd
      cd cargo_dir
  else
    cargo_dir = cwd

  $.verbose = true
  $.stdout = 0
  {
    stdout
  } = await $'cargo metadata --no-deps --format-version=1'

  delete $.stdout

  {
    target_directory: dir_target
    workspace_default_members
  } = JSON.parse(stdout)

  name = workspace_default_members[0].split('/').pop()

  if name.includes('@')
    name = name.split('@')[0].split('#').pop()
  else
    name = name.split('#')[0]

  func_li = await mod(dir_target, name)

  dir_gen = join cargo_dir, 'gen'

  func_id_map = funcIdMap cargo_dir, func_li.map((i)=>i[0])

  proto = genProto(
    name
    func_li
  )

  proto_fp = join(dir_gen, 'api.proto')

  write(
    proto_fp
    proto
  )

  genJs(name, dir_gen, proto_fp, func_id_map)
  genVolo(name, func_li, dir_gen, func_id_map)
  return
