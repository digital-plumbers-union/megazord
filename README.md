- basic rollup config
  - rollup still a pain in the ass because of various setup requied to move from commonjs to esm -- ts-node also only works with the value set to commonjs
- add signale log wrapper
  - get types worked out -- peep overlook stuff for merging types
  - provide PR to signale for publishing types
- rip yarn workspace code
- write top-level rollup entrypoint/config that will fall back to workspace specific rollup config 



register dpu sock puppet to squat on @dpu/ npm scope + github sock puppet for automation

make @jkcfg parameter wrappers return NonNullable types

how to handle mixins in jkcfg?  e.g., namespaces isnt valid on all kubernetes resources