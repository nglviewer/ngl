
See [here](https://github.com/libgdx/libgdx/wiki/Distance-field-fonts) for a detailed description of distance field fonts and how they can be created.

The *fnt* files where created with *Hiero* which can be started with:

	java -cp gdx.jar:gdx-natives.jar:gdx-backend-lwjgl.jar:gdx-backend-lwjgl-natives.jar:extensions/gdx-tools/gdx-tools.jar com.badlogic.gdx.tools.hiero.Hiero

The fields of the *fnt* format are:

| field    | description                                                           |
|----------|-----------------------------------------------------------------------|
| id       | The ID of the character from the font file                            |
| x        | X position within the bitmap image file                               |
| y        | Y position within the bitmap image file                               |
| width    | Width of the character in the image file                              |
| height   | Height of the character in the image file                             |
| xoffset  | Number of pixels to move right before drawing this character          |
| yoffset  | Number of pixels to move down before drawing this character           |
| xadvance | Number of pixels to jump right after drawing this character           |
| page     | The image to use if characters are split across multiple images       |
| chnl     | The color channel, if color channels are used for separate characters |
