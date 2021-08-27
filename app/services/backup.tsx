import { googleAuth } from "./googleAuth";
import { googleDrive } from "./googleDrive";
import RNFS from 'react-native-fs';
import { backupGDriveFileName,backupGDriveFolderName} from "@assets/translations/appOfflineData/apiConstants";
import { userRealmCommon } from "../database/dbquery/userRealmCommon";
import { dataRealmCommon } from "../database/dbquery/dataRealmCommon";
import { ConfigSettingsEntity, ConfigSettingsSchema } from "../database/schema/ConfigSettingsSchema";
import { addPrefixForAndroidPaths, getAllChildren, setActiveChild } from "./childCRUD";
import { ChildEntity, ChildEntitySchema } from "../database/schema/ChildDataSchema";
import { Child } from "../interface/interface";
import { DateTime } from "luxon";

/**
 * Export / import user realm to GDrive in order to create backup.
 */
class Backup {
    private static instance: Backup;

    private constructor() {}

    static getInstance(): Backup {
        if (!Backup.instance) {
            Backup.instance = new Backup();
        }
        return Backup.instance;
    }

    public async export(): Promise<boolean> {
        const tokens = await googleAuth.getTokens();

        // Sign in if neccessary
        if (!tokens) {
            const user = await googleAuth.signIn();
            if (!user) return false;
        }

        // Get userRealmPath
        const userRealmPath = userRealmCommon.realm?.path;
        console.log(userRealmPath,"..userRealmPath")
        if (!userRealmPath) return false;
      
        // Get realmContent
        const realmContent = await RNFS.readFile(userRealmPath, 'base64');
         console.log(realmContent,"..11realmContent")
        // Get backupFolderId
        let backupFolderId = await googleDrive.safeCreateFolder({
            name: backupGDriveFolderName,
            parentFolderId: 'root'
        });
       
        if (backupFolderId instanceof Error) {
            console.log(backupFolderId,"..backupFolderId..")
            return false;
        }

        // Get backup file ID if exists on GDrive
        let backupFileId: string | null = null;

        const backupFiles = await googleDrive.list({
            filter: `trashed=false and (name contains '${backupGDriveFileName}') and ('${backupFolderId}' in parents)`,
        });
        console.log(backupFiles,"..backupFiles")
        if (Array.isArray(backupFiles) && backupFiles.length > 0) {
            backupFileId = backupFiles[0].id;
        }

        // Delete backupFileId
        if (backupFileId) {
            await googleDrive.deleteFile(backupFileId);
        }

        // Create file on gdrive
        const response = await googleDrive.createFileMultipart({
            name: backupGDriveFileName,
            content: realmContent,
            contentType: 'application/realm',
            parentFolderId: backupFolderId,
            isBase64: true,
        });

        if (typeof response !== 'string') {
            // utils.setMyDebbugTxt(response.message);
            return false;
        }

        return true;
    }
  

    public async import(navigation:any,langCode:any,dispatch:any,child_age:any): Promise<void|Error> {
        
        const tokens = await googleAuth.getTokens();

        // Sign in if neccessary
        if (!tokens) {
            const user = await googleAuth.signIn();
            console.log(user,"..backupFiles")
            if (!user) return new Error('loginCanceled');
        }

        // Get backupFolderId
        let backupFolderId = await googleDrive.safeCreateFolder({
            name: backupGDriveFolderName,
            parentFolderId: 'root'
        });
         console.log(backupFolderId,"..backupFolderId..")
        if (backupFolderId instanceof Error) {
            return new Error('Backup folder doesnt exist on GDrive');
        }

        // Get backup file ID if exists on GDrive
        let backupFileId: string | null = null;

        const backupFiles = await googleDrive.list({
            filter: `trashed=false and (name contains '${backupGDriveFileName}') and ('${backupFolderId}' in parents)`,
        });
        console.log(backupFiles,"..backupFiles")
       
        if (Array.isArray(backupFiles) && backupFiles.length > 0) {
            backupFileId = backupFiles[0].id;
        }
        console.log(backupFileId,"..backupFileId")
        if (!backupFileId) {
            return new Error("..Error coming..");
        }

        // Close user realm
        userRealmCommon.closeRealm();

        // Download file from GDrive
       const downloadres= await googleDrive.download({
            fileId: backupFileId,
            filePath: RNFS.DocumentDirectoryPath + '/' + 'user.realm',
        });
        console.log(downloadres,"..downloadres..")
        // Open user realm
        await userRealmCommon.openRealm();
        let allChildren=await getAllChildren(dispatch,child_age);
        console.log(allChildren,"..allChildren..")
        let childId = await dataRealmCommon.getFilteredData<ConfigSettingsEntity>(ConfigSettingsSchema, "key='currentActiveChildId'");
        let allChildrenList: Child[] = [];
        if (allChildren) {
            allChildrenList = allChildren?.map((child:any) => {
                let birthDay = child.birthDate ?
                    DateTime.fromJSDate(child.birthDate).toFormat("dd'.'MM'.'yyyy") : "";
                let imgUrl = child.photoUri ? addPrefixForAndroidPaths(`${RNFS.DocumentDirectoryPath}/${child.photoUri}`) : null;
                let isCurrentActive = false;
                if (childId?.length > 0) {
                    childId = childId[0].value;
                    if (childId === child.uuid) {
                        setActiveChild(langCode, child.uuid, dispatch, child_age);
                        isCurrentActive = true;
                    }
                };
console.log({
    childId: child.uuid,
    birthDay: birthDay,
    name: child.name,
    photo: imgUrl,
    gender: child.gender,
    isCurrentActive: isCurrentActive,
    id: child.uuid,
},"1111")
                return {
                    childId: child.uuid,
                    birthDay: birthDay,
                    name: child.name,
                    photo: imgUrl,
                    gender: child.gender,
                    isCurrentActive: isCurrentActive,
                    id: child.uuid,
                };
            });
        };
        navigation.navigate('LoadingScreen', {
            apiJsonData:[], 
            prevPage: 'ImportScreen'
        });
        // let allJsonDatanew = await userRealmCommon.getData<ChildEntity>(ChildEntitySchema);
        // allJsonDatanew.map((item:any)=>{
        //     console.log(item,"..1111111item..");

        // })
        // console.log(,"..allJsonDatanew..")
        // const allChildren:any =getAllChildren();
        // Set current child to first child
        // const allChildren:any = userRealmCommon.getAllChildren();
        // if (allChildren) {
        //     let currentActiveChildId = await dataRealmCommon.updateSettings<ConfigSettingsEntity>(ConfigSettingsSchema, "currentActiveChildId",  allChildren[0].id);
   
        // }

        return;
    }
}

export const backup = Backup.getInstance();