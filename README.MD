### AdjustProjectFile.js
## Whats the function of this module?
This javascript file can be used to correct Source&Adapternames for NEEO-adapters (SDK-Adapters) when they are moved to a new machine.
A more common practice for it, is for a NEEO-custom driver like JAC459's excellent Meta (see https://github.com/jac459/meta) that runs as a docker container and is recreated.
When the container is recreated, NEEO assigns it a new Source- and Adapter-name, resulting in all devices in NEEO that use it, not to function anymore. 

### Why do I need to run this module?
As described above, the internal administration of NEEO will become outdated when you start to move a SDK-adapter to another mach9ine. 
This can happen when you run a custom driver (or multiple through Meta) but move the image over to another logical or physical machine.
When this happens, NEEO will see the custom driver that was moved (or logically recreated) "just as a new device SDK-driver". When you look in NEEO's GUI in sdk-adapters, you will see duplicate entries.. 
What happened?
NEEO "sees" a new machine that has an SDK-adapter on it and sets it up as a new device, while leaving the old version active too; hence you'll see the SDK-adapter twice. 
When looking at the internal administration of NEEO (project-home files), you will see each device-driver in there. The device driver points to the SDK-adapter by which it was defined originally with two names: sourceName and adapterName. However, these original names were invalidated when the SDK-adapter was moved or recreated: the new sdk-adapter received a new sourcename and adaper name.    
When you now send a command to a device that still has the old source&adaptername, NEEO simply ignores it (as the original SDK-adapter hasn't become online for NEEO).
This means that all device-drivers you have defined for this c ustom driver (SDK-adapter), won't work anymore. 
And THAT's why I designed this module: it will change all "old source&adapternames" into the new ones.
By the way, you will have a single sourceName for an SDK-adapter, biut every device driver has a unique adaptername per device installed. 

### How to use
This module modifies the latest project-home file of NEEO and adjusts the specifications of the sdk-adapter to match a newly created meta.
For it to function properly (it needs to know the old AND new SDK-designations, some steps need to be taken first.
It simply checks all devices that are created using a custom driver and lists these first. 
Then it checks for all device names that end with the string "(2)". It then checks if it has exactly the same device name but without the " (2)". If it finds such a device pair, it knows the old source&adaptername and the new one (the device name ending with "(2)"is the new one).
So, you simply need to create a duplicate version of each device that is serviced by this SDK-adaper (custom driver) and MAKE SURE the new name is exactly the same as the old one. NEEO takes care of this for you: if you add a device with a name that already exists, it adds the " (2)" suffix to it.
So, what do you need to do to make the magic happen:
- Assuming the adapter is already running on the new environment (physical system or Docker-container) 
- Determine ALL custom driver that were running on the old environment (SDK-driver) and execute the following acions for it: (in this example,let's assume we nhave a driver with the name "Kodi (192.168.0.47)"
- Just create another version of this device using NEEO's GUI for this same device. As the name already exists, NEEO assigns the name "Kodi (192.168.0.47) (2)" to it.
   It is imperative that you have an old driver name and new driver name that ONLY differ by the last 4 characters: " (2)". 
   If you renamed your old driver earlier, make sure that the new name IS following this requirement. 
   If you already have this new name somewhere, the module WILL NOT WORK properly!
- Place AdjustProjectfile.js somehwere on your brain where you have write access for user neeo.
- The module requires one additional module (jsonpath plus). Just install this module manualy: in the same directory issue "npm install jsonpath-plus"
- Once installed, you can run the program simply like this:

sudo node AdjustProjectfile.js

It will first identify the internal NEEO project-file that is in use, makes a backup of it in the current directory (thats why you need write access to it). If the file already exists, it will not recreate it, but leave it as it is; that way, you'll always have the original content.
The  it will process the project-file, executing he procedure described above thereby fixing the "outdated NEEO adminiistration".
It then writes the changeds administration back to the NEEO directory (/steady/neeo/cp6).
You then simply restart your brain (or shortcut: pm2_NEEPO erestart cp6) and you should be all set to use the new adapter. 
You can then delete the temporary created device drivers ("Kodi (192.168.0.47) (2)") as they have served their purpose and are no longer necessary.

## Wait, if I need to create every driver manually, whats the benefi of this module?
Good question: all of your settings (recipes, shortcuts,  favorites etc) are still in the old definition.... 
Running this module makes sure that they are preserved....
And that may save you a whole lot of manual adjustments.....
