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


function Read_SDKAdapter()
{
var MySdkAdapter = sdkadapter;
}
//"^The"
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

function Backup_Projectfile(Filename,Content,suffix) {

   var BackupFilename = __dirname + "/"+ Filename + '.bkp'
    try {
        fs.writeFileSync(BackupFilename, Content);
    }
    catch (err) 
        {console.log("Error creating backuop, aborting",err);
        return false;
    }
        return true;


}

function GetAllDeviceDrivers(ProjectJSON) {
    var PossibleDups = [];
    var filter = / \(2\)$/
    DeviceDrivers = JSONPath({path: "$.project.rooms.*.devices.*", json: ProjectJSON});
    var SplitOn = " (2)"

    for(var i = 0; i < DeviceDrivers.length; i++) {
            var bb = { name:DeviceDrivers[i],sourceName:DeviceDrivers[i].details.sourceName,adapterName:DeviceDrivers[i].details.adapterName}
//            console.log(bb);
            if (filter.test(DeviceDrivers[i].name))  // IS this the "Duplicate devicedriver" we are looking for
                PossibleDups.push({name:DeviceDrivers[i].name,sourceName:DeviceDrivers[i].details.sourceName,adapterName:DeviceDrivers[i].details.adapterName})
    };
    console.log(PossibleDups)
    if (!PossibleDups.length)
        {console.log("We cannot find a duplicate device-driver (marked by '"+SplitOn+"' at the nend of it;s name; aborting")
        throw "Error"
        }
    let FoundOne = 0;
    for(var New = 0; New < PossibleDups.length; New++) {
        let LookforName = PossibleDups[New].name.split(SplitOn)[0]
        for(var Old = 0; Old < DeviceDrivers.length; Old++) {
            if (LookforName==DeviceDrivers[Old].name) {
                console.log("We have a matching device driver:",PossibleDups[New],  "and", { name:DeviceDrivers[Old].name,sourceName:DeviceDrivers[Old].details.sourceName,adapterName:DeviceDrivers[Old].details.adapterName})
                if (!FoundOne) {
                    OldSource = DeviceDrivers[Old].details.sourceName;
                    OldAdapter = DeviceDrivers[Old].details.adapterName
                    NewSource = PossibleDups[New].sourceName
                    NewAdapter = PossibleDups[New].adapterName
                } 
                else    
                    if (OldSource != DeviceDrivers[Old].details.sourceName ||
                        OldAdapter != DeviceDrivers[Old].details.adapterName ||
                        NewSource != PossibleDups[New].sourceName ||
                        NewAdapter != PossibleDups[New].adapterName) {
                            console.log("We have multiple duplicate names, but with different adapterID's.... aborting")
                            throw "Error"
                        }                    
                FoundOne++;
            }
        }
    }
    if (!FoundOne) {
        console.log("No matching device driver:")
        return false
    }
    else if (FoundOne>1) {
        console.log("We have multiple matching device drivers")
        return false
        }
    else {console.log("We are good to go!")
        return true
    }

}

function MakeChanges(FileName,ProjectJSON) {
    var NewJson = JSON.stringify(ProjectJSON)
    var OldSource_term = new RegExp(OldSource, "g");
    var OldAdapter_term = new RegExp(OldAdapter, "g");

    console.log("replacing",OldSource,"into", NewSource)
    console.log("replacing",OldAdapter,"into",NewAdapter)
    console.log("Before change ",
    ProjectJSON.project.rooms["Laptop"].devices["Kodi (TonO-Macbook.local)"].name, 
    ProjectJSON.project.rooms["Laptop"].devices["Kodi (TonO-Macbook.local)"].details.sourceName,
    ProjectJSON.project.rooms["Laptop"].devices["Kodi (TonO-Macbook.local)"].details.adapterName)
    NewJson = NewJson.replace(OldSource_term,NewSource) 
    NewJson = NewJson.replace(OldAdapter_term,NewAdapter) 

    let NewFileName = "/steady/neeo/cp6/"+ FileName;
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
    }
    ProjectJSON = JSON.parse(ProjectJSON);
    if (GetAllDeviceDrivers(ProjectJSON))
        MakeChanges(ProjectFileName,ProjectJSON)
    



}

MyMain();

