function toggleClass(element, className) {
    if (!element || !className) {
        return;
    }

    var classString = element.className, nameIndex = classString.indexOf(className);
    if (nameIndex == -1) {
        classString += '' + className;
    }
    else {
        classString = classString.substr(0, nameIndex) + classString.substr(nameIndex+className.length);
    }
    element.className = classString;
};

var nesRunning = false;


function nesStart()
{
    
    nesRunning = true;

    var canvas  = document.getElementById("nes-canvas");
    var context = canvas.getContext("2d");
    var image   = context.getImageData(0, 0, 256, 240);	
    var framebuffer = new ArrayBuffer(image.data.length);
    var framebuffer_u8 = new Uint8ClampedArray(framebuffer);
    var framebuffer_u32 = new Uint32Array(framebuffer);

    var AUDIO_BUFFERING = 512;
    var SAMPLE_COUNT = 4*1024;
    var SAMPLE_MASK = SAMPLE_COUNT - 1;
    var audio_samples_L = new Float32Array(SAMPLE_COUNT);
    var audio_samples_R = new Float32Array(SAMPLE_COUNT);
    var audio_write_cursor = 0, audio_read_cursor = 0;

    var audioContext = new AudioContext();
    var audioProcessor = audioContext.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
    audioProcessor.connect(audioContext.destination);

    function audio_remain()
    {  return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;  }

    audioProcessor.onaudioprocess = function(audioEvent)
    {
        if( audio_remain() < AUDIO_BUFFERING ) 
            return;

        var len = audioEvent.outputBuffer.length;

        for(var i = 0; i < len; i++)
        {
            var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
            audioEvent.outputBuffer.getChannelData(0)[i] = audio_samples_L[src_idx];
            audioEvent.outputBuffer.getChannelData(1)[i] = audio_samples_R[src_idx];
        }
        
        audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
    };

    const urlParams = new URLSearchParams(window.location.search);

    const fileBase = (urlParams.has("file")) ? urlParams.get("file") : "";
    const fileName = "roms/" + fileBase + ".nes";

    const req = new XMLHttpRequest();
    req.open("GET", fileName);
    req.overrideMimeType("text/plain; charset=x-user-defined");
    req.onerror = function() { console.log(`Error loading ${path}: ${req.statusText}`); }
    req.onload = function() 
    {
        var nes = new jsnes.NES({

            onFrame: function(framebuffer_24)
            {
                for(var i = 0; i < 256*240; i++) 
                    framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
                image.data.set(framebuffer_u8);
                context.putImageData(image, 0, 0);
            },

            onAudioSample: function(left, right)
            {
                audio_samples_L[audio_write_cursor] = left;
                audio_samples_R[audio_write_cursor] = right;
                audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
            },
        });

        nes.loadROM(req.responseText);

        setInterval(nes.frame, 16.6);

    var keyNames = {
      37: "LEFT", 38: "UP", 39: "RIGHT",  40: "DOWN",
      88: "B",    67: "A",  32: "SELECT", 13: "START"
    };

    
    document.onkeydown = function(eventData) {
      nes.buttonDown(1, jsnes.Controller["BUTTON_" + keyNames[eventData.keyCode]]);
    };
    
    document.onkeyup = function(eventData) {
      nes.buttonUp(1, jsnes.Controller["BUTTON_" + keyNames[eventData.keyCode]]);
    };

    var vBButton = document.getElementById("vB-button");
    var isButtonPressed = false;

    function pressBButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 88 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseBButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 88 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vBButton.addEventListener("touchstart", function() {
    pressBButton();
    toggleClass(document.getElementById("button-B-pressed"),"off");
    });

    vBButton.addEventListener("touchend", function() {
    releaseBButton();
    toggleClass(document.getElementById("button-B-pressed"),"off");
    });

    vBButton.addEventListener("mousedown", function() {
    pressBButton();
    toggleClass(document.getElementById("button-B-pressed"),"off");
    });

    vBButton.addEventListener("mouseup", function() {
    releaseBButton();
    toggleClass(document.getElementById("button-B-pressed"),"off");
    });

    vBButton.addEventListener("mouseout", function() {
    releaseBButton();
    });

    var vAButton = document.getElementById("vA-button");
    var isButtonPressed = false;
    
    function pressAButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 67 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseAButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 67 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vAButton.addEventListener("touchstart", function() {
    pressAButton();
    toggleClass(document.getElementById("button-A-pressed"),"off");
    });

    vAButton.addEventListener("touchend", function() {
    releaseAButton();
    toggleClass(document.getElementById("button-A-pressed"),"off");
    });

    vAButton.addEventListener("mousedown", function() {
    pressAButton();
    toggleClass(document.getElementById("button-A-pressed"),"off");
    });

    vAButton.addEventListener("mouseup", function() {
    releaseAButton();
    toggleClass(document.getElementById("button-A-pressed"),"off");
    });

    vAButton.addEventListener("mouseout", function() {
    releaseAButton();
    });

    var vSelectButton = document.getElementById("vSelect-button");
    var isButtonPressed = false;
    
    function pressSelectButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 32 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseSelectButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 32 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vSelectButton.addEventListener("touchstart", function() {
    pressSelectButton();
    toggleClass(document.getElementById("button-Select-pressed"),"off");
    });

    vSelectButton.addEventListener("touchend", function() {
    releaseSelectButton();
    toggleClass(document.getElementById("button-Select-pressed"),"off");
    });

    vSelectButton.addEventListener("mousedown", function() {
    pressSelectButton();
    toggleClass(document.getElementById("button-Select-pressed"),"off");
    });

    vSelectButton.addEventListener("mouseup", function() {
    releaseSelectButton();
    toggleClass(document.getElementById("button-Select-pressed"),"off");
    });

    vSelectButton.addEventListener("mouseout", function() {
    releaseSelectButton();
    });

    var vStartButton = document.getElementById("vStart-button");
    var isButtonPressed = false;
    
    function pressStartButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 13 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseStartButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 13 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vStartButton.addEventListener("touchstart", function() {
    pressStartButton();
    toggleClass(document.getElementById("button-Start-pressed"),"off");
    });

    vStartButton.addEventListener("touchend", function() {
    releaseStartButton();
    toggleClass(document.getElementById("button-Start-pressed"),"off");
    });

    vStartButton.addEventListener("mousedown", function() {
    pressStartButton();
    toggleClass(document.getElementById("button-Start-pressed"),"off");
    });

    vStartButton.addEventListener("mouseup", function() {
    releaseStartButton();
    toggleClass(document.getElementById("button-Start-pressed"),"off");
    });

    vStartButton.addEventListener("mouseout", function() {
    releaseStartButton();
    });

    var vUpButton = document.getElementById("vUp-button");
    var isButtonPressed = false;
    
    function pressUpButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 38 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseUpButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 38 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vUpButton.addEventListener("touchstart", function() {
    pressUpButton();
    });

    vUpButton.addEventListener("touchend", function() {
    releaseUpButton();
    });

    vUpButton.addEventListener("mousedown", function() {
    pressUpButton();
    });

    vUpButton.addEventListener("mouseup", function() {
    releaseUpButton();
    });

    vUpButton.addEventListener("mouseout", function() {
    releaseUpButton();
    });

    var vDownButton = document.getElementById("vDown-button");
    var isButtonPressed = false;
    
    function pressDownButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 40 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseDownButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 40 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vDownButton.addEventListener("touchstart", function() {
    pressDownButton();
    });

    vDownButton.addEventListener("touchend", function() {
    releaseDownButton();
    });

    vDownButton.addEventListener("mousedown", function() {
    pressDownButton();
    });

    vDownButton.addEventListener("mouseup", function() {
    releaseDownButton();
    });

    vDownButton.addEventListener("mouseout", function() {
    releaseDownButton();
    });

    var vLeftButton = document.getElementById("vLeft-button");
    var isButtonPressed = false;
    
    function pressLeftButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 37 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseLeftButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 37 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vLeftButton.addEventListener("touchstart", function() {
    pressLeftButton();
    });

    vLeftButton.addEventListener("touchend", function() {
    releaseLeftButton();
    });

    vLeftButton.addEventListener("mousedown", function() {
    pressLeftButton();
    });

    vLeftButton.addEventListener("mouseup", function() {
    releaseLeftButton();
    });

    vLeftButton.addEventListener("mouseout", function() {
    releaseLeftButton();
    });

    var vRightButton = document.getElementById("vRight-button");
    var isButtonPressed = false;
    
    function pressRightButton() {
    var keyEvent = new KeyboardEvent("keydown", { keyCode: 39 });
    document.dispatchEvent(keyEvent);
    isButtonPressed = true;
    }

    function releaseRightButton() {
    var keyUpEvent = new KeyboardEvent("keyup", { keyCode: 39 });
    document.dispatchEvent(keyUpEvent);
    isButtonPressed = false;
    }

    vRightButton.addEventListener("touchstart", function() {
    pressRightButton();
    });

    vRightButton.addEventListener("touchend", function() {
    releaseRightButton();
    });

    vRightButton.addEventListener("mousedown", function() {
    pressRightButton();
    });

    vRightButton.addEventListener("mouseup", function() {
    releaseRightButton();
    });

    vRightButton.addEventListener("mouseout", function() {
    releaseRightButton();
    });
        

    };

    req.send();

}

var vPowerButton = document.getElementById("vPower-button");

vPowerButton.addEventListener("click", function() {
if (!nesRunning) {
    nesStart();
    toggleClass(document.getElementById("power-on-glow"),"off");
    toggleClass(document.getElementById("power-on-button"),"off");
        
};

});

vPowerButton.addEventListener("touchend", function() {
if (!nesRunning) {
    nesStart();
    toggleClass(document.getElementById("power-on-glow"),"off");
    toggleClass(document.getElementById("power-on-button"),"off");
        
};

});