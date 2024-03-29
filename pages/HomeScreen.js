//This is heavily based on example code from
//https://aboutreact.com/react-native-navigation-drawer/

import React, { Component } from 'react';
import { View, RefreshControl } from 'react-native';
import { Auth } from 'aws-amplify';
import gql from 'graphql-tag';
import { FlatList } from 'react-navigation';
import { ListItem, Text, Button } from 'react-native-elements';
import { getCoursesByTeacherId } from '../src/graphql/queries';
import { client } from '../App';
import Icon from 'react-native-vector-icons/Entypo';

export default class HomeScreen extends Component {

  state = {
    courses: [],
    refreshing: false
  }

  componentWillMount() {
    this.fetchCourses();
  }

  fetchCourses(cache = "cache-first") {
    Auth.currentAuthenticatedUser().then(user => {
      client.query({
        query: gql(getCoursesByTeacherId),
        variables: {
          teacherId: user.username
        },
        fetchPolicy: cache
      }).then((data) => {
        this.setState({
          courses: data.data.getCoursesByTeacherId.map(({id, name}) => ({id, name}))
        });
      }).catch((e) => {
        console.log(e);
      });
    });
  }

  renderItem = ({ item }) => (
    <ListItem 
      title={item.name}
      onPress={() => this.props.navigation.navigate('Details', { courseId: item.id })}
      bottomDivider
      chevron
    />
  )

  keyExtractor = (item, index) => index.toString()

  render() {
    const { courses } = this.state;

    return (
      <View>
        {/* {(courses && courses.length === 0) ? <Text> Add a course to get started</Text> : <Text></Text>} */}
        <FlatList
          data={courses}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={      
            <View>
              <Text h5>Add a course then refresh to get started!</Text>
              <Button 
                title="Refresh" 
                onPress={() => this.fetchCourses("network-only")}
                icon={<Icon name="cycle" color="white" size={18} />}
                />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.fetchCourses("network-only")}
            />
          }
          />
      </View>
    );
  }
}
