import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
const Item = ({ title }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
  const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];

const DailyReads = ({ navigation }: Props) => {
    const renderDailyReadItem = ({ item }) => (
        <Item title={item.title} />
      );
    return (
        <>
            <View style={{padding:15,backgroundColor:'#EEE'}}>
            <Text>Daily Reads</Text>
            <FlatList
              data={DATA}
              horizontal
              renderItem={renderDailyReadItem}
              keyExtractor={item => item.id}
            />
          </View>
        </>
    );
};

export default DailyReads;
const styles = StyleSheet.create({
    item: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 32,
    },
  });