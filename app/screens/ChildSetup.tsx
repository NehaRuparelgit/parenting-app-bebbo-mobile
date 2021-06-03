
import { StackNavigationProp } from '@react-navigation/stack';
import React, { createRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import ChildDate from '../components/ChildDate';
import { RootStackParamList } from '../navigation/types';
import { Header, Container, HeaderText, Header2Text } from '../styles/style';
import ActionSheet from "react-native-actions-sheet";

type ChildSetupNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChildSetupList'
>;

type Props = {
  navigation: ChildSetupNavigationProp;
};


const ChildSetup = ({ navigation }: Props) => {
  const [relationship, setRelationship] = useState('');
  const genders = ['Father', 'Mother', 'Other'];
  const actionSheetRef = createRef();
  return (
    <>
      <Container>
        <View>

          <Header>
            <HeaderText>Please take a moment to personalize your app</HeaderText>
          </Header>
          <ChildDate />
          <Text>Relationship with child</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 3, backgroundColor: 'gray' }}>
              <Pressable
                onPress={() => {
                  actionSheetRef.current?.setModalVisible();
                }}
              >
                <Header2Text>{relationship ? relationship : 'Select'}</Header2Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, backgroundColor: 'green' }}>
              <Text> Arrow</Text>
            </View>
          </View>
            <ActionSheet ref={actionSheetRef}>
              <View>
              {
              genders.map((item,index) => {
                return(
                  <View key={index}>
                <Pressable
                  onPress={() => {
                    setRelationship(item);
                    actionSheetRef.current?.hide();
                  }}>
                  <Header2Text>{item}</Header2Text>
                </Pressable>
                </View>
                )
              })
            }
              </View>
          </ActionSheet>
          <Button
            title="Continue & Go to Home"
            onPress={() => navigation.navigate('HomeDrawerNavigator')}
          />
        </View>
          <Button
            title="Continue & Go to Home"
            onPress={() => navigation.navigate('ChildSetupList')}
          />
       

      </Container>
    </>
  );
};

export default ChildSetup;
