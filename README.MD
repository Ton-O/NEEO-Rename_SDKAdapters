### AdjustProjectFile.js
## Whats the function of this module?
This javascript file can be used to correct Source&Adapternames for NEEO-adapters (SDK-Adapters) when they are moved to a new machine.
A more common practice for it, is for a NEEO-custom driver like JAC459's excellent Meta (see https://github.com/jac459/meta) that runs as a docker container.
When the container is recreated, NEEO assigns it a new Source- and Adapter-name, resulting in all devices in NEEO that use it, not to function anhymore.

### How to use
This module modifies the latest project-home file of NEEO and adjusts the specifications of the sdk-adapter to match a newly created meta.
For it to function properly (it needs to know the old AND new SDK-designation)s, some seps need to be taken firs.t:
- Assuming the adaper is already running on the new environment (physical system or Docker-container) 
- Determine one custom driver that was running on thenold environment. Let's assume it's name is "Kodi (192.168.0.47)"
- Just create another device, using NEEO's GUI formthis same device. As the name already exists, NEEO assigns the name "Kodi (192.168.0.47) (2)" to it.
   It is imperative that you have an old driver name and new driver name that ONLY differ by the last 4 characters: " (2):. 
   If you renamed your old driver earlier, make shure that the new name is following this requirement. 
   If you already have this new name somewhere, the module WILL NOT WORK!
- Place AdjustProjectfile.js somehwere on your brain wherte you have write access withn user neeo.
- The module requires one additional module (jsonpath plus). Just install this module manualy: npm install jsonpath-plus
- Once installed, yo ucan run the program simply like this:

sudo node AdjustProjectfile.js

It will first identify the internal NEEO project-file that is in use, makes a backup of it in the current directory (thats why you need write access to it).
Then it finds all device names that are in use and compares each of them with all device names that end with " (2)". 
If it find a matching pair, in the example "Kodi (192.168.0.47)" and "Kodi (192.168.0.47) (2)", it uses that pair of devices to determine the potential "old and new SDK-designations".
In the situation where it finds multiple matching device name pairs, it will abort, as it doesn't know which pair is the right one.
If only one pair is found, it "knows" the "old designations" for Source- & Adaptername, by looking at whats used by "Kodi (192.168.0.47)".
The new designations are obtained from "Kodi (192.168.0.47) (2)".
It then does a change from all old designations into the new ones in the project-file it has identified and writes that back to the NEEO directory (/steady/neeo/cp6).
Then simply restart your brain and you should be all set to use the new adapter. 
You can then delete the temporary created device driver ("Kodi (192.168.0.47) (2)") as it has served its purpose and is no longer necessary.

## Why do we need to do this???

When running an application (like f.e. meta) as Docker container, it is common practice to consider the container as disposable.
This means that the container has to have a strict separation between code and data. 
Just delete the container and start it again, on another host if necessary.
Not a problem with Docker, but we've learned that NEEO somehow assigns a Source-name and Adapter name to every new system that connects to NEEO.
Now the Docker-container isn't new, it has all the data to function properly, but NEEO just has given it new designation. 

And THAT's the problem: all the drivers that are known to NEEO, simply point to the old designation. When you start them, NEEO sees that the old adapter hasn't connected and discards the requests to it.

This module replaces all references to the old designations with references to the new ones.