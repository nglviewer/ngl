#! /usr/bin/env python

from OpenGLContext import testingcontext
BaseContext = testingcontext.getInteractive()

from OpenGL.GL import *
from OpenGL.arrays import vbo
from OpenGLContext.arrays import *
from OpenGL.GL import shaders
from OpenGL.GLU import *

import sys


class TestContext( BaseContext ):
    
    viewportDimensions = ( 512, 512 )

    """Creates a simple vertex shader..."""
    def OnInit( self ):
        VERTEX_SHADER = shaders.compileShader( open("vert.glsl", "r").read(), GL_VERTEX_SHADER )

        FRAGMENT_SHADER = shaders.compileShader( open("frag.glsl", "r").read(), GL_FRAGMENT_SHADER )

        self.shader = shaders.compileProgram( VERTEX_SHADER,FRAGMENT_SHADER )

        self.vbo = vbo.VBO(
            array( [
                [  0, 1, 0 ],
                [ -1,-1, 0 ],
                [  1,-1, 0 ],
                [  2,-1, 0 ],
                [  4,-1, 0 ],
                [  4, 1, 0 ],
                [  2,-1, 0 ],
                [  4, 1, 0 ],
                [  2, 1, 0 ],
            ],'f')
        )

        self.UNIFORM_LOCATIONS = {
            'viewport': glGetUniformLocation( self.shader, 'viewport' ),
            'pointSizeThreshold': glGetUniformLocation( self.shader, 'pointSizeThreshold' ),
            'MaxPixelSize': glGetUniformLocation( self.shader, 'MaxPixelSize' ),
            'ConstantRadius': glGetUniformLocation( self.shader, 'ConstantRadius' ),
        }

        self.width = 512
        self.height = 512
        # glViewport( 0, 0, self.width, self.height )

        glClearColor(0.0, 0.0, 0.0, 0.0)    # This Will Clear The Background Color To Black
        glClearDepth(1.0)                   # Enables Clearing Of The Depth Buffer
        glDepthFunc(GL_LESS)                # The Type Of Depth Test To Do
        glEnable(GL_DEPTH_TEST)             # Enables Depth Testing
        glShadeModel(GL_SMOOTH)             # Enables Smooth Color Shading
        
        glMatrixMode(GL_PROJECTION)

        glMatrixMode(GL_MODELVIEW)


    def Render( self, mode):
        """Render the geometry for the scene."""

        BaseContext.Render( self, mode )
        if not mode.visible:
            return

        self.ViewPort( self.width, self.height )

        shaders.glUseProgram(self.shader)

        glUniform2f( self.UNIFORM_LOCATIONS['viewport'], self.width, self.height )
        glUniform1f( self.UNIFORM_LOCATIONS['pointSizeThreshold'], 0.0 )
        glUniform1f( self.UNIFORM_LOCATIONS['MaxPixelSize'], 50.0 )
        glUniform1f( self.UNIFORM_LOCATIONS['ConstantRadius'], 1.0 )

        glRotate( 45, 0,1,0 )
        glScale( 3,3,3 )

        # Clear The Screen And The Depth Buffer
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        try:
            self.vbo.bind()
            try:
                glEnableClientState( GL_VERTEX_ARRAY );
                glEnable( GL_PROGRAM_POINT_SIZE );
                glVertexPointerf( self.vbo )
                # glDrawArrays( GL_TRIANGLES, 0, 9 )
                glDrawArrays( GL_POINTS, 0, 9 )
            finally:
                self.vbo.unbind()
                glDisableClientState( GL_VERTEX_ARRAY );
        finally:
            shaders.glUseProgram( 0 )



if __name__ == "__main__":
    TestContext.ContextMainLoop()



