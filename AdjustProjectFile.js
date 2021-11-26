const sdkadapter = require('/steady/neeo/cp6/sdkadapter.json');
const fs = require('fs');
var discoveryBuffer = __dirname + '/resultsDiscovery.json';
const path = require('path');
const {JSONPath} = require('jsonpath-plus');
var ProjectFileName;
var ProjectJSON, RawProjectJSON;
var OldSource;
var OldAdapter;
var NewSource;
var NewAdapter;
var DeviceDrivers; 
var NewJson;


function Read_SDKAdapter()
{
var MySdkAdapter = sdkadapter;
}

function FindLatestProjectFileName(Directory){
    var filter = /^project-home.+json$/;
    var Result = "";
    var files = fs.readdirSync(Directory);
    
        files.forEach(function (file, index) {
            var fromPath = path.join(Directory, file);
            if (filter.test(file)) {
                console.log("file",file);
                Result = file;
                }
            });
    return Result;

}
function Read_Projectfile(FileName) {
    console.log("Reading latest project-home file:",FileName);
    data = fs.readFileSync("/steady/neeo/cp6/"+ FileName);
    return   data;
}

function Backup_Projectfile(Filename,Content) {

   var BackupFilename = __dirname + "/"+ Filename + '.bkp'
   if (fs.existsSync(BackupFilename)) {
       console.log("Backup-file already exists, not overwriting it")
       return true;
   }

   try {
        fs.writeFileSync(BackupFilename, Content);
    }
    catch (err) 
        {console.log("Error creating backup, aborting",err);
        return false;
    }
        return true;


}

function GetAllDeviceDrivers(ProjectJSON) {
    var PossibleDups = [];
    var filter = / \(2\)$/
    NewJson = JSON.stringify(ProjectJSON)   // prepare a new JSON-structure that can be modified and written out 

    DeviceDrivers = JSONPath({path: "$.project.rooms.*.devices.*", json: ProjectJSON});
    var SplitOn = " (2)"
    console.log("")
    console.log("Overview of all custom drivers:")
    for(var i = 0; i < DeviceDrivers.length; i++) 
        if (DeviceDrivers[i].details.sourceName.substring(0,4)=="src-"){
            console.log("Driver: ",DeviceDrivers[i].name,DeviceDrivers[i].details.sourceName,DeviceDrivers[i].details.adapterName)
            if (filter.test(DeviceDrivers[i].name))  // IS this the "Duplicate devicedriver" we are looking for
                PossibleDups.push({name:DeviceDrivers[i].name,sourceName:DeviceDrivers[i].details.sourceName,adapterName:DeviceDrivers[i].details.adapterName})
        };
        console.log("")

        if (!PossibleDups.length)
        {console.log("We cannot find a duplicate device-driver (marked by '"+SplitOn+"' at the end of it's name; aborting")
        throw "Error"
        }
    let FoundOne = 0;
    for(var New = 0; New < PossibleDups.length; New++) {
        let LookforName = PossibleDups[New].name.split(SplitOn)[0]
        console.log("Possible new driver name:",PossibleDups[New].name,"Checking if we have a matching driver with name",LookforName)
        for(var Old = 0; Old < DeviceDrivers.length; Old++) {
            if (LookforName==DeviceDrivers[Old].name) {
                if (DeviceDrivers[Old].details.sourceName != PossibleDups[New].sourceName||DeviceDrivers[Old].details.adapterName!=PossibleDups[New].adapterName)
                    {console.log("Yes, we have a matching device driver and it has different source/adaptername");
                    MakeChanges(ProjectFileName,ProjectJSON,DeviceDrivers[Old],PossibleDups[New])
                    FoundOne++;
                    }
                else
                    console.log("Yes, we have a maching pair, but it has already been updated; you can safely remove this duplicate device name");
                console.log("")

            }
        }
    }
                
    if (!FoundOne) {
        console.log("Nothing we can do right now")
        return false
    }
    else {console.log("We are good to go!")
        return true
    }

}

function MakeChanges(FileName,ProjectJSON,OldDeviceDriver,PossibleDup) {
    var OldSource_term = new RegExp(OldDeviceDriver.details.sourceName, "g");
    var OldAdapter_term = new RegExp(OldDeviceDriver.details.adapterName, "g");

    if (OldDeviceDriver.details.sourceName!=PossibleDup.sourceName)
        console.log("replacing",OldDeviceDriver.details.sourceName,"into", PossibleDup.sourceName)
    console.log("replacing",OldDeviceDriver.details.adapterName,"into",PossibleDup.adapterName)


    NewJson = NewJson.replace(OldSource_term,PossibleDup.sourceName) 
    NewJson = NewJson.replace(OldAdapter_term,PossibleDup.adapterName) 

}
function Write_NewProjectFile(FileName,NewJson) {

    let NewFileName = "/steady/neeo/cp6/"+ FileName;
    console.log("And writing contents to file",NewFileName)

    try {
        fs.writeFileSync(NewFileName, NewJson)
    }
    catch (err) {
        console.log("Error writing file ",NewFileName,"aborting",err);
        return false}

    console.log("Outputfile written:",NewFileName);
    return true         

}

function MyMain() {
    ProjectFileName = FindLatestProjectFileName("/steady/neeo/cp6");
    if (ProjectFileName) {
        ProjectJSON = Read_Projectfile(ProjectFileName)   
        if (!Backup_Projectfile(ProjectFileName,ProjectJSON)) 
            console.log("Error creating backup, aborting")
        else
            {ProjectJSON = JSON.parse(ProjectJSON);
            if (GetAllDeviceDrivers(ProjectJSON))
                Write_NewProjectFile(ProjectFileName,NewJson)
        }
    }



}

MyMain();

