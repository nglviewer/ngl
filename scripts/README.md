
### mmCIF

Download current archive as mmcif
```
mkdir -p ../build/data/mmcif-all/
node js/node/download.js --allCurrent --outDir ../build/data/mmcif-all/ --format cif
```

Parse current archive from mmcif
```
mkdir -p ../build/logs/mmcif-all/
node js/node/timeParsing.js --dir ../build/data/mmcif-all/ --out ../build/logs/mmcif-all/
```

### MMTF

Download current archive as mmtf
```
mkdir -p ../build/data/mmtf-all/
node js/node/download.js --allCurrent --outDir ../build/data/mmtf-all/ --format mmtf
```

Parse current archive from mmtf
```
mkdir -p ../build/logs/mmtf-all/
node js/node/timeParsing.js --dir ../build/data/mmtf-all/ --out ../build/logs/mmtf-all/
```


## Render gallery

```
slimerjs js/slimer/gallery.js
```

```
slimerjs js/slimer/gallery.js port:8091
```
