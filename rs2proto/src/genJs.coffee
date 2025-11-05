> fs > existsSync
  @3-/write
  path > join
  @js0.site/proto2js
  # @3-/rolldown


< (name, dir_gen, proto_fp, func_id_map)=>
  proto2js(
    proto_fp
    join(dir_gen,'js')
    []
    (i)=>func_id_map[i]
  )
  dir_js = join dir_gen, 'js'
  dir_js_package_json = join dir_js, 'package.json'

  # code = await rolldown(
  #   join dir_js, name, 'Api.js'
  #   {
  #     external: [/^js0\.site\//, /^@js0\.site\//]
  #   }
  #   false
  # )
  # console.log(code)

  if not existsSync dir_js_package_json
    write(
      dir_js_package_json
      JSON.stringify(
        {
          name: '@'+name.replace('_','/')
          version: "0.1.0"
          license: "MulanPSL-2.0"
          author: "jssite@googlegroups.com"
          type: 'module'
          exports: {
            ".": './'+name+'/Api.js',
            "./*": "./*",
          },
          files: [
            "*"
          ],
          dependencies: {
            "js0.site": "^0.1.3",
          }
        }
      )
    )

  return
