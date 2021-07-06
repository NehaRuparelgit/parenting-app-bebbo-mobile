import { dailyHomeNotificationdata } from '@assets/translations/appOfflineData/dailyHomeNotification';
import useToGetOfflineData from '@assets/translations/appOfflineData/useToGetOfflineData';
import { BgPrimary } from '@components/shared/BackgroundColors';
import { MainContainer } from '@components/shared/Container';
import { Flex1, FlexDirRowStart } from '@components/shared/FlexBoxStyle';
import Icon, { OuterIconLeft, OuterIconRow } from '@components/shared/Icon';
import { useFocusEffect } from '@react-navigation/native';
import { Heading3Regularw, ShiftFromTopBottom10 } from '@styles/typography';
import { DateTime } from 'luxon';
import React, { Suspense, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../App';
import { dataRealmCommon } from '../../database/dbquery/dataRealmCommon';
import { ConfigSettingsEntity, ConfigSettingsSchema } from '../../database/schema/ConfigSettingsSchema';
import {
  DailyHomeMessagesEntity,
  DailyHomeMessagesSchema
} from '../../database/schema/DailyHomeMessagesSchema';
import { setDailyMessagesData } from '../../redux/reducers/utilsSlice';
const DailyHomeNotification = () => {
  const [notification, setNotification] = useState<any>('');
  const dispatch = useAppDispatch();
  const languageCode = useAppSelector(
    (state: any) => state.selectedCountry.languageCode,
  );
  const currentNotification = useAppSelector(
    (state: any) => state.variableData.dailyNotification,
  );
console.log('currentNotification',currentNotification);
  const getNotification = async() => {
    let currentDate = DateTime.local();
    if (currentNotification) {
       // CHECK IF DAILY MESSAGE VARIABLE NEEDS TO BE UPDATED
      if(currentNotification.day != currentDate.day
      || currentNotification.month != currentDate.month
      || currentNotification.year != currentDate.year){
        const currentMessageIndex = records.findIndex((item:any)=> item.id === currentNotification.messageId);
         // Set next daily message
         let newNotification ={
          messageId: records[currentMessageIndex+1].id,
          messageText: records[currentMessageIndex+1].title,
          day: currentDate.day,
          month: currentDate.month,
          year: currentDate.year,
        }
        let updateNotifcation = await dataRealmCommon.updateSettings<ConfigSettingsEntity>(ConfigSettingsSchema, "dailyNotification",JSON.stringify(newNotification));

        return newNotification;
      }
    } else {
      console.log('DAILY MESSAGE VARIABLE WAS NEVER SET')
      let firstNotification ={
        messageId: records[0].id,
        messageText: records[0].title,
        day: currentDate.day,
        month: currentDate.month,
        year: currentDate.year,
      }
      console.log(firstNotification);
      let updateNotifcation = await dataRealmCommon.updateSettings<ConfigSettingsEntity>(ConfigSettingsSchema, "dailyNotification",JSON.stringify(firstNotification));

      return firstNotification;
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      getNotification();
      async function fetchData() {
        let Entity: any;
        // Entity = Entity as DailyHomeMessagesEntity
        const dailyNotiData = await useToGetOfflineData(
          languageCode,
          dispatch,
          DailyHomeMessagesSchema,
          Entity as DailyHomeMessagesEntity,
          dailyHomeNotificationdata,
          setDailyMessagesData,
          'id',
        );
      }
      console.log(currentNotification,"currentNotification");
      setNotification(currentNotification);
      console.log(notification,"notification");
      fetchData();
    }, [languageCode]),
  );
  const records = useAppSelector((state: any) => state.utilsData.dailymessages);

  // console.log(records);
  return (
    <>
      <Suspense fallback={<ActivityIndicator />}>
        <BgPrimary>
          <MainContainer>
            <ShiftFromTopBottom10>
              <FlexDirRowStart>
                <OuterIconRow>
                  <OuterIconLeft>
                    <Icon name="ic_sb_loveapp" size={24} color="#fff" />
                  </OuterIconLeft>
                </OuterIconRow>
                <Flex1>
                  <Heading3Regularw>
                    {notification?.messageText}
                  </Heading3Regularw>
                </Flex1>
              </FlexDirRowStart>
            </ShiftFromTopBottom10>
          </MainContainer>
        </BgPrimary>
      </Suspense>
    </>
  );
};

export default DailyHomeNotification;
