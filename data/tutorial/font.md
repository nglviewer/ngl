
See [here](https://github.com/libgdx/libgdx/wiki/Distance-field-fonts) for a
detailed description of distance field fonts and how they can be created.

The *fnt* files where created with *Hiero* which can be started with:

    java -cp gdx.jar:gdx-natives.jar:gdx-backend-lwjgl.jar:gdx-backend-lwjgl-natives.jar:extensions/gdx-tools/gdx-tools.jar com.badlogic.gdx.tools.hiero.Hiero

The fields of the *fnt* format:

* __id__ - The ID of the character from the font file.
* __x__ - X position within the bitmap image file.
* __y__ - Y position within the bitmap image file.
* __width__ - Width of the character in the image file.
* __height__ - Height of the character in the image file.
* __xoffset__ - Number of pixels to move right before drawing this character.
* __yoffset__ - Number of pixels to move down before drawing this character.
* __xadvance__ - Number of pixels to jump right after drawing this character.
* __page__ - The image to use if characters are split across multiple images.
* __chnl__ - The color channel, if color channels are used for separate characters.



 