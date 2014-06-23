

Example usage
=============

    $( NGL ).bind( 'initialized', function(){
        
        var viewer = new NGL.Viewer( 'container' );

        // a single red sphere of radius 2 at the origin
        var buffer = new NGL.SphereImpostorBuffer(
            new Float32Array( 0, 0, 0 ),
            new Float32Array( 1, 0, 0 ),
            new Float32Array( 2 ),
        );

        viewer.add( buffer );

        viewer.animate();

    });

    NGL.init();


Links
=====

* [WebGL Report](http://webglreport.com/)
* [WebGL Stats](http://webglstats.com/)
* [JSdoc](http://usejsdoc.org/) and [DocStrap](https://github.com/terryweiss/docstrap)
* [three.js](http://threejs.org/)
    * [Github](https://github.com/mrdoob/three.js/)
    * [Examples](http://threejs.org/examples/)
    * [Documentation](http://threejs.org/docs/)
* [dat.GUI](https://github.com/dataarts/dat.gui)



SSH
===

install sshfs

    sudo apt-get install sshfs


mount

    sshfs -o idmap=user arose@zatopek:/shared/home/arose /home/arose/servers/zatopek


unmount

    fusermount -u /home/arose/servers/zatopek


/etc/fstab

    sshfs#arose@zatopek:/shared/home/arose /home/arose/servers/zatopek fuse defaults,idmap=user 0 0


keep the connection active (alive) by adding this to ~/.ssh/config or to /etc/ssh/ssh_config

    ServerAliveInterval 60


passwordless ssh

    sudo ssh-copy-id arose@zatopek
